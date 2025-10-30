import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "@/lib/axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { io, Socket } from "socket.io-client";
import AdminLayout from "@/dashboard/components/AdminLayout";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface Article {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string; // Backend uses 'image', not 'featuredImage'
  author: {
    name: string;
    avatar?: string;
  };
  tags: string[];
  readTime: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  views: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

type SortField = "title" | "createdAt" | "status" | "views";
type SortOrder = "asc" | "desc";

export default function AdminNews() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [socket, setSocket] = useState<Socket | null>(null);

  // Socket.IO setup
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || API_URL);
    setSocket(newSocket);

    newSocket.on('article:created', (data: Article) => {
      console.log('Article created:', data);
      fetchArticles(); // Refresh the list
      toast.success('New article created!');
    });

    newSocket.on('article:updated', (data: Article) => {
      console.log('Article updated:', data);
      setArticles(prev => prev.map(article =>
        article._id === data._id ? data : article
      ));
      toast.success('Article updated!');
    });

    newSocket.on('article:deleted', (data: { id: string }) => {
      console.log('Article deleted:', data);
      setArticles(prev => prev.filter(article => article._id !== data.id));
      toast.success('Article deleted!');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [currentPage, filterStatus, filterCategory, sortField, sortOrder, searchTerm]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: currentPage,
        limit: pagination.limit,
        sort: sortOrder === 'desc' ? `-${sortField}` : sortField,
      };

      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      if (filterCategory !== 'all') {
        params.category = filterCategory;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await axios.get('/articles', { params });
      
      if (response.data.success) {
        setArticles(response.data.data.articles);
        setPagination(response.data.data.pagination);
      }
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      toast.error(error.response?.data?.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    // Trigger a re-fetch by updating the dependency
    fetchArticles();
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDelete = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: 'Delete Article?',
      html: `Are you sure you want to delete <strong>"${title}"</strong>?<br/>This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await axios.delete(`/articles/${id}`);
      
      Swal.fire({
        title: 'Deleted!',
        text: 'Article has been deleted successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
      
      fetchArticles();
    } catch (error: any) {
      console.error('Error deleting article:', error);
      
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to delete article',
        icon: 'error',
        confirmButtonColor: '#B87333',
      });
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      market: 'Market Insights',
      realestate: 'Real Estate',
      education: 'Education',
      investment: 'Investment',
      technology: 'Technology',
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      market: 'bg-blue-100 text-blue-800',
      realestate: 'bg-green-100 text-green-800',
      education: 'bg-purple-100 text-purple-800',
      investment: 'bg-yellow-100 text-yellow-800',
      technology: 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Loading state
  if (loading && articles.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-royal-gold mb-4"></div>
            <p className="text-gray-600 text-lg">Loading articles...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-royal-black mb-2">
              📰 News Management
            </h1>
            <p className="text-gray-600">Create, edit, and manage articles</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/news/create')}
            className="bg-royal-gold hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Article
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Total Articles</p>
            <p className="text-3xl font-bold text-blue-600">{pagination.total}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Published</p>
            <p className="text-3xl font-bold text-green-600">
              {articles.filter(a => a.status === 'published').length}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Drafts</p>
            <p className="text-3xl font-bold text-yellow-600">
              {articles.filter(a => a.status === 'draft').length}
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Total Views</p>
            <p className="text-3xl font-bold text-purple-600">
              {articles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Articles
              </label>
              <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by title, content, tags..."
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none transition-colors"
                />
                <button
                  onClick={handleSearch}
                  className="bg-royal-gold hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none transition-colors"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filterCategory}
            onChange={(e) => {
                  setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none transition-colors"
              >
                <option value="all">All Categories</option>
                <option value="market">Market Insights</option>
                <option value="realestate">Real Estate</option>
                <option value="education">Education</option>
                <option value="investment">Investment</option>
                <option value="technology">Technology</option>
              </select>
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-royal-gold/10 to-yellow-100 border-b-2 border-royal-gold">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('title')}
                      className="font-bold text-royal-black hover:text-yellow-600 transition-colors flex items-center gap-1"
                    >
                      Article {getSortIcon('title')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('status')}
                      className="font-bold text-royal-black hover:text-yellow-600 transition-colors flex items-center gap-1"
                    >
                      Status {getSortIcon('status')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="font-bold text-royal-black hover:text-yellow-600 transition-colors flex items-center gap-1"
                    >
                      Date {getSortIcon('createdAt')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="font-bold text-royal-black">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {articles.map((article, index) => (
                    <motion.tr
                      key={article._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={
                              article.image 
                                ? (article.image.startsWith('http') 
                                    ? article.image 
                                    : `${API_URL}${article.image}`)
                                : '/placeholder.svg'
                            }
                            alt={article.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-royal-black line-clamp-1">
                        {article.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {article.excerpt}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              By {article.author.name} • {article.readTime}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          article.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {article.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(article.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/news/${article._id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => navigate(`/admin/news/edit/${article._id}`)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(article._id, article.title)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {articles.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📰</div>
              <p className="text-gray-600 font-semibold text-lg mb-2">No articles found</p>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first article to get started'}
              </p>
              {!searchTerm && filterStatus === 'all' && filterCategory === 'all' && (
                <button
                  onClick={() => navigate('/admin/news/edit/new')}
                  className="bg-royal-gold hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Create First Article
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {articles.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total articles)
              </p>
              <div className="flex gap-2">
            <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold hover:border-royal-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === pagination.pages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border-2 rounded-lg font-semibold transition-colors ${
                          currentPage === page
                            ? 'bg-royal-gold text-white border-royal-gold'
                            : 'border-gray-200 hover:border-royal-gold'
                        }`}
                      >
                        {page}
            </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 py-2">...</span>;
                  }
                  return null;
                })}
            <button
                  onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                  disabled={currentPage === pagination.pages}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold hover:border-royal-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
            </button>
          </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
