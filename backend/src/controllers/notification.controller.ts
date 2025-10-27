import { Request, Response, NextFunction } from 'express';
import Notification from '../models/Notification';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { io } from '../index';

/**
 * Notification Controller
 * Handles notification operations
 */

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { read, limit = 20, page = 1 } = req.query;

    // Build query
    const query: any = { recipient: req.user?._id };

    if (read !== undefined) {
      query.read = read === 'true';
    }

    // Get notifications
    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    // Get total count
    const total = await Notification.countDocuments(query);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: req.user?._id,
      read: false,
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
        unreadCount,
      },
    });
  }
);

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user?._id,
    });

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    notification.read = true;
    await notification.save();

    logger.info(`Notification marked as read: ${notification._id} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      data: { notification },
    });
  }
);

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    await Notification.updateMany(
      { recipient: req.user?._id, read: false },
      { read: true }
    );

    logger.info(`All notifications marked as read by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  }
);

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user?._id,
    });

    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    await notification.deleteOne();

    logger.info(`Notification deleted: ${notification._id} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  }
);

/**
 * @desc    Create notification (internal use)
 * @param   recipient User ID
 * @param   data Notification data
 */
export const createNotification = async (
  recipient: string,
  data: {
    type: 'info' | 'success' | 'warning' | 'error' | 'article' | 'message' | 'user';
    title: string;
    message: string;
    link?: string;
  }
) => {
  try {
    const notification = await Notification.create({
      recipient,
      ...data,
    });

    // Emit Socket.IO event
    io.to(recipient).emit('notification:new', notification);

    logger.info(`Notification created for user: ${recipient}`);

    return notification;
  } catch (error) {
    logger.error(`Error creating notification: ${error}`);
    throw error;
  }
};


