import { Response } from 'express';
import { Ticket } from '../models/Ticket';
import { Event } from '../models/Event';
import { verifyTicketToken } from '../utils/qr';
import { AuthRequest } from '../middlewares/auth';

export async function scanTicket(req: AuthRequest, res: Response) {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'QR token is required' });

    // step 1: verify signature — catches forged/tampered tokens
    let decoded;
    try {
      decoded = verifyTicketToken(token);
    } catch {
      return res.status(401).json({ message: 'Invalid or tampered QR code' });
    }

    // step 2: confirm the ticket exists
    const ticket = await Ticket.findById(decoded.ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // step 3: only the creator who owns this event can scan its tickets
    const event = await Event.findById(ticket.event);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.createdBy.toString() !== req.user!.userId) {
      return res.status(403).json({ message: 'You do not own this event' });
    }

    // step 4: check ticket state — this is what prevents reuse
    if (ticket.status === 'used') {
      return res.status(409).json({ message: 'Ticket already scanned', usedAt: ticket.usedAt });
    }
    if (ticket.status !== 'paid') {
      return res.status(400).json({ message: `Ticket is not valid for entry (status: ${ticket.status})` });
    }

    // step 5: one-time-use flip
    ticket.status = 'used';
    ticket.usedAt = new Date();
    await ticket.save();

    res.status(200).json({ message: 'Ticket verified — entry granted', ticket });
  } catch (err) {
    res.status(500).json({ message: 'Scan failed', error: (err as Error).message });
  }
}