import mongoose, { Document, Schema } from 'mongoose';

/**
 * Category Interface
 * Defines the structure of category documents
 */
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  type: 'article' | 'carousel' | 'general';
  color?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category Schema
 * MongoDB schema for managing categories across the platform
 */
const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    type: {
      type: String,
      enum: ['article', 'carousel', 'general'],
      default: 'article',
      required: true,
    },
    color: {
      type: String,
      default: '#D4AF37', // Royal gold
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from name before saving
CategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Indexes for better query performance
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ type: 1, isActive: 1 });
CategorySchema.index({ order: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);

