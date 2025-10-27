import mongoose, { Document, Schema } from 'mongoose';

/**
 * Activity Interface
 * Defines the structure of activity log entries
 */
export interface IActivity extends Document {
  type: 'news_add' | 'news_edit' | 'news_delete' | 
        'carousel_add' | 'carousel_edit' | 'carousel_delete' | 
        'category_add' | 'category_edit' | 'category_delete' |
        'message_reply' | 'user_register' | 'user_delete' | 
        'user_edit' | 'login' | 'logout';
  actor: mongoose.Types.ObjectId;
  actorName: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

/**
 * Activity Schema
 * MongoDB schema for tracking all platform activities
 */
const ActivitySchema: Schema<IActivity> = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'news_add',
        'news_edit',
        'news_delete',
        'carousel_add',
        'carousel_edit',
        'carousel_delete',
        'category_add',
        'category_edit',
        'category_delete',
        'message_reply',
        'user_register',
        'user_delete',
        'user_edit',
        'login',
        'logout',
      ],
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes for better query performance
ActivitySchema.index({ createdAt: -1 });
ActivitySchema.index({ actor: 1, createdAt: -1 });
ActivitySchema.index({ type: 1, createdAt: -1 });

export default mongoose.model<IActivity>('Activity', ActivitySchema);

