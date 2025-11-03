import { Request, Response, NextFunction } from 'express';
import Article from '../models/Article';
import Activity from '../models/Activity';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { io } from '../index';
import { deleteFile, deleteFiles } from '../utils/fileCleanup';
import { sendCSVResponse, flattenForCSV } from '../utils/csvExport';

/**
 * Article Controller
 * Handles CRUD operations for articles/news
 */

/**
 * @desc    Get all articles
 * @route   GET /api/articles
 * @access  Public
 */
export const getArticles = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      status,
      category,
      search,
      page = 1,
      limit = 10,
      sort = '-publishedAt',
    } = req.query;

    // Build query
    const query: any = {};
    
    // Only show published articles to non-authenticated users
    if (!req.user) {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get articles
    const articles = await Article.find(query)
      .populate('author', 'name email avatar')
      .sort(sort as string)
      .skip(skip)
      .limit(Number(limit));

    // Get total count
    const total = await Article.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        articles,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }
);

/**
 * @desc    Get single article
 * @route   GET /api/articles/:id
 * @access  Public
 */
export const getArticle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const article = await Article.findById(req.params.id).populate(
      'author',
      'name email avatar'
    );

    if (!article) {
      return next(new AppError('Article not found', 404));
    }

    // Only show published articles to non-authenticated users
    if (!req.user && article.status !== 'published') {
      return next(new AppError('Article not found', 404));
    }

    // Increment views
    article.views += 1;
    await article.save();

    res.status(200).json({
      success: true,
      data: { article },
    });
  }
);

/**
 * @desc    Get article by slug
 * @route   GET /api/articles/slug/:slug
 * @access  Public
 */
export const getArticleBySlug = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const article = await Article.findOne({ slug: req.params.slug }).populate(
      'author',
      'name email avatar'
    );

    if (!article) {
      return next(new AppError('Article not found', 404));
    }

    // Only show published articles to non-authenticated users
    if (!req.user && article.status !== 'published') {
      return next(new AppError('Article not found', 404));
    }

    // Increment views
    article.views += 1;
    await article.save();

    res.status(200).json({
      success: true,
      data: { article },
    });
  }
);

/**
 * @desc    Create new article
 * @route   POST /api/articles
 * @access  Private (Admin/Editor)
 */
export const createArticle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const articleData = {
      ...req.body,
      author: req.user?._id,
      authorName: req.user?.email || 'Unknown',
    };

    const article = await Article.create(articleData);

    // Emit Socket.IO event
    io.emit('article:created', article);

    // Log activity
    await Activity.create({
      type: 'news_add',
      actor: req.user?._id,
      actorName: req.user?.email || 'Unknown',
      description: `Created article: ${article.title}`,
      metadata: { articleId: article._id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`Article created: ${article.title} by ${req.user?.email}`);

    res.status(201).json({
      success: true,
      data: { article },
    });
  }
);

/**
 * @desc    Update article
 * @route   PUT /api/articles/:id
 * @access  Private (Admin/Editor)
 */
export const updateArticle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let article = await Article.findById(req.params.id);

    if (!article) {
      return next(new AppError('Article not found', 404));
    }

    // Update article
    article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Emit Socket.IO event
    io.emit('article:updated', article);

    // Log activity
    await Activity.create({
      type: 'news_edit',
      actor: req.user?._id,
      actorName: req.user?.email || 'Unknown',
      description: `Updated article: ${article?.title}`,
      metadata: { articleId: article?._id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`Article updated: ${article?.title} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      data: { article },
    });
  }
);

/**
 * @desc    Delete article
 * @route   DELETE /api/articles/:id
 * @access  Private (Admin)
 */
export const deleteArticle = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return next(new AppError('Article not found', 404));
    }

    const articleTitle = article.title;
    const articleId = String((article as any)._id);
    
    // Delete associated images from filesystem
    const imagesToDelete: string[] = [];
    if (article.image) imagesToDelete.push(article.image);
    if (article.additionalImages && article.additionalImages.length > 0) {
      imagesToDelete.push(...article.additionalImages);
    }
    
    if (imagesToDelete.length > 0) {
      deleteFiles(imagesToDelete);
    }
    
    await article.deleteOne();

    // Emit Socket.IO event
    io.emit('article:deleted', articleId);

    // Log activity
    await Activity.create({
      type: 'news_delete',
      actor: req.user?._id,
      actorName: req.user?.email || 'Unknown',
      description: `Deleted article: ${articleTitle}`,
      metadata: { articleId: req.params.id },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    logger.info(`Article deleted: ${articleTitle} by ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
    });
  }
);

/**
 * @desc    Export articles as CSV
 * @route   GET /api/articles/export
 * @access  Private (Admin/Editor)
 */
export const exportArticles = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get all articles
    const articles = await Article.find()
      .populate('author', 'name email')
      .populate('category', 'name')
      .sort('-createdAt')
      .lean();

    // Flatten data for CSV
    const flatData = flattenForCSV(articles);

    // Generate filename with date
    const filename = `articles-${new Date().toISOString().split('T')[0]}.csv`;

    // Send CSV response
    sendCSVResponse(res, flatData, filename);
  }
);

