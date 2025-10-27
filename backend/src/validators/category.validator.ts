import { z } from 'zod';

/**
 * Category Validation Schemas
 */

/**
 * Schema for creating a new category
 */
export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Category name is required',
      })
      .min(1, 'Category name cannot be empty')
      .max(50, 'Category name cannot exceed 50 characters')
      .trim(),
    description: z
      .string()
      .max(200, 'Description cannot exceed 200 characters')
      .optional(),
    type: z.enum(['article', 'carousel', 'general'], {
      required_error: 'Category type is required',
    }),
    color: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format (must be hex color)')
      .optional()
      .default('#D4AF37'),
    isActive: z.boolean().optional().default(true),
    order: z.number().int().min(0).optional().default(0),
  }),
});

/**
 * Schema for updating a category
 */
export const updateCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Category name cannot be empty')
      .max(50, 'Category name cannot exceed 50 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(200, 'Description cannot exceed 200 characters')
      .optional(),
    type: z.enum(['article', 'carousel', 'general']).optional(),
    color: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format (must be hex color)')
      .optional(),
    isActive: z.boolean().optional(),
    order: z.number().int().min(0).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  }),
});

/**
 * Schema for deleting a category
 */
export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  }),
});


