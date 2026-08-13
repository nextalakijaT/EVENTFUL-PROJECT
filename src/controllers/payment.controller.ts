import { Request, Response } from 'express';
import crypto from 'crypto';
import { Event } from '../models/Event';
import { Ticket } from '../models/Ticket';
import { User } from '../models/User';
import { Reminder } from '../models/Reminder';
import { initializeTransaction } from '../services/paystack.service';
import { env } from '../config/env';
import { AuthRequest } from '../middlewares/auth';
import { generateTicketQRCode } from '../utils/qr';

export async function initiatePurchase(req: AuthRequest, res: Response) {
  try {
    const { eventId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.ticketsSold >= event.capacity) {
      return res.status(400).json({ message: 'Event is sold out' });
    }

    const user = await User.findById(req.user!.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reference = `evt_${eventId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const ticket = await Ticket.create({
      event: event._id,
      eventee: user._id,
      amount: event.price,
      status: 'pending',
      paystackReference: reference,
    });

    const paystackData = await initializeTransaction({
      email: user.email,
      amount: event.price,
      reference,
      metadata: { ticketId: ticket._id.toString(), eventId: event._id.toString() },
    });

    res.status(200).json({
      message: 'Payment initialized',
      authorizationUrl: paystackData.authorization_url,
      reference,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to initiate purchase', error: (err as Error).message });
  }
}

// SOURCE OF TRUTH for payment confirmation — not the browser redirect.
// Paystack calls this server-to-server, so it works even if the user
// closes their browser before the redirect fires.
export async function handlePaystackWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const hash = crypto
      .createHmac('sha512', env.paystackSecretKey)
      .update(req.body) // raw bytes — see app.ts routing note
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === 'charge.success') {
      const reference = event.data.reference;

      const ticket = await Ticket.findOne({ paystackReference: reference });
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found for reference' });
      }

      if (ticket.status === 'paid') {
        // Paystack can resend webhooks — this makes reprocessing a no-op
        return res.status(200).json({ message: 'Already processed' });
      }

      ticket.status = 'paid';

      const { token, image } = await generateTicketQRCode(ticket._id.toString(), ticket.event.toString());
      ticket.qrCodeToken = token;
      ticket.qrCodeImage = image;

      await ticket.save();

      const eventDoc = await Event.findByIdAndUpdate(
        ticket.event,
        { $inc: { ticketsSold: 1 } },
        { new: true }
      );

      // auto-schedule the creator's default reminder for this attendee
      if (eventDoc) {
        const fireAt = new Date(eventDoc.date.getTime() - eventDoc.reminderOffsetHours * 60 * 60 * 1000);
        if (fireAt > new Date()) {
          await Reminder.create({
            ticket: ticket._id,
            user: ticket.eventee,
            event: eventDoc._id,
            fireAt,
            source: 'creator-default',
          });
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    res.status(500).json({ message: 'Webhook processing failed', error: (err as Error).message });
  }
}

export async function getMyTickets(req: AuthRequest, res: Response) {
  try {
    const tickets = await Ticket.find({ eventee: req.user!.userId })
      .populate('event', 'title date venue')
      .sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tickets', error: (err as Error).message });
  }
}