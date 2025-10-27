import { z } from 'zod';

/**
 * Message Validation Schemas
 * Zod schemas for validating contact message requests
 */

export const createMessageSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Name is required',
      })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email format'),
    phone: z
      .string({
        required_error: 'Phone number is required',
      })
      .min(10, 'Phone number must be at least 10 characters'),
    subject: z
      .string({
        required_error: 'Subject is required',
      })
      .min(5, 'Subject must be at least 5 characters')
      .max(200, 'Subject cannot exceed 200 characters'),
    message: z
      .string({
        required_error: 'Message is required',
      })
      .min(20, 'Message must be at least 20 characters')
      .max(2000, 'Message cannot exceed 2000 characters'),
  }),
});

export const updateMessageSchema = z.object({
  body: z.object({
    status: z.enum(['unread', 'read', 'resolved']).optional(),
    isStarred: z.boolean().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
    assignedTo: z.string().optional(),
  }),
  params: z.object({
    id: z.string({
      required_error: 'Message ID is required',
    }),
  }),
});

export const getMessageSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Message ID is required',
    }),
  }),
});

export const deleteMessageSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Message ID is required',
    }),
  }),
});

