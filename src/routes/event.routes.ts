import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { isEventOwner } from '../middlewares/isEventOwner';
import {
  createEvent,
  getAllEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  deleteEvent,
} from '../controllers/event.controller';

const router = Router();

/**
 * @openapi
 * /events:
 *   get:
 *     tags: [Events]
 *     summary: List all events (public, paginated)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Paginated list of events }
 */
router.get('/', getAllEvents);

/**
 * @openapi
 * /events/me/created:
 *   get:
 *     tags: [Events]
 *     summary: Get events created by the logged-in creator
 *     responses:
 *       200: { description: List of the creator's events }
 *       403: { description: Not a creator }
 */
router.get('/me/created', authenticate, authorize('creator'), getMyEvents);

/**
 * @openapi
 * /events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Get a single event by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Event details }
 *       404: { description: Event not found }
 */
router.get('/:id', getEventById);

/**
 * @openapi
 * /events:
 *   post:
 *     tags: [Events]
 *     summary: Create a new event (creator only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, date, venue, price, capacity]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               date: { type: string, format: date-time }
 *               venue: { type: string }
 *               price: { type: number }
 *               capacity: { type: integer }
 *               reminderOffsetHours: { type: number, default: 24 }
 *     responses:
 *       201: { description: Event created }
 *       403: { description: Not a creator }
 */
router.post('/', authenticate, authorize('creator'), createEvent);

/**
 * @openapi
 * /events/{id}:
 *   put:
 *     tags: [Events]
 *     summary: Update an event (owner only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Event updated }
 *       403: { description: Not the event owner }
 *       404: { description: Event not found }
 */
router.put('/:id', authenticate, authorize('creator'), isEventOwner, updateEvent);

/**
 * @openapi
 * /events/{id}:
 *   delete:
 *     tags: [Events]
 *     summary: Delete an event (owner only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Event deleted }
 *       403: { description: Not the event owner }
 *       404: { description: Event not found }
 */
router.delete('/:id', authenticate, authorize('creator'), isEventOwner, deleteEvent);

export default router;