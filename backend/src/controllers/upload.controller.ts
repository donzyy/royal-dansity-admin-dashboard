import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

/**
 * Upload Controller
 * Handles file uploads for various resources
 */

/**
 * @desc    Upload single image
 * @route   POST /api/upload/image
 * @access  Private
 */
export const uploadImage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a file',
      });
    }

    // Get the file path relative to the server root
    const filePath = `/${req.file.path.replace(/\\/g, '/')}`;

    logger.info(`File uploaded: ${filePath} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        path: filePath,
        url: `${req.protocol}://${req.get('host')}${filePath}`,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  }
);

/**
 * @desc    Upload multiple images
 * @route   POST /api/upload/images
 * @access  Private
 */
export const uploadImages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please upload at least one file',
      });
    }

    const files = req.files.map((file: Express.Multer.File) => {
      const filePath = `/${file.path.replace(/\\/g, '/')}`;
      return {
        filename: file.filename,
        path: filePath,
        url: `${req.protocol}://${req.get('host')}${filePath}`,
        mimetype: file.mimetype,
        size: file.size,
      };
    });

    logger.info(`${files.length} files uploaded by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      data: { files },
    });
  }
);


