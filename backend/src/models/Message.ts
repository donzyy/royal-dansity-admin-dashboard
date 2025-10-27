import mongoose, { Document, Schema } from 'mongoose';

/**
 * Message Interface
 * Defines the structure of contact form messages
 */
export interface IMessage extends Document {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'resolved';
  isStarred: boolean;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  assignedTo?: mongoose.Types.ObjectId;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message Schema
 * MongoDB schema for contact form submissions and customer inquiries
 */
const MessageSchema: Schema<IMessage> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'resolved'],
      default: 'unread',
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    repliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
MessageSchema.index({ status: 1, createdAt: -1 });
MessageSchema.index({ email: 1 });
MessageSchema.index({ isStarred: 1 });
MessageSchema.index({ assignedTo: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);

