import { Router } from 'express';
import {
  getMessages,
  getMessage,
  createMessage,
  updateMessage,
  deleteMessage,
  exportMessages,
} from '../controllers/message.controller';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  createMessageSchema,
  updateMessageSchema,
  getMessageSchema,
  deleteMessageSchema,
} from '../validators/message.validator';
import { contactLimiter } from '../middleware/rateLimit';

/**
 * Message Routes
 * @route /api/messages
 */

const router = Router();

/**
 * @swagger
 * /api/messages:
 *   post:
 *     tags: [Messages]
 *     summary: Submit contact message
 *     description: Public endpoint for submitting contact form messages
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               subject:
 *                 type: string
 *                 example: Investment Inquiry
 *               message:
 *                 type: string
 *                 example: I would like to learn more about your investment opportunities
 *     responses:
 *       201:
 *         description: Message submitted successfully
 *       400:
 *         description: Validation error
 */
router.post('/', contactLimiter, validate(createMessageSchema), createMessage);

/**
 * @swagger
 * /api/messages:
 *   get:
 *     tags: [Messages]
 *     summary: Get all messages
 *     description: Retrieve paginated list of contact messages (Admin/Editor only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [unread, read, resolved]
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', protect, authorize('admin', 'editor'), getMessages);

/**
 * @swagger
 * /api/messages/export:
 *   get:
 *     tags: [Messages]
 *     summary: Export messages as CSV
 *     description: Download all messages data in CSV format (Admin only)
 *     security:
 *       - bearerAuth: []
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
router.get('/export', protect, authorize('admin'), exportMessages);

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     tags: [Messages]
 *     summary: Get message by ID
 *     description: Retrieve a specific message (Admin/Editor only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message found
 *       404:
 *         description: Message not found
 */
router.get('/:id', protect, authorize('admin', 'editor'), validate(getMessageSchema), getMessage);

/**
 * @swagger
 * /api/messages/{id}:
 *   put:
 *     tags: [Messages]
 *     summary: Update message
 *     description: Update message status or add reply (Admin/Editor only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [unread, read, resolved]
 *               reply:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message updated successfully
 *       404:
 *         description: Message not found
 */
router.put(
  '/:id',
  protect,
  authorize('admin', 'editor'),
  validate(updateMessageSchema),
  updateMessage
);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     tags: [Messages]
 *     summary: Delete message
 *     description: Permanently delete a message (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       404:
 *         description: Message not found
 */
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validate(deleteMessageSchema),
  deleteMessage
);

export default router;

