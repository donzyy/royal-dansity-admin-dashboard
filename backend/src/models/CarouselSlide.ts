import mongoose, { Document, Schema } from 'mongoose';

/**
 * CarouselSlide Interface
 * Defines the structure of homepage carousel slides
 */
export interface ICarouselSlide extends Document {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * CarouselSlide Schema
 * MongoDB schema for homepage hero carousel slides
 */
const CarouselSlideSchema: Schema<ICarouselSlide> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Slide title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Subtitle cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    image: {
      type: String,
      required: [true, 'Slide image is required'],
    },
    buttonText: {
      type: String,
      trim: true,
      maxlength: [50, 'Button text cannot exceed 50 characters'],
    },
    buttonLink: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
CarouselSlideSchema.index({ order: 1 });
CarouselSlideSchema.index({ isActive: 1, order: 1 });

export default mongoose.model<ICarouselSlide>('CarouselSlide', CarouselSlideSchema);

