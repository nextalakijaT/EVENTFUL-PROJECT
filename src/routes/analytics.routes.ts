import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { getOverallAnalytics, getEventAnalytics } from '../controllers/analytics.controller';

const router = Router();

/**
 * @openapi
 * /analytics/overall:
 *   get:
 *     tags: [Analytics]
 *     summary: Get overall analytics across all of the creator's events
 *     responses:
 *       200: { description: Aggregate stats }
 */
router.get('/overall', authenticate, authorize('creator'), getOverallAnalytics);

/**
 * @openapi
 * /analytics/event/{id}:
 *   get:
 *     tags: [Analytics]
 *     summary: Get analytics for a single event (owner only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Event-specific stats }
 *       403: { description: Not the event owner }
 */
router.get('/event/:id', authenticate, authorize('creator'), getEventAnalytics);

export default router;