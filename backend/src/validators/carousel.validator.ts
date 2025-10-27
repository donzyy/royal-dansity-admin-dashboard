import { z } from 'zod';

/**
 * Carousel Validation Schemas
 * Zod schemas for validating carousel slide requests
 */

export const createCarouselSlideSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Title is required',
      })
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title cannot exceed 100 characters'),
    subtitle: z
      .string()
      .max(200, 'Subtitle cannot exceed 200 characters')
      .optional(),
    description: z
      .string()
      .max(300, 'Description cannot exceed 300 characters')
      .optional(),
    image: z
      .string({
        required_error: 'Image is required',
      })
      .min(1, 'Image is required'),
    buttonText: z
      .string()
      .max(50, 'Button text cannot exceed 50 characters')
      .optional(),
    buttonLink: z
      .string()
      .optional(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateCarouselSlideSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title cannot exceed 100 characters')
      .optional(),
    subtitle: z
      .string()
      .max(200, 'Subtitle cannot exceed 200 characters')
      .optional(),
    description: z
      .string()
      .max(300, 'Description cannot exceed 300 characters')
      .optional(),
    image: z.string().min(1, 'Image is required').optional(),
    buttonText: z
      .string()
      .max(50, 'Button text cannot exceed 50 characters')
      .optional(),
    buttonLink: z.string().optional(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string({
      required_error: 'Slide ID is required',
    }),
  }),
});

export const getCarouselSlideSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Slide ID is required',
    }),
  }),
});

export const deleteCarouselSlideSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Slide ID is required',
    }),
  }),
});

