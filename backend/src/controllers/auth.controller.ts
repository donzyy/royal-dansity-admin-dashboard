import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Activity from '../models/Activity';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { generatePasswordResetToken, hashToken } from '../utils/crypto';
import { sendPasswordResetEmail, sendPasswordChangeConfirmation } from '../utils/email';

/**
 * Authentication Controller
 * Handles user registration, login, logout, and token refresh
 */

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public (but should be restricted to admins in production)
 */
export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, name, password, role } = req.body;

    // Convert email to lowercase for consistency
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    // Create user
    const user = await User.create({
      email: normalizedEmail,
      name,
      password,
      role: role || 'viewer',
      status: 'active',
    });

    // Log activity
    await Activity.create({
      type: 'user_register',
      actor: user._id,
      actorName: user.name,
      description: `New user registered: ${user.email}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    logger.info(`User registered: ${user.email}`);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          joinDate: user.joinDate,
        },
        accessToken,
        refreshToken,
      },
    });
  }
);

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Convert email to lowercase for case-insensitive login
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if user is active
    if (user.status !== 'active') {
      return next(new AppError('Account is inactive. Please contact support.', 403));
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log activity
    await Activity.create({
      type: 'login',
      actor: user._id,
      actorName: user.name,
      description: `User logged in: ${user.email}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          avatar: user.avatar,
          joinDate: user.joinDate,
        },
        accessToken,
        refreshToken,
      },
    });
  }
);

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Get user
    const user = await User.findById(decoded.id);
    if (!user || user.status !== 'active') {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.status(200).json({
      success: true,
      data: {
        accessToken,
      },
    });
  }
);

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          avatar: user.avatar,
          joinDate: user.joinDate,
          lastLogin: user.lastLogin,
        },
      },
    });
  }
);

/**
 * @desc    Update password
 * @route   PUT /api/auth/password
 * @access  Private
 */
export const updatePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user?.id).select('+password');
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect', 400));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password updated for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  }
);

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    // Convert email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      logger.warn(`Password reset requested for non-existent email: ${normalizedEmail}`);
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      logger.warn(`Password reset requested for inactive account: ${normalizedEmail}`);
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const { token, hashedToken, expiresAt } = generatePasswordResetToken();

    // Save hashed token to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = expiresAt;
    await user.save();

    // Send email
    const emailSent = await sendPasswordResetEmail(user.email, token, user.name);

    if (!emailSent) {
      logger.error(`Failed to send password reset email to: ${user.email}`);
      // Clear the reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      
      return next(new AppError('Failed to send password reset email. Please try again later.', 500));
    }

    logger.info(`Password reset email sent to: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email.',
    });
  }
);

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token from URL
    const hashedToken = hashToken(token);

    // Find user with matching token and valid expiry
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired password reset token', 400));
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Log activity
    await Activity.create({
      type: 'user_edit',
      actor: user._id,
      actorName: user.name,
      description: `Password reset for user: ${user.email}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Send confirmation email
    await sendPasswordChangeConfirmation(user.email, user.name);

    logger.info(`Password reset successful for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  }
);

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Log activity
    if (req.user) {
      await Activity.create({
        type: 'logout',
        actor: req.user._id,
        actorName: req.user.email,
        description: `User logged out: ${req.user.email}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
);

