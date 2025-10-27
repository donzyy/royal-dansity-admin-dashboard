import { Router } from 'express';
import { uploadImage, uploadImages } from '../controllers/upload.controller';
import { protect, authorize } from '../middleware/auth';
import { uploadSingle, uploadMultiple } from '../middleware/upload';

/**
 * Upload Routes
 * @route /api/upload
 */

const router = Router();

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     tags: [Upload]
 *     summary: Upload single image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               uploadType:
 *                 type: string
 *                 enum: [article, carousel, user]
 *                 description: Type of upload to determine folder structure
 *     responses:
 *       200:
 *         description: Image uploaded successfully
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
 *                     filename:
 *                       type: string
 *                     path:
 *                       type: string
 *                     url:
 *                       type: string
 *                     mimetype:
 *                       type: string
 *                     size:
 *                       type: number
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/image',
  protect,
  authorize('admin', 'editor'),
  uploadSingle,
  uploadImage
);

/**
 * @swagger
 * /api/upload/images:
 *   post:
 *     tags: [Upload]
 *     summary: Upload multiple images
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               uploadType:
 *                 type: string
 *                 enum: [article, carousel, user]
 *                 description: Type of upload to determine folder structure
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: No files uploaded
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/images',
  protect,
  authorize('admin', 'editor'),
  uploadMultiple,
  uploadImages
);

export default router;


