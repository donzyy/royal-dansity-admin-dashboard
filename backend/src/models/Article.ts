import mongoose, { Document, Schema } from 'mongoose';

/**
 * Article Interface
 * Defines the structure of article/news documents
 */
export interface IArticle extends Document {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: mongoose.Types.ObjectId;
  authorName: string;
  status: 'draft' | 'published';
  readTime: string;
  additionalImages?: string[];
  videoUrl?: string;
  tags?: string[];
  slug: string;
  views: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Article Schema
 * MongoDB schema for blog posts and news articles
 */
const ArticleSchema: Schema<IArticle> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    excerpt: {
      type: String,
      required: [true, 'Article excerpt is required'],
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Article content is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Featured image is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    readTime: {
      type: String,
      default: '5 min read',
    },
    additionalImages: [{
      type: String,
    }],
    videoUrl: {
      type: String,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    slug: {
      type: String,
      lowercase: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from title before saving
ArticleSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Indexes for better query performance
ArticleSchema.index({ slug: 1 }, { unique: true, sparse: true }); // sparse allows multiple null values
ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ author: 1 });
ArticleSchema.index({ tags: 1 });

export default mongoose.model<IArticle>('Article', ArticleSchema);

