import { Request, Response, NextFunction } from 'express';
import CarouselSlide from '../models/CarouselSlide';
import Activity from '../models/Activity';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { io } from '../index';
import { deleteFile } from '../utils/fileCleanup';

/**
 * Carousel Controller
 * Handles carousel slide management
 */

/**
 * @desc    Get all carousel slides
 * @route   GET /api/carousel
 * @access  Public
 */
export const getCarouselSlides = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { isActive } = req.query;

    const query: any = {};

    // Only show active slides to non-authenticated users
    if (!req.user) {
      query.isActive = true;
    } else if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const slides = await CarouselSlide.find(query).sort('order');

    res.status(200).json({
      success: true,
      data: slides,
    });
  }
);

/**
 * @desc    Get single carousel slide
 * @route   GET /api/carousel/:id
 * @access  Private (Admin/Editor)
 */
export const getCarouselSlide = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const slide = await CarouselSlide.findById(req.params.id);

    if (!slide) {
      return next(new AppError('Carousel slide not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { slide },
    });
  }
);

/**
 * @desc    Create new carousel slide
 * @route   POST /api/carousel
 * @access  Private (Admin/Editor)
 */
export const createCarouselSlide = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // If order not specified, put it at the end
    if (!req.body.order) {
      const maxOrder = await CarouselSlide.findOne().sort('-order').select('order');
      req.body.order = maxOrder ? maxOrder.order + 1 : 0;
    }

    const slide = await CarouselSlide.create(req.body);

    // Emit Socket.IO event
    io.emit('carousel:created', slide);

    // Log activity
    await Activity.create({
      type: 'carousel_add',
      actor: req.user?._id,
      actorName: req.user?.email || 'Unknown',
      description: `Created carousel slide: ${slide.title}`,
      metadata: { slideId: slide._id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`Carousel slide created: ${slide.title} by ${req.user?.email}`);

    res.status(201).json({
      success: true,
      data: { slide },
    });
  }
);

/**
 * @desc    Update carousel slide
 * @route   PUT /api/carousel/:id
 * @access  Private (Admin/Editor)
 */
export const updateCarouselSlide = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let slide = await CarouselSlide.findById(req.params.id);

    if (!slide) {
      return next(new AppError('Carousel slide not found', 404));
    }

    slide = await CarouselSlide.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Emit Socket.IO event
    io.emit('carousel:updated', slide);

    // Log activity
    await Activity.create({
      type: 'carousel_edit',
      actor: req.user?._id,
      actorName: req.user?.email || 'Unknown',
      description: `Updated carousel slide: ${slide?.title}`,
      metadata: { slideId: slide?._id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`Carousel slide updated: ${slide?.title} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      data: { slide },
    });
  }
);

/**
 * @desc    Reorder carousel slide (move up or down)
 * @route   PUT /api/carousel/:id/reorder
 * @access  Private (Admin/Editor)
 */
export const reorderCarouselSlide = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { direction } = req.body; // 'up' or 'down'
    
    const slide = await CarouselSlide.findById(req.params.id);

    if (!slide) {
      return next(new AppError('Carousel slide not found', 404));
    }

    const currentOrder = slide.order;
    let targetOrder: number;

    if (direction === 'up') {
      // Move up = decrease order number
      targetOrder = currentOrder - 1;
      
      // Find the slide that's currently at the target position
      const slideAbove = await CarouselSlide.findOne({ order: targetOrder });
      
      if (slideAbove) {
        // Swap orders
        slideAbove.order = currentOrder;
        await slideAbove.save();
      } else {
        // Already at the top
        return res.status(400).json({
          success: false,
          message: 'Slide is already at the top',
        });
      }
    } else if (direction === 'down') {
      // Move down = increase order number
      targetOrder = currentOrder + 1;
      
      // Find the slide that's currently at the target position
      const slideBelow = await CarouselSlide.findOne({ order: targetOrder });
      
      if (slideBelow) {
        // Swap orders
        slideBelow.order = currentOrder;
        await slideBelow.save();
      } else {
        // Already at the bottom
        return res.status(400).json({
          success: false,
          message: 'Slide is already at the bottom',
        });
      }
    } else {
      return next(new AppError('Invalid direction. Use "up" or "down"', 400));
    }

    // Update current slide order
    slide.order = targetOrder;
    await slide.save();

    // Fetch all slides to return updated order
    const allSlides = await CarouselSlide.find().sort('order');

    // Emit Socket.IO event
    io.emit('carousel:reordered', allSlides);

    logger.info(`Carousel slide reordered: ${slide.title} moved ${direction} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: 'Slide reordered successfully',
      data: { slides: allSlides },
    });
  }
);

/**
 * @desc    Delete carousel slide
 * @route   DELETE /api/carousel/:id
 * @access  Private (Admin)
 */
export const deleteCarouselSlide = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const slide = await CarouselSlide.findById(req.params.id);

    if (!slide) {
      return next(new AppError('Carousel slide not found', 404));
    }

    const slideTitle = slide.title;
    const slideId = String((slide as any)._id);
    
    // Delete associated image from filesystem
    if (slide.image) {
      deleteFile(slide.image);
    }
    
    await slide.deleteOne();

    // Emit Socket.IO event
    console.log('🔴 Emitting carousel:deleted event for slideId:', slideId);
    io.emit('carousel:deleted', slideId);
    console.log('✅ Event emitted successfully');

    // Log activity
    await Activity.create({
      type: 'carousel_delete',
      actor: req.user?._id,
      actorName: req.user?.email || 'Unknown',
      description: `Deleted carousel slide: ${slideTitle}`,
      metadata: { slideId: req.params.id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`Carousel slide deleted: ${slideTitle} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: 'Carousel slide deleted successfully',
    });
  }
);

