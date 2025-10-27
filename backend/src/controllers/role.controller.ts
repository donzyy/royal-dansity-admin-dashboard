import { Request, Response, NextFunction } from 'express';
import Role from '../models/Role';
import Permission from '../models/Permission';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

/**
 * @desc    Get all roles
 * @route   GET /api/roles
 * @access  Private (Admin only)
 */
export const getRoles = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const roles = await Role.find().sort('name');
    
    res.status(200).json({
      success: true,
      data: { roles, count: roles.length },
    });
  }
);

/**
 * @desc    Get single role
 * @route   GET /api/roles/:id
 * @access  Private (Admin only)
 */
export const getRole = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return next(new AppError('Role not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: { role },
    });
  }
);

/**
 * @desc    Create new role
 * @route   POST /api/roles
 * @access  Private (Admin only)
 */
export const createRole = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, permissions } = req.body;
    
    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return next(new AppError('Role with this name already exists', 400));
    }
    
    const role = await Role.create({
      name,
      description,
      permissions: permissions || [],
      isSystem: false,
    });
    
    logger.info(`Role created: ${role.name} by ${req.user?.email}`);
    
    res.status(201).json({
      success: true,
      data: { role },
    });
  }
);

/**
 * @desc    Update role
 * @route   PUT /api/roles/:id
 * @access  Private (Admin only)
 */
export const updateRole = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return next(new AppError('Role not found', 404));
    }
    
    if (role.isSystem) {
      return next(new AppError('Cannot modify system roles', 403));
    }
    
    const { name, description, permissions } = req.body;
    
    // Check if new name conflicts with existing role
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ name });
      if (existingRole) {
        return next(new AppError('Role with this name already exists', 400));
      }
    }
    
    role.name = name || role.name;
    role.description = description || role.description;
    role.permissions = permissions || role.permissions;
    
    await role.save();
    
    logger.info(`Role updated: ${role.name} by ${req.user?.email}`);
    
    res.status(200).json({
      success: true,
      data: { role },
    });
  }
);

/**
 * @desc    Delete role
 * @route   DELETE /api/roles/:id
 * @access  Private (Admin only)
 */
export const deleteRole = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return next(new AppError('Role not found', 404));
    }
    
    if (role.isSystem) {
      return next(new AppError('Cannot delete system roles', 403));
    }
    
    await role.deleteOne();
    
    logger.info(`Role deleted: ${role.name} by ${req.user?.email}`);
    
    res.status(200).json({
      success: true,
      message: 'Role deleted successfully',
    });
  }
);

/**
 * @desc    Get all permissions
 * @route   GET /api/roles/permissions
 * @access  Private (Admin only)
 */
export const getPermissions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const permissions = await Permission.find().sort('category name');
    
    // Group permissions by category
    const groupedPermissions: Record<string, any[]> = {};
    permissions.forEach((permission) => {
      if (!groupedPermissions[permission.category]) {
        groupedPermissions[permission.category] = [];
      }
      groupedPermissions[permission.category].push(permission);
    });
    
    res.status(200).json({
      success: true,
      data: { 
        permissions,
        grouped: groupedPermissions,
        count: permissions.length 
      },
    });
  }
);


