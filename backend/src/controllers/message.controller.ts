import { Request, Response, NextFunction } from 'express';
import Message from '../models/Message';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { sendCSVResponse, flattenForCSV } from '../utils/csvExport';

/**
 * Message Controller
 * Handles contact form messages and inquiries
 */

/**
 * @desc    Get all messages
 * @route   GET /api/messages
 * @access  Private (Admin/Editor)
 */
export const getMessages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      status,
      isStarred,
      priority,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (isStarred !== undefined) {
      query.isStarred = isStarred === 'true';
    }

    if (priority) {
      query.priority = priority;
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get messages
    const messages = await Message.find(query)
      .populate('assignedTo', 'name email')
      .sort(sort as string)
      .skip(skip)
      .limit(Number(limit));

    // Get total count
    const total = await Message.countDocuments(query);

    // Get stats
    const stats = {
      total: await Message.countDocuments(),
      unread: await Message.countDocuments({ status: 'unread' }),
      read: await Message.countDocuments({ status: 'read' }),
      resolved: await Message.countDocuments({ status: 'resolved' }),
      starred: await Message.countDocuments({ isStarred: true }),
    };

    res.status(200).json({
      success: true,
      data: {
        messages,
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
 * @desc    Get single message
 * @route   GET /api/messages/:id
 * @access  Private (Admin/Editor)
 */
export const getMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const message = await Message.findById(req.params.id).populate(
      'assignedTo',
      'name email'
    );

    if (!message) {
      return next(new AppError('Message not found', 404));
    }

    // Mark as read if it was unread
    if (message.status === 'unread') {
      message.status = 'read';
      await message.save();
    }

    res.status(200).json({
      success: true,
      data: { message },
    });
  }
);

/**
 * @desc    Create new message (contact form submission)
 * @route   POST /api/messages
 * @access  Public
 */
export const createMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const message = await Message.create(req.body);

    logger.info(`New contact message from: ${message.email}`);

    // TODO: Send email notification to admin

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      data: { message },
    });
  }
);

/**
 * @desc    Update message
 * @route   PUT /api/messages/:id
 * @access  Private (Admin/Editor)
 */
export const updateMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let message = await Message.findById(req.params.id);

    if (!message) {
      return next(new AppError('Message not found', 404));
    }

    // Update repliedAt if status is being changed to resolved
    if (req.body.status === 'resolved' && message.status !== 'resolved') {
      req.body.repliedAt = new Date();
    }

    message = await Message.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    logger.info(`Message updated: ${message?._id} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      data: { message },
    });
  }
);

/**
 * @desc    Delete message
 * @route   DELETE /api/messages/:id
 * @access  Private (Admin)
 */
export const deleteMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return next(new AppError('Message not found', 404));
    }

    await message.deleteOne();

    logger.info(`Message deleted: ${message._id} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  }
);

/**
 * @desc    Export messages as CSV
 * @route   GET /api/messages/export
 * @access  Private (Admin)
 */
export const exportMessages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get all messages
    const messages = await Message.find()
      .sort('-createdAt')
      .lean();

    // Flatten data for CSV
    const flatData = flattenForCSV(messages);

    // Generate filename with date
    const filename = `messages-${new Date().toISOString().split('T')[0]}.csv`;

    // Send CSV response
    sendCSVResponse(res, flatData, filename);
  }
);

