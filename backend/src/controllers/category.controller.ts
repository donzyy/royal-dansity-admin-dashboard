import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import Activity from '../models/Activity';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { io } from '../index';

/**
 * Category Controller
 * Handles CRUD operations for categories
 */

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { type, isActive } = req.query;

    // Build query
    const query: any = {};

    if (type) {
      query.type = type;
    }

    // Only show active categories to non-authenticated users
    if (!req.user) {
      query.isActive = true;
    } else if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const categories = await Category.find(query).sort({ order: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: { categories },
    });
  }
);

/**
 * @desc    Get single category
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { category },
    });
  }
);

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private (Admin)
 */
export const createCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const category = await Category.create(req.body);

    // Log activity
    await Activity.create({
      type: 'category_add',
      actor: req.user?._id,
      actorName: req.user?.email || 'Unknown',
      description: `Created category "${category.name}" (${category.type})`,
      metadata: {
        categoryId: category._id,
        categoryName: category.name,
        categoryType: category.type,
        categorySlug: category.slug,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Emit Socket.IO event
    io.emit('category:created', category);

    logger.info(`Category created: ${category.name} by ${req.user?.email}`);

    res.status(201).json({
      success: true,
      data: { category },
    });
  }
);

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private (Admin)
 */
export const updateCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    // Log activity
    await Activity.create({
      type: 'category_edit',
      actor: req.user?._id,
      actorName: req.user?.email || 'Unknown',
      description: `Updated category "${category.name}"`,
      metadata: {
        categoryId: category._id,
        categoryName: category.name,
        categoryType: category.type,
        updates: Object.keys(req.body),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Emit Socket.IO event
    io.emit('category:updated', category);

    logger.info(`Category updated: ${category.name} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      data: { category },
    });
  }
);

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin)
 */
export const deleteCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    // Store category info before deletion
    const categoryName = category.name;
    const categoryType = category.type;

    await category.deleteOne();

    // Log activity
    await Activity.create({
      type: 'category_delete',
      actor: req.user?._id,
      actorName: req.user?.email || 'Unknown',
      description: `Deleted category "${categoryName}" (${categoryType})`,
      metadata: {
        categoryId: req.params.id,
        categoryName: categoryName,
        categoryType: categoryType,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Emit Socket.IO event
    io.emit('category:deleted', req.params.id);

    logger.info(`Category deleted: ${categoryName} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Category deleted successfully',
    });
  }
);

