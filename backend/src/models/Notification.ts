import mongoose, { Document, Schema } from 'mongoose';

/**
 * Notification Interface
 * Defines the structure of notification documents
 */
export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: 'info' | 'success' | 'warning' | 'error' | 'article' | 'message' | 'user';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification Schema
 * MongoDB schema for system notifications
 */
const NotificationSchema: Schema<INotification> = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error', 'article', 'message', 'user'],
      default: 'info',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    link: {
      type: String,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);


