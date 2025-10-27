import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import AdminLayout from "@/dashboard/components/AdminLayout";
import DashboardNotFound from "@/dashboard/components/DashboardNotFound";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface Article {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author?: {
    _id: string;
    name: string;
    email: string;
  };
  authorName: string; // Fallback if author is not populated
  tags: string[];
  readTime: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  views?: number;
}

export default function AdminNewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/articles/${id}`);
      
      console.log('API Response:', response.data); // Debug log
      
      if (response.data.success) {
        // Backend returns data.article, not data.data
        setArticle(response.data.data.article || response.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching article:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!article) return;

    const result = await Swal.fire({
      title: 'Delete Article?',
      html: `Are you sure you want to delete <strong>"${article.title}"</strong>?<br/>This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/api/articles/${id}`);
      
      Swal.fire({
        title: 'Deleted!',
        text: 'Article has been deleted successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
      
      setTimeout(() => navigate('/admin/news'), 500);
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
    const colors: Record<string, { bg: string; text: string }> = {
      market: { bg: 'bg-blue-100', text: 'text-blue-800' },
      realestate: { bg: 'bg-green-100', text: 'text-green-800' },
      education: { bg: 'bg-purple-100', text: 'text-purple-800' },
      investment: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      technology: { bg: 'bg-pink-100', text: 'text-pink-800' },
    };
    return colors[category] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  };

  // Loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-royal-gold mb-4"></div>
            <p className="text-gray-600 text-lg">Loading article...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error/Not Found state
  if (error || !article) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <DashboardNotFound
            title="Article Not Found"
            message="The article you're looking for doesn't exist or may have been deleted."
            backButtonText="Back to News Management"
            backButtonPath="/admin/news"
            icon="📰"
          />
        </div>
      </AdminLayout>
    );
  }

  const colors = getCategoryColor(article.category);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/news")}
            className="flex items-center gap-2 text-royal-gold hover:text-yellow-600 font-bold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to News Management
          </button>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/admin/news/edit/${id}`)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-3 px-6 rounded-lg transition-all duration-300"
            >
              ✏️ Edit Article
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              className="bg-red-100 hover:bg-red-200 text-red-800 font-bold py-3 px-6 rounded-lg transition-all duration-300"
            >
              🗑️ Delete
            </motion.button>
          </div>
        </div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden"
        >
          {/* Featured Image */}
          {article.image && (
            <div className="w-full h-96 overflow-hidden">
              <img
                src={article.image.startsWith('http') ? article.image : `${API_URL}${article.image}`}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
          )}

          <div className="p-8">
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {article.category && (
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${colors.bg} ${colors.text}`}>
                  {getCategoryLabel(article.category)}
                </span>
              )}
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                article.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {article.status === 'published' ? 'Published' : 'Draft'}
              </span>
              <span className="text-sm text-gray-600">
                {(article.views || 0).toLocaleString()} views
              </span>
              {article.readTime && (
                <span className="text-sm text-gray-600">
                  {article.readTime}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-royal-black mb-4">
              {article.title}
            </h1>

            {/* Author and Date */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-royal-gold flex items-center justify-center text-white font-bold">
                  {(article.author?.name || article.authorName || 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-royal-black">
                    {article.author?.name || article.authorName || 'Unknown Author'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : new Date(article.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                  </p>
                </div>
              </div>
            </div>

            {/* Excerpt */}
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border-l-4 border-royal-gold">
              <p className="text-lg text-gray-700 font-semibold italic">
                {article.excerpt}
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-6">
              <div
                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-royal-black mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Metadata */}
            <div className="mt-8 pt-6 border-t border-gray-200 grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-semibold">Created:</span>{' '}
                {article.createdAt
                  ? new Date(article.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Last Updated:</span>{' '}
                {article.updatedAt
                  ? new Date(article.updatedAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Slug:</span> {article.slug || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Article ID:</span> {article._id || 'N/A'}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
