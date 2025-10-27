import type {
  ApiResponse,
  PaginatedResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Article,
  CreateArticleRequest,
  Message,
  CreateMessageRequest,
  CarouselSlide,
  Activity,
  DashboardAnalytics,
} from '@shared/api';

/**
 * API Client
 * Centralized API communication with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Token management
let accessToken: string | null = localStorage.getItem('accessToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const getAccessToken = () => accessToken;

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Try to refresh token if unauthorized
      if (response.status === 401 && refreshToken) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, { ...options, headers });
          return retryResponse.json();
        }
      }

      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Refresh access token
 */
async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      setTokens(data.data.accessToken, refreshToken);
      return data.data.accessToken;
    }

    clearTokens();
    return null;
  } catch {
    clearTokens();
    return null;
  }
}

// ==================== Auth API ====================

export const authAPI = {
  login: (credentials: LoginRequest) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: RegisterRequest) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch<ApiResponse>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    apiFetch<ApiResponse<{ user: User }>>('/auth/me'),

  getCurrentUser: () =>
    apiFetch<ApiResponse<{ user: User }>>('/auth/me'),

  updatePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<ApiResponse>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  forgotPassword: (email: string) =>
    apiFetch<ApiResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    apiFetch<ApiResponse>(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  updateProfile: (data: { name?: string; email?: string; avatar?: string }) =>
    apiFetch<{ success: boolean; data: { user: any } }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ==================== Articles API ====================

export const articlesAPI = {
  getAll: (params?: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch<PaginatedResponse<Article>>(`/articles?${query}`);
  },

  getById: (id: string) =>
    apiFetch<ApiResponse<{ article: Article }>>(`/articles/${id}`),

  getBySlug: (slug: string) =>
    apiFetch<ApiResponse<{ article: Article }>>(`/articles/slug/${slug}`),

  create: (data: CreateArticleRequest) =>
    apiFetch<ApiResponse<{ article: Article }>>('/articles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateArticleRequest>) =>
    apiFetch<ApiResponse<{ article: Article }>>(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<ApiResponse>(`/articles/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== Messages API ====================

export const messagesAPI = {
  getAll: (params?: {
    status?: string;
    isStarred?: boolean;
    priority?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch<PaginatedResponse<Message>>(`/messages?${query}`);
  },

  getById: (id: string) =>
    apiFetch<ApiResponse<{ message: Message }>>(`/messages/${id}`),

  create: (data: CreateMessageRequest) =>
    apiFetch<ApiResponse<{ message: Message }>>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Message>) =>
    apiFetch<ApiResponse<{ message: Message }>>(`/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<ApiResponse>(`/messages/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== Users API ====================

export const usersAPI = {
  getAll: (params?: {
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch<PaginatedResponse<User>>(`/users?${query}`);
  },

  getById: (id: string) =>
    apiFetch<ApiResponse<{ user: User }>>(`/users/${id}`),

  create: (data: Partial<User> & { password: string }) =>
    apiFetch<ApiResponse<{ user: User }>>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<User>) =>
    apiFetch<ApiResponse<{ user: User }>>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<ApiResponse>(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== Carousel API ====================

export const carouselAPI = {
  getAll: (isActive?: boolean) => {
    const query = isActive !== undefined ? `?isActive=${isActive}` : '';
    return apiFetch<ApiResponse<{ slides: CarouselSlide[] }>>(`/carousel${query}`);
  },

  getById: (id: string) =>
    apiFetch<ApiResponse<{ slide: CarouselSlide }>>(`/carousel/${id}`),

  create: (data: Partial<CarouselSlide>) =>
    apiFetch<ApiResponse<{ slide: CarouselSlide }>>('/carousel', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CarouselSlide>) =>
    apiFetch<ApiResponse<{ slide: CarouselSlide }>>(`/carousel/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<ApiResponse>(`/carousel/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== Activities API ====================

export const activitiesAPI = {
  getAll: (params?: {
    type?: string;
    actor?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch<PaginatedResponse<Activity>>(`/activities?${query}`);
  },

  getUserActivities: (userId: string, params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch<PaginatedResponse<Activity>>(`/activities/user/${userId}?${query}`);
  },
};

// ==================== Analytics API ====================

export const analyticsAPI = {
  getDashboard: (days?: number) => {
    const query = days ? `?days=${days}` : '';
    return apiFetch<ApiResponse<DashboardAnalytics>>(`/analytics/dashboard${query}`);
  },

  getAnalytics: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiFetch<ApiResponse>(`/analytics${query ? `?${query}` : ''}`);
  },
};

// ==================== Roles API ====================

export const rolesAPI = {
  getAll: () => apiFetch<ApiResponse>('/roles'),
  getById: (id: string) => apiFetch<ApiResponse>(`/roles/${id}`),
  create: (data: { name: string; description?: string; permissions: string[] }) =>
    apiFetch<ApiResponse>('/roles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string; description?: string; permissions?: string[] }) =>
    apiFetch<ApiResponse>(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<ApiResponse>(`/roles/${id}`, { method: 'DELETE' }),
  getPermissions: () => apiFetch<ApiResponse>('/roles/permissions'),
};

export default {
  auth: authAPI,
  articles: articlesAPI,
  messages: messagesAPI,
  users: usersAPI,
  carousel: carouselAPI,
  activities: activitiesAPI,
  analytics: analyticsAPI,
  roles: rolesAPI,
};


