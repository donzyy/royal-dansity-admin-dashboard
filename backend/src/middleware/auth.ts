import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import User from '../models/User';
import { AppError } from './errorHandler';

/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user info to request
 */

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { _id: string };
    }
  }
}

/**
 * Protect Routes - Verify JWT Token
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in Authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized to access this route', 401);
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new AppError('User account is inactive', 403);
    }

    // Attach user to request
    req.user = {
      ...decoded,
      _id: String((user as any)._id),
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Not authorized to access this route', 401));
    }
  }
};

/**
 * Authorize Roles - Check if user has required role
 */
export const authorize = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Not authorized', 401));
    }

    // If checking for specific roles, verify user has one of them
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      // Check if user has a role with admin-level permissions
      try {
        const Role = (await import('../models/Role')).default;
        const userRole = await Role.findOne({ slug: req.user.role });
        
        // If role has all permissions or is a system admin role, allow access
        if (userRole && (
          userRole.permissions.includes('*') || 
          userRole.permissions.includes('all') ||
          userRole.slug === 'admin' ||
          userRole.slug === 'super-admin' ||
          userRole.slug === 'superadmin'
        )) {
          return next();
        }
      } catch (error) {
        // If role lookup fails, fall through to error
      }
      
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Check Permission - Verify user has specific permission
 */
export const checkPermission = (...permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Not authorized', 401));
    }

    try {
      const Role = (await import('../models/Role')).default;
      const userRole = await Role.findOne({ slug: req.user.role });
      
      if (!userRole) {
        return next(new AppError('Invalid user role', 403));
      }

      // Check if user has wildcard permission
      if (userRole.permissions.includes('*') || userRole.permissions.includes('all')) {
        return next();
      }

      // Check if user has any of the required permissions
      const hasPermission = permissions.some(permission => 
        userRole.permissions.includes(permission)
      );

      if (!hasPermission) {
        return next(
          new AppError(
            `You don't have permission to access this route. Required: ${permissions.join(' or ')}`,
            403
          )
        );
      }

      next();
    } catch (error) {
      next(new AppError('Error checking permissions', 500));
    }
  };
};

/**
 * Optional Authentication
 * Attaches user if token is valid, but doesn't throw error if not
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.status === 'active') {
        req.user = {
          ...decoded,
          _id: String((user as any)._id),
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

