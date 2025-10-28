import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Activity from '../models/Activity';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { deleteFile } from '../utils/fileCleanup';
import { sendCSVResponse, flattenForCSV } from '../utils/csvExport';

/**
 * User Controller
 * Handles user management operations
 */

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private (Admin)
 */
export const getUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      role,
      status,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    // Build query
    const query: any = {};

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort(sort as string)
      .skip(skip)
      .limit(Number(limit));

    // Get total count
    const total = await User.countDocuments(query);

    // Get stats
    const stats = {
      total: await User.countDocuments(),
      active: await User.countDocuments({ status: 'active' }),
      inactive: await User.countDocuments({ status: 'inactive' }),
      admins: await User.countDocuments({ role: 'admin' }),
      editors: await User.countDocuments({ role: 'editor' }),
      viewers: await User.countDocuments({ role: 'viewer' }),
    };

    res.status(200).json({
      success: true,
      data: {
        users,
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
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private (Admin)
 */
export const getUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  }
);

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Private (Admin)
 */
export const createUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    const user = await User.create(req.body);

    // Log activity
    await Activity.create({
      type: 'user_register',
      actor: req.user?._id,
      actorName: req.user?.email || 'Unknown',
      description: `Created user: ${user.email}`,
      metadata: { userId: user._id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`User created: ${user.email} by ${req.user?.email}`);

    res.status(201).json({
      success: true,
      data: { user },
    });
  }
);

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private (Admin)
 */
export const updateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Don't allow password update through this route
    if (req.body.password) {
      return next(
        new AppError('Password cannot be updated through this route', 400)
      );
    }

    let user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update user
    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    // Log activity
    await Activity.create({
      type: 'user_edit',
      actor: req.user?._id,
      actorName: req.user?.email || 'Unknown',
      description: `Updated user: ${user?.email}`,
      metadata: { userId: user?._id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`User updated: ${user?.email} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      data: { user },
    });
  }
);

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
export const deleteUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Don't allow user to delete themselves
    if (user._id.toString() === req.user?._id) {
      return next(new AppError('You cannot delete your own account', 400));
    }

    const userEmail = user.email;
    
    // Delete user's avatar from filesystem
    if (user.avatar) {
      deleteFile(user.avatar);
    }
    
    await user.deleteOne();

    // Log activity
    await Activity.create({
      type: 'user_delete',
      actor: req.user?._id,
      actorName: req.user?.email || 'Unknown',
      description: `Deleted user: ${userEmail}`,
      metadata: { userId: req.params.id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`User deleted: ${userEmail} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  }
);

/**
 * @desc    Upload user avatar
 * @route   POST /api/users/:id/avatar
 * @route   POST /api/users/me/avatar
 * @access  Private
 */
export const uploadAvatar = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // If route is /me/avatar, use authenticated user's ID
    const userId = req.params.id || req.user?._id;

    if (!userId) {
      return next(new AppError('User ID not found', 400));
    }

    // Check if file was uploaded
    if (!req.file) {
      return next(new AppError('Please upload an image file', 400));
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check authorization (users can only update their own avatar, or admin can update any)
    if (req.user?._id.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return next(new AppError('Not authorized to update this user avatar', 403));
    }

    // Update user avatar
    const avatarPath = `/uploads/${req.file.path.split('uploads')[1].replace(/\\/g, '/')}`;
    user.avatar = avatarPath;
    await user.save();

    // Log activity
    await Activity.create({
      type: 'user_edit',
      actor: req.user?._id,
      actorName: req.user?.email || 'Unknown',
      description: `Updated avatar for user: ${user.email}`,
      metadata: { userId: user._id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`Avatar uploaded for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: user.avatar,
      },
    });
  }
);

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/me
 * @access  Private
 */
export const updateMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Don't allow password or role update through this route
    if (req.body.password || req.body.role) {
      return next(
        new AppError('Password and role cannot be updated through this route', 400)
      );
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        name: req.body.name,
        email: req.body.email,
        avatar: req.body.avatar,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Log activity
    await Activity.create({
      type: 'user_edit',
      actor: req.user?._id,
      actorName: req.user?.email || 'Unknown',
      description: `Updated own profile`,
      metadata: { userId: user._id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`User updated own profile: ${user.email}`);

    res.status(200).json({
      success: true,
      data: { user },
    });
  }
);

/**
 * @desc    Export users as CSV
 * @route   GET /api/users/export
 * @access  Private (Admin)
 */
export const exportUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get all users
    const users = await User.find()
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort('-createdAt')
      .lean();

    // Flatten data for CSV
    const flatData = flattenForCSV(users);

    // Generate filename with date
    const filename = `users-${new Date().toISOString().split('T')[0]}.csv`;

    // Send CSV response
    sendCSVResponse(res, flatData, filename);
  }
);

