/**
 * Shared API Types
 * Used by both client and server for type-safe API communication
 */

// ==================== User Types ====================
export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive';
  avatar?: string;
  joinDate: Date;
  lastLogin?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  role?: 'admin' | 'editor' | 'viewer';
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

// ==================== Article Types ====================
export interface Article {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Investment' | 'Market News' | 'Company Updates' | 'Analysis' | 'Tips';
  image: string;
  author: string | User;
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

export interface CreateArticleRequest {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  status?: 'draft' | 'published';
  readTime?: string;
  additionalImages?: string[];
  videoUrl?: string;
  tags?: string[];
}

// ==================== Message Types ====================
export interface Message {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'resolved';
  isStarred: boolean;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  assignedTo?: string | User;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageRequest {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// ==================== Carousel Types ====================
export interface CarouselSlide {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCarouselSlideRequest {
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  order?: number;
  isActive?: boolean;
}

// ==================== Activity Types ====================
export interface Activity {
  _id: string;
  type: 'news_add' | 'news_edit' | 'news_delete' | 
        'carousel_add' | 'carousel_edit' | 'carousel_delete' | 
        'message_reply' | 'user_register' | 'user_delete' | 
        'user_edit' | 'login' | 'logout';
  actor: string | User;
  actorName: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// ==================== Analytics Types ====================
export interface Analytics {
  _id: string;
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
}

export interface DashboardAnalytics {
  overview: {
    totalVisitors: number;
    totalPageViews: number;
    averageBounceRate: number;
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    totalMessages: number;
    unreadMessages: number;
    resolvedMessages: number;
    totalUsers: number;
    activeUsers: number;
  };
  trafficTrend: Analytics[];
  topArticles: Array<{
    _id: string;
    title: string;
    slug: string;
    views: number;
  }>;
}

// ==================== API Response Types ====================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    articles?: T[];
    messages?: T[];
    users?: T[];
    activities?: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// ==================== Error Types ====================
export interface ApiError {
  success: false;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}
