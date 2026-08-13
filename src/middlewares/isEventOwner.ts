import { Response, NextFunction } from 'express';
import { Event } from '../models/Event';
import { AuthRequest } from './auth';

export async function isEventOwner(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.createdBy.toString() !== req.user?.userId) {
      return res.status(403).json({ message: 'You do not own this event' });
    }
    (req as any).event = event;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Ownership check failed', error: (err as Error).message });
  }
}