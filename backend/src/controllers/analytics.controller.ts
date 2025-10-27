import { Request, Response, NextFunction } from 'express';
import Analytics from '../models/Analytics';
import Article from '../models/Article';
import Message from '../models/Message';
import User from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';
import { sendCSVResponse, flattenForCSV } from '../utils/csvExport';

/**
 * Analytics Controller
 * Handles analytics data retrieval and dashboard stats
 */

/**
 * @desc    Get dashboard analytics
 * @route   GET /api/analytics/dashboard
 * @access  Private (Admin/Editor)
 */
export const getDashboardAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { days = 30 } = req.query;

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get analytics data for the period
    const analyticsData = await Analytics.find({
      date: { $gte: startDate },
    }).sort('date');

    // Calculate totals
    const totalVisitors = analyticsData.reduce(
      (sum, day) => sum + day.visitors,
      0
    );
    const totalPageViews = analyticsData.reduce(
      (sum, day) => sum + day.pageViews,
      0
    );
    const averageBounceRate =
      analyticsData.reduce((sum, day) => sum + day.bounceRate, 0) /
      (analyticsData.length || 1);

    // Get content stats
    const totalArticles = await Article.countDocuments();
    const publishedArticles = await Article.countDocuments({
      status: 'published',
    });
    const draftArticles = await Article.countDocuments({ status: 'draft' });

    // Get message stats
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ status: 'unread' });
    const resolvedMessages = await Message.countDocuments({
      status: 'resolved',
    });

    // Get user stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });

    // Get top articles by views
    const topArticles = await Article.find({ status: 'published' })
      .sort('-views')
      .limit(5)
      .select('title views slug');

    // Traffic trend (last 7 days)
    const last7Days = analyticsData.slice(-7);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalVisitors,
          totalPageViews,
          averageBounceRate: Math.round(averageBounceRate * 10) / 10,
          totalArticles,
          publishedArticles,
          draftArticles,
          totalMessages,
          unreadMessages,
          resolvedMessages,
          totalUsers,
          activeUsers,
        },
        trafficTrend: last7Days,
        topArticles,
      },
    });
  }
);

/**
 * @desc    Get analytics for date range
 * @route   GET /api/analytics
 * @access  Private (Admin/Editor)
 */
export const getAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    const query: any = {};

    if (startDate) {
      query.date = { $gte: new Date(startDate as string) };
    }

    if (endDate) {
      query.date = { ...query.date, $lte: new Date(endDate as string) };
    }

    const analytics = await Analytics.find(query).sort('date');

    res.status(200).json({
      success: true,
      data: { analytics },
    });
  }
);

/**
 * @desc    Record analytics data (would be called by tracking script)
 * @route   POST /api/analytics
 * @access  Public
 */
export const recordAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create today's analytics record
    let analytics = await Analytics.findOne({ date: today });

    if (!analytics) {
      analytics = await Analytics.create({
        date: today,
        visitors: 1,
        pageViews: 1,
        uniqueVisitors: 1,
        topPages: [],
        referralSources: [],
        deviceTypes: { desktop: 0, mobile: 0, tablet: 0 },
      });
    } else {
      // Update analytics (simplified version)
      analytics.visitors += 1;
      analytics.pageViews += 1;
      await analytics.save();
    }

    res.status(200).json({
      success: true,
      data: { analytics },
    });
  }
);

/**
 * @desc    Export analytics data as CSV
 * @route   GET /api/analytics/export
 * @access  Private (Admin)
 */
export const exportAnalytics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { days = 30 } = req.query;

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get analytics data
    const analyticsData = await Analytics.find({
      date: { $gte: startDate },
    })
      .sort('date')
      .lean();

    // Flatten data for CSV
    const flatData = flattenForCSV(analyticsData);

    // Generate filename with date
    const filename = `analytics-${new Date().toISOString().split('T')[0]}.csv`;

    // Send CSV response
    sendCSVResponse(res, flatData, filename);
  }
);

