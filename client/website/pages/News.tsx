import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { io } from "socket.io-client";
import Header from "@/website/components/Header";
import Footer from "@/website/components/Footer";
import BackToTop from "@/website/components/BackToTop";

interface Article {
  _id: string;
  title: string;
  excerpt: string;
  image: string;
  slug: string;
  category: string;
  readTime: string;
  publishedAt?: string;
  createdAt: string;
  status: 'draft' | 'published';
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function News() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 4,
    total: 0,
    pages: 1,
  });

  const fallbackArticles: Article[] = [
    {
      _id: '1',
      title: "Market Trends: Q4 Investment Outlook",
      category: "Market News",
      slug: "market-trends-q4-investment-outlook",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop&q=80",
      excerpt: "Explore the latest market trends and investment opportunities for Q4 2024. Our experts share insights on portfolio diversification and emerging market opportunities.",
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'published',
    },
  ];

  const [categories, setCategories] = useState([
    { id: "all", label: "All Articles" },
  ]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/categories`, {
          params: { type: 'article', isActive: true },
        });
        if (response.data.success) {
          const apiCategories = response.data.data.categories.map((cat: any) => ({
            id: cat.name,
            label: cat.name,
          }));
          setCategories([{ id: "all", label: "All Articles" }, ...apiCategories]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        
        const params: any = {
          status: 'published',
          page: currentPage,
          limit: 4,
          sort: '-publishedAt',
        };

        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }

        const response = await axios.get(`${API_URL}/api/articles`, { params });

        if (response.data.success) {
          console.log('📊 API Response:', response.data.data);
          setArticles(response.data.data.articles);
          setPagination(response.data.data.pagination);
          console.log('📄 Pagination:', response.data.data.pagination);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
        // Use fallback on error
        if (articles.length === 0) {
          setArticles(fallbackArticles);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();

    // Set up Socket.IO for real-time updates
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('article:created', (newArticle: Article) => {
      if (newArticle.status === 'published') {
        // Refetch to maintain pagination
        fetchArticles();
      }
    });

    socket.on('article:updated', (updatedArticle: Article) => {
      setArticles((prev) => {
        const index = prev.findIndex(a => a._id === updatedArticle._id);
        if (index !== -1) {
          const newArticles = [...prev];
          newArticles[index] = updatedArticle;
          return newArticles.filter(a => a.status === 'published');
        }
        return prev;
      });
    });

    socket.on('article:deleted', (articleId: string) => {
      setArticles((prev) => prev.filter(a => a._id !== articleId));
    });

    return () => {
      socket.disconnect();
    };
  }, [currentPage, selectedCategory]);

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full">
      <Header />

      {/* Hero Section */}
      <div className="bg-royal-purple text-white pt-40 pb-20">
        <div className="container mx-auto px-6 md:px-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">News & Articles</h1>
          <p className="text-xl max-w-3xl opacity-90">
            Stay updated with the latest market insights, investment trends, and
            expert analysis from Royal Dansity.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <section className="py-12 bg-royal-container border-b border-gray-200">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-royal-gold text-white shadow-lg"
                    : "bg-white text-royal-black border-2 border-royal-gold/30 hover:border-royal-gold"
                }`}
              >
                {category.label}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20 md:py-28 bg-white min-h-screen">
        <div className="container mx-auto px-6 md:px-12">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-royal-gold"></div>
              <p className="mt-6 text-gray-600">Loading articles...</p>
            </div>
          ) : articles.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {articles.map((article, index) => (
                  <motion.article
                    key={article._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-royal-gold transition-all duration-300 flex flex-col group"
                  >
                    {/* Image */}
                    <div className="overflow-hidden h-48 relative">
                      <img
                        src={article.image.startsWith('http') ? article.image : `${API_URL}${article.image}`}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 bg-royal-gold text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {article.category}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Date and Read Time */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span className="font-semibold">{formatDate(article.publishedAt || article.createdAt)}</span>
                        <span>{article.readTime}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-royal-black mb-3 line-clamp-2 group-hover:text-royal-gold transition-colors">
                        {article.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">
                        {article.excerpt}
                      </p>

                      {/* Read More Button */}
                      {article.slug ? (
                        <Link
                          to={`/article/${article.slug}`}
                          className="text-royal-gold font-semibold hover:text-royal-copper transition-colors duration-200 self-start inline-flex items-center gap-2 group/link"
                        >
                          Read Article
                          <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-sm">Slug not available</span>
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center items-center gap-2"
                >
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-white'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-royal-gold text-white shadow-lg'
                          : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-royal-gold hover:text-royal-gold'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                      currentPage === pagination.pages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-white'
                    }`}
                  >
                    Next
                  </button>
                </motion.div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">
                    Page {pagination.page} of {pagination.pages} (Total: {pagination.total} articles)
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">
                No articles found in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-20 md:py-28 bg-royal-black text-white">
        <div className="container mx-auto px-6 md:px-12 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-center text-gray-300 mb-8">
            Get the latest market insights and investment tips delivered to your
            inbox weekly.
          </p>
          <form className="flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-lg text-royal-black focus:outline-none focus:ring-2 focus:ring-royal-gold"
              required
            />
            <button
              type="submit"
              className="bg-royal-gold hover:bg-yellow-600 text-white font-bold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
