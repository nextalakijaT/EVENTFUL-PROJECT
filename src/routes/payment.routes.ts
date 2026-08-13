import { Router } from 'express';
import express from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { paymentLimiter } from '../middlewares/rateLimiter';
import { initiatePurchase, handlePaystackWebhook, getMyTickets } from '../controllers/payment.controller';

const router = Router();

/**
 * @openapi
 * /payments/purchase:
 *   post:
 *     tags: [Payments]
 *     summary: Initiate a ticket purchase (eventee only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [eventId]
 *             properties:
 *               eventId: { type: string }
 *     responses:
 *       200: { description: Paystack authorization URL returned }
 *       400: { description: Event sold out }
 *       404: { description: Event not found }
 */
router.post('/purchase', express.json(), authenticate, authorize('eventee'), paymentLimiter, initiatePurchase);

/**
 * @openapi
 * /payments/my-tickets:
 *   get:
 *     tags: [Payments]
 *     summary: Get all tickets purchased by the logged-in eventee
 *     responses:
 *       200: { description: List of tickets }
 */
router.get('/my-tickets', authenticate, authorize('eventee'), getMyTickets);

/**
 * @openapi
 * /payments/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Paystack webhook (server-to-server only, not called by users)
 *     security: []
 *     responses:
 *       200: { description: Webhook processed }
 *       401: { description: Invalid signature }
 */
router.post('/webhook', express.raw({ type: 'application/json' }), handlePaystackWebhook);

export default router;