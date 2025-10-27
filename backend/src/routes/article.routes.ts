import { Router } from 'express';
import {
  getArticles,
  getArticle,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  exportArticles,
} from '../controllers/article.controller';
import { protect, authorize, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  createArticleSchema,
  updateArticleSchema,
  getArticleSchema,
  deleteArticleSchema,
} from '../validators/article.validator';

/**
 * Article Routes
 * @route /api/articles
 */

const router = Router();

/**
 * @swagger
 * /api/articles:
 *   get:
 *     tags: [Articles]
 *     summary: Get all articles
 *     description: Retrieve paginated list of articles with optional filters
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
 *           enum: [draft, published]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Articles retrieved successfully
 */
router.get('/', optionalAuth, getArticles);

/**
 * @swagger
 * /api/articles/export:
 *   get:
 *     tags: [Articles]
 *     summary: Export articles as CSV
 *     description: Download all articles data in CSV format (Admin/Editor only)
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
router.get('/export', protect, authorize('admin', 'editor'), exportArticles);

/**
 * @swagger
 * /api/articles/slug/{slug}:
 *   get:
 *     tags: [Articles]
 *     summary: Get article by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article found
 *       404:
 *         description: Article not found
 */
router.get('/slug/:slug', optionalAuth, getArticleBySlug);

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     tags: [Articles]
 *     summary: Get article by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article found
 *       404:
 *         description: Article not found
 */
router.get('/:id', validate(getArticleSchema), optionalAuth, getArticle);

/**
 * @swagger
 * /api/articles:
 *   post:
 *     tags: [Articles]
 *     summary: Create new article
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Article'
 *     responses:
 *       201:
 *         description: Article created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin or editor role
 */
router.post(
  '/',
  protect,
  authorize('admin', 'editor'),
  validate(createArticleSchema),
  createArticle
);

/**
 * @swagger
 * /api/articles/{id}:
 *   put:
 *     tags: [Articles]
 *     summary: Update article
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
 *             $ref: '#/components/schemas/Article'
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       404:
 *         description: Article not found
 */
router.put(
  '/:id',
  protect,
  authorize('admin', 'editor'),
  validate(updateArticleSchema),
  updateArticle
);

/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     tags: [Articles]
 *     summary: Delete article
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
 *         description: Article deleted successfully
 *       404:
 *         description: Article not found
 */
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validate(deleteArticleSchema),
  deleteArticle
);

export default router;

