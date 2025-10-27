import { Router } from 'express';
import {
  getDashboardAnalytics,
  getAnalytics,
  recordAnalytics,
  exportAnalytics,
} from '../controllers/analytics.controller';
import { protect, authorize } from '../middleware/auth';

/**
 * Analytics Routes
 * @route /api/analytics
 */

const router = Router();

/**
 * @swagger
 * /api/analytics/record:
 *   post:
 *     tags: [Analytics]
 *     summary: Record analytics event
 *     description: Public endpoint to record page views and other analytics events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *             properties:
 *               eventType:
 *                 type: string
 *                 enum: [page_view, article_view, button_click, form_submit]
 *                 example: page_view
 *               page:
 *                 type: string
 *                 example: /about
 *               referrer:
 *                 type: string
 *                 example: https://google.com
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Analytics recorded successfully
 *       400:
 *         description: Validation error
 */
router.post('/record', recordAnalytics);

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Get dashboard analytics
 *     description: Retrieve comprehensive analytics for admin dashboard (Admin/Editor only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Time period for analytics
 *     responses:
 *       200:
 *         description: Dashboard analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     totalArticles:
 *                       type: integer
 *                     totalMessages:
 *                       type: integer
 *                     pageViews:
 *                       type: integer
 *                     activeUsers:
 *                       type: integer
 *                     charts:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/dashboard', protect, authorize('admin', 'editor'), getDashboardAnalytics);

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     tags: [Analytics]
 *     summary: Get analytics data
 *     description: Retrieve detailed analytics data (Admin/Editor only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics range
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics range
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Filter by event type
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, authorize('admin', 'editor'), getAnalytics);

/**
 * @swagger
 * /api/analytics/export:
 *   get:
 *     tags: [Analytics]
 *     summary: Export analytics data as CSV
 *     description: Download analytics data in CSV format (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to export
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/export', protect, authorize('admin'), exportAnalytics);

export default router;

