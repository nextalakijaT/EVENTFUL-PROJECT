import { Response } from 'express';
import { Event } from '../models/Event';
import { AuthRequest } from '../middlewares/auth';
import { getCache, setCache, deleteCacheByPattern, deleteCache } from '../services/cache.service';

export async function createEvent(req: AuthRequest, res: Response) {
  try {
    const { title, description, date, venue, price, capacity, reminderOffsetHours } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      price,
      capacity,
      reminderOffsetHours,
      createdBy: req.user!.userId,
    });

    await deleteCacheByPattern('events:list:*');

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create event', error: (err as Error).message });
  }
}

export async function getAllEvents(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const cacheKey = `events:list:page:${page}:limit:${limit}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ ...cached, fromCache: true });
    }

    const events = await Event.find()
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Event.countDocuments();
    const result = { events, page, totalPages: Math.ceil(total / limit), total };

    await setCache(cacheKey, result);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events', error: (err as Error).message });
  }
}

export async function getEventById(req: AuthRequest, res: Response) {
  try {
    const cacheKey = `event:${req.params.id}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ ...(cached as object), fromCache: true });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    await setCache(cacheKey, event);

    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch event', error: (err as Error).message });
  }
}

export async function getMyEvents(req: AuthRequest, res: Response) {
  try {
    const events = await Event.find({ createdBy: req.user!.userId }).sort({ date: 1 });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your events', error: (err as Error).message });
  }
}

export async function updateEvent(req: AuthRequest, res: Response) {
  try {
    const event = (req as any).event;
    Object.assign(event, req.body);
    await event.save();

    await deleteCache(`event:${event._id}`);
    await deleteCacheByPattern('events:list:*');

    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update event', error: (err as Error).message });
  }
}

export async function deleteEvent(req: AuthRequest, res: Response) {
  try {
    const event = (req as any).event;
    const eventId = event._id;
    await event.deleteOne();

    await deleteCache(`event:${eventId}`);
    await deleteCacheByPattern('events:list:*');

    res.status(200).json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete event', error: (err as Error).message });
  }
}