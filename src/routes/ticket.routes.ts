import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { scanTicket } from '../controllers/ticket.controller';

const router = Router();

/**
 * @openapi
 * /tickets/scan:
 *   post:
 *     tags: [Tickets]
 *     summary: Scan a ticket's QR token to verify and grant entry (creator only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string, description: The signed JWT encoded in the ticket's QR code }
 *     responses:
 *       200: { description: Entry granted }
 *       401: { description: Invalid or tampered QR code }
 *       403: { description: Not the owner of this event }
 *       409: { description: Ticket already scanned }
 */
router.post('/scan', authenticate, authorize('creator'), scanTicket);

export default router;