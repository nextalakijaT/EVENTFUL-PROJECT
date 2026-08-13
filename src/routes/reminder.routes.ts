import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { createCustomReminder, getMyReminders } from '../controllers/reminder.controller';

const router = Router();

/**
 * @openapi
 * /reminders:
 *   post:
 *     tags: [Reminders]
 *     summary: Set a custom reminder for a ticket (eventee only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ticketId, hoursBeforeEvent]
 *             properties:
 *               ticketId: { type: string }
 *               hoursBeforeEvent: { type: number }
 *     responses:
 *       201: { description: Reminder created }
 *       400: { description: Reminder time already passed }
 *       403: { description: Not your ticket }
 */
router.post('/', authenticate, authorize('eventee'), createCustomReminder);

/**
 * @openapi
 * /reminders/mine:
 *   get:
 *     tags: [Reminders]
 *     summary: Get all reminders set by the logged-in eventee
 *     responses:
 *       200: { description: List of reminders }
 */
router.get('/mine', authenticate, authorize('eventee'), getMyReminders);

export default router;