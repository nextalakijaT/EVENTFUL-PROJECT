import { Response } from 'express';
import { Reminder } from '../models/Reminder';
import { Ticket } from '../models/Ticket';
import { Event } from '../models/Event';
import { AuthRequest } from '../middlewares/auth';

export async function createCustomReminder(req: AuthRequest, res: Response) {
  try {
    const { ticketId, hoursBeforeEvent } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.eventee.toString() !== req.user!.userId) {
      return res.status(403).json({ message: 'This is not your ticket' });
    }

    const event = await Event.findById(ticket.event);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const fireAt = new Date(event.date.getTime() - hoursBeforeEvent * 60 * 60 * 1000);
    if (fireAt <= new Date()) {
      return res.status(400).json({ message: 'That reminder time has already passed' });
    }

    const reminder = await Reminder.create({
      ticket: ticket._id,
      user: req.user!.userId,
      event: event._id,
      fireAt,
      source: 'eventee-custom',
    });

    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create reminder', error: (err as Error).message });
  }
}

export async function getMyReminders(req: AuthRequest, res: Response) {
  try {
    const reminders = await Reminder.find({ user: req.user!.userId })
      .populate('event', 'title date venue')
      .sort({ fireAt: 1 });
    res.status(200).json(reminders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reminders', error: (err as Error).message });
  }
}