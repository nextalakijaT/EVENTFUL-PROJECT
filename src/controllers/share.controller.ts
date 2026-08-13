import { Request, Response } from 'express';
import { Event } from '../models/Event';
import { env } from '../config/env';

export async function resolveShortLink(req: Request, res: Response) {
  try {
    const event = await Event.findOne({ shortId: req.params.shortId });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    return res.redirect(`${env.clientUrl}/events/${event._id}`);
  } catch (err) {
    res.status(500).json({ message: 'Failed to resolve link', error: (err as Error).message });
  }
}

export async function getShareMetadata(req: Request, res: Response) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.status(200).json({
      title: event.title,
      description: event.description,
      image: event.imageUrl || null,
      date: event.date,
      venue: event.venue,
      shareUrl: `${env.clientUrl}/e/${event.shortId}`,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get share metadata', error: (err as Error).message });
  }
}