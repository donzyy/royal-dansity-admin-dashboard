import mongoose, { Document, Schema } from 'mongoose';

/**
 * Analytics Interface
 * Defines the structure of website analytics data
 */
export interface IAnalytics extends Document {
  date: Date;
  visitors: number;
  pageViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{
    page: string;
    views: number;
  }>;
  referralSources: Array<{
    source: string;
    count: number;
  }>;
  deviceTypes: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Analytics Schema
 * MongoDB schema for daily analytics tracking
 */
const AnalyticsSchema: Schema<IAnalytics> = new Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    visitors: {
      type: Number,
      default: 0,
      min: 0,
    },
    pageViews: {
      type: Number,
      default: 0,
      min: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageSessionDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    bounceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    topPages: [{
      page: {
        type: String,
        required: true,
      },
      views: {
        type: Number,
        required: true,
        min: 0,
      },
    }],
    referralSources: [{
      source: {
        type: String,
        required: true,
      },
      count: {
        type: Number,
        required: true,
        min: 0,
      },
    }],
    deviceTypes: {
      desktop: {
        type: Number,
        default: 0,
        min: 0,
      },
      mobile: {
        type: Number,
        default: 0,
        min: 0,
      },
      tablet: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
AnalyticsSchema.index({ date: -1 });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

