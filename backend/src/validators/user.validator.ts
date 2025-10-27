import { z } from 'zod';

/**
 * User Validation Schemas
 * Zod schemas for validating user management requests
 */

export const createUserSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),
    name: z
      .string({
        required_error: 'Name is required',
      })
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(8, 'Password must be at least 8 characters'),
    role: z.string().min(1, 'Role is required'),
    status: z.enum(['active', 'inactive']).optional().default('active'),
    avatar: z.string().url().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').optional(),
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .optional(),
    role: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
    avatar: z.string().url().optional(),
  }),
  params: z.object({
    id: z.string({
      required_error: 'User ID is required',
    }),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'User ID is required',
    }),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'User ID is required',
    }),
  }),
});

