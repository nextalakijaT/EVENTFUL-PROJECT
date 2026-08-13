import { Response } from 'express';
import mongoose from 'mongoose';
import { Event } from '../models/Event';
import { Ticket } from '../models/Ticket';
import { AuthRequest } from '../middlewares/auth';
import { getCache, setCache } from '../services/cache.service';

export async function getOverallAnalytics(req: AuthRequest, res: Response) {
  try {
    const creatorId = req.user!.userId;
    const cacheKey = `analytics:overall:${creatorId}`;

    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json({ ...(cached as object), fromCache: true });

    const creatorObjectId = new mongoose.Types.ObjectId(creatorId);

    const events = await Event.find({ createdBy: creatorObjectId }).select('_id');
    const eventIds = events.map((e) => e._id);

    const [totals] = await Ticket.aggregate([
      { $match: { event: { $in: eventIds } } },
      {
        $group: {
          _id: null,
          totalTicketsSold: { $sum: { $cond: [{ $in: ['$status', ['paid', 'used']] }, 1, 0] } },
          totalScanned: { $sum: { $cond: [{ $eq: ['$status', 'used'] }, 1, 0] } },
          totalRevenue: { $sum: { $cond: [{ $in: ['$status', ['paid', 'used']] }, '$amount', 0] } },
        },
      },
    ]);

    const result = {
      totalEvents: events.length,
      totalTicketsSold: totals?.totalTicketsSold || 0,
      totalScanned: totals?.totalScanned || 0,
      totalRevenue: totals?.totalRevenue || 0,
    };

    await setCache(cacheKey, result, 120);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: (err as Error).message });
  }
}

export async function getEventAnalytics(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ message: 'You do not own this event' });
    }

    const cacheKey = `analytics:event:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json({ ...(cached as object), fromCache: true });

    const [stats] = await Ticket.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          ticketsSold: { $sum: { $cond: [{ $in: ['$status', ['paid', 'used']] }, 1, 0] } },
          scanned: { $sum: { $cond: [{ $eq: ['$status', 'used'] }, 1, 0] } },
          revenue: { $sum: { $cond: [{ $in: ['$status', ['paid', 'used']] }, '$amount', 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        },
      },
    ]);

    const result = {
      eventTitle: event.title,
      capacity: event.capacity,
      ticketsSold: stats?.ticketsSold || 0,
      scanned: stats?.scanned || 0,
      revenue: stats?.revenue || 0,
      pending: stats?.pending || 0,
      attendanceRate: stats?.ticketsSold ? ((stats.scanned / stats.ticketsSold) * 100).toFixed(1) + '%' : '0%',
    };

    await setCache(cacheKey, result, 120);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch event analytics', error: (err as Error).message });
  }
}