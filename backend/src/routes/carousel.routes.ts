import { Router } from 'express';
import {
  getCarouselSlides,
  getCarouselSlide,
  createCarouselSlide,
  updateCarouselSlide,
  reorderCarouselSlide,
  deleteCarouselSlide,
} from '../controllers/carousel.controller';
import { protect, authorize, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  createCarouselSlideSchema,
  updateCarouselSlideSchema,
  getCarouselSlideSchema,
  deleteCarouselSlideSchema,
} from '../validators/carousel.validator';

/**
 * Carousel Routes
 * @route /api/carousel
 */

const router = Router();

/**
 * @swagger
 * /api/carousel:
 *   get:
 *     tags: [Carousel]
 *     summary: Get all carousel slides
 *     description: Retrieve all active carousel slides for the homepage
 *     responses:
 *       200:
 *         description: Carousel slides retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CarouselSlide'
 */
router.get('/', optionalAuth, getCarouselSlides);

/**
 * @swagger
 * /api/carousel/{id}:
 *   get:
 *     tags: [Carousel]
 *     summary: Get carousel slide by ID
 *     description: Retrieve specific carousel slide (Admin/Editor only)
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
 *         description: Slide found
 *       404:
 *         description: Slide not found
 */
router.get(
  '/:id',
  protect,
  authorize('admin', 'editor'),
  validate(getCarouselSlideSchema),
  getCarouselSlide
);

/**
 * @swagger
 * /api/carousel:
 *   post:
 *     tags: [Carousel]
 *     summary: Create carousel slide
 *     description: Create a new carousel slide (Admin/Editor only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *                 example: Welcome to Royal Dansity
 *               subtitle:
 *                 type: string
 *                 example: Your trusted investment partner
 *               description:
 *                 type: string
 *                 example: Building wealth through strategic investments
 *               image:
 *                 type: string
 *                 format: uri
 *                 description: Direct image URL (e.g. https://images.unsplash.com/photo-xxxxx?w=1920) or local path (/uploads/carousel/image.jpg)
 *                 example: https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop&q=80
 *               buttonLink:
 *                 type: string
 *                 format: uri
 *                 description: Relative or absolute URL for the button
 *                 example: /services
 *               buttonText:
 *                 type: string
 *                 example: Learn More
 *               order:
 *                 type: integer
 *                 example: 1
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Slide created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  protect,
  authorize('admin', 'editor'),
  validate(createCarouselSlideSchema),
  createCarouselSlide
);

/**
 * @swagger
 * /api/carousel/{id}:
 *   put:
 *     tags: [Carousel]
 *     summary: Update carousel slide
 *     description: Update an existing carousel slide (Admin/Editor only)
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
 *               title:
 *                 type: string
 *               subtitle:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: uri
 *               buttonLink:
 *                 type: string
 *               buttonText:
 *                 type: string
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Slide updated successfully
 *       404:
 *         description: Slide not found
 */
router.put(
  '/:id',
  protect,
  authorize('admin', 'editor'),
  validate(updateCarouselSlideSchema),
  updateCarouselSlide
);

/**
 * @swagger
 * /api/carousel/{id}/reorder:
 *   put:
 *     tags: [Carousel]
 *     summary: Reorder carousel slide
 *     description: Move a slide up or down in the display order (Admin/Editor only)
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
 *             required:
 *               - direction
 *             properties:
 *               direction:
 *                 type: string
 *                 enum: [up, down]
 *                 example: up
 *     responses:
 *       200:
 *         description: Slide reordered successfully
 *       400:
 *         description: Invalid direction or slide already at boundary
 *       404:
 *         description: Slide not found
 */
router.put(
  '/:id/reorder',
  protect,
  authorize('admin', 'editor'),
  reorderCarouselSlide
);

/**
 * @swagger
 * /api/carousel/{id}:
 *   delete:
 *     tags: [Carousel]
 *     summary: Delete carousel slide
 *     description: Permanently delete a carousel slide (Admin only)
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
 *         description: Slide deleted successfully
 *       404:
 *         description: Slide not found
 */
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validate(deleteCarouselSlideSchema),
  deleteCarouselSlide
);

export default router;

