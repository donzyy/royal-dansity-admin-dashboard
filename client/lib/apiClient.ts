/**
 * API Client for Royal Dansity Backend
 * Provides type-safe methods to interact with the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ==================== Authentication ====================

  async login(email: string, password: string) {
    const response = await this.post<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/api/auth/login', { email, password });
    
    if (response.data) {
      this.setToken(response.data.accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
    }
    
    return response;
  }

  async register(userData: { email: string; name: string; password: string; role?: string }) {
    return this.post('/api/auth/register', userData);
  }

  async logout() {
    await this.post('/api/auth/logout');
    this.clearToken();
  }

  async getMe() {
    return this.get('/api/auth/me');
  }

  // ==================== Articles ====================

  async getArticles(params?: { page?: number; limit?: number; status?: string; category?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.get(`/api/articles${query ? `?${query}` : ''}`);
  }

  async getArticle(id: string) {
    return this.get(`/api/articles/${id}`);
  }

  async getArticleBySlug(slug: string) {
    return this.get(`/api/articles/slug/${slug}`);
  }

  async createArticle(articleData: any) {
    return this.post('/api/articles', articleData);
  }

  async updateArticle(id: string, articleData: any) {
    return this.put(`/api/articles/${id}`, articleData);
  }

  async deleteArticle(id: string) {
    return this.delete(`/api/articles/${id}`);
  }

  // ==================== Messages ====================

  async getMessages(params?: { page?: number; limit?: number; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.get(`/api/messages${query ? `?${query}` : ''}`);
  }

  async getMessage(id: string) {
    return this.get(`/api/messages/${id}`);
  }

  async createMessage(messageData: any) {
    return this.post('/api/messages', messageData);
  }

  async updateMessageStatus(id: string, status: string) {
    return this.put(`/api/messages/${id}/status`, { status });
  }

  async replyToMessage(id: string, reply: string) {
    return this.post(`/api/messages/${id}/reply`, { reply });
  }

  async deleteMessage(id: string) {
    return this.delete(`/api/messages/${id}`);
  }

  // ==================== Users ====================

  async getUsers(params?: { page?: number; limit?: number; role?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.get(`/api/users${query ? `?${query}` : ''}`);
  }

  async getUser(id: string) {
    return this.get(`/api/users/${id}`);
  }

  async updateUser(id: string, userData: any) {
    return this.put(`/api/users/${id}`, userData);
  }

  async deleteUser(id: string) {
    return this.delete(`/api/users/${id}`);
  }

  // ==================== Analytics ====================

  async getAnalyticsOverview() {
    return this.get('/api/analytics/overview');
  }

  async getAnalyticsCharts(period?: string) {
    return this.get(`/api/analytics/charts${period ? `?period=${period}` : ''}`);
  }

  // ==================== Activities ====================

  async getActivities(params?: { page?: number; limit?: number; type?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.get(`/api/activities${query ? `?${query}` : ''}`);
  }

  // ==================== Carousel ====================

  async getCarouselSlides() {
    return this.get('/api/carousel');
  }

  async createCarouselSlide(slideData: any) {
    return this.post('/api/carousel', slideData);
  }

  async updateCarouselSlide(id: string, slideData: any) {
    return this.put(`/api/carousel/${id}`, slideData);
  }

  async deleteCarouselSlide(id: string) {
    return this.delete(`/api/carousel/${id}`);
  }

  async reorderCarouselSlides(order: string[]) {
    return this.put('/api/carousel/reorder', { order });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or multiple instances
export default ApiClient;


