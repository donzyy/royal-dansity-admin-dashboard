import { z } from 'zod';

/**
 * Article Validation Schemas
 * Zod schemas for validating article/news requests
 */

export const createArticleSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Title is required',
      })
      .min(5, 'Title must be at least 5 characters')
      .max(200, 'Title cannot exceed 200 characters'),
    excerpt: z
      .string({
        required_error: 'Excerpt is required',
      })
      .min(20, 'Excerpt must be at least 20 characters')
      .max(500, 'Excerpt cannot exceed 500 characters'),
    content: z
      .string({
        required_error: 'Content is required',
      })
      .min(100, 'Content must be at least 100 characters'),
    category: z.string({
      required_error: 'Category is required',
    }).min(1, 'Category is required'),
    image: z
      .string({
        required_error: 'Featured image is required',
      })
      .min(1, 'Featured image is required'),
    status: z.enum(['draft', 'published']).optional().default('draft'),
    readTime: z.string().optional(),
    additionalImages: z.array(z.string()).optional(),
    videoUrl: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateArticleSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(5, 'Title must be at least 5 characters')
      .max(200, 'Title cannot exceed 200 characters')
      .optional(),
    excerpt: z
      .string()
      .min(20, 'Excerpt must be at least 20 characters')
      .max(500, 'Excerpt cannot exceed 500 characters')
      .optional(),
    content: z
      .string()
      .min(100, 'Content must be at least 100 characters')
      .optional(),
    category: z.string().min(1).optional(),
    image: z.string().min(1).optional(),
    status: z.enum(['draft', 'published']).optional(),
    readTime: z.string().optional(),
    additionalImages: z.array(z.string()).optional(),
    videoUrl: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
  }),
  params: z.object({
    id: z.string({
      required_error: 'Article ID is required',
    }),
  }),
});

export const getArticleSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Article ID is required',
    }),
  }),
});

export const deleteArticleSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Article ID is required',
    }),
  }),
});

