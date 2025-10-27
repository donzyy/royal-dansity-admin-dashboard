import { Request, Response, NextFunction } from 'express';
import Activity from '../models/Activity';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Activity Controller
 * Handles activity log retrieval
 */

/**
 * @desc    Get all activities
 * @route   GET /api/activities
 * @access  Private (Admin)
 */
export const getActivities = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      type,
      actor,
      page = 1,
      limit = 50,
      sort = '-createdAt',
    } = req.query;

    // Build query
    const query: any = {};

    if (type) {
      query.type = type;
    }

    if (actor) {
      query.actor = actor;
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get activities
    const activities = await Activity.find(query)
      .populate('actor', 'name email avatar')
      .sort(sort as string)
      .skip(skip)
      .limit(Number(limit));

    // Get total count
    const total = await Activity.countDocuments(query);

    // Get stats
    const stats = {
      total: await Activity.countDocuments(),
      todayCount: await Activity.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      thisWeekCount: await Activity.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      thisMonthCount: await Activity.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    };

    res.status(200).json({
      success: true,
      data: {
        activities,
        stats,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }
);

/**
 * @desc    Get user activities
 * @route   GET /api/activities/user/:userId
 * @access  Private (Admin)
 */
export const getUserActivities = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 20, sort = '-createdAt' } = req.query;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get activities for specific user
    const activities = await Activity.find({ actor: req.params.userId })
      .populate('actor', 'name email avatar')
      .sort(sort as string)
      .skip(skip)
      .limit(Number(limit));

    // Get total count
    const total = await Activity.countDocuments({ actor: req.params.userId });

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }
);

