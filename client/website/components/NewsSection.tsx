import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { io } from "socket.io-client";

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Fallback articles for when API is loading or unavailable
const fallbackArticles: Article[] = [
  {
    _id: '1',
    title: 'Market Trends: Q4 Investment Outlook',
    excerpt: 'Explore the latest market trends and investment opportunities for Q4 2024. Our experts share insights on portfolio diversification.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop&q=80',
    slug: 'market-trends-q4-investment-outlook',
    category: 'Market News',
    readTime: '5 min read',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    status: 'published',
  },
  {
    _id: '2',
    title: 'Real Estate Growth: Prime Locations',
    excerpt: 'Discover premium real estate investment opportunities in developing markets. Strategic locations for maximum returns.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&q=80',
    slug: 'real-estate-growth-prime-locations',
    category: 'Investment',
    readTime: '4 min read',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    status: 'published',
  },
  {
    _id: '3',
    title: 'Portfolio Management Best Practices',
    excerpt: 'Learn how successful investors manage their portfolios effectively. Key strategies for long-term wealth accumulation.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop&q=80',
    slug: 'portfolio-management-best-practices',
    category: 'Tips',
    readTime: '6 min read',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    status: 'published',
  },
];

export default function NewsSection() {
  const [articles, setArticles] = useState<Article[]>(fallbackArticles);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch published articles from API
    const fetchArticles = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/articles`, {
          params: {
            status: 'published',
            limit: 6,
            sort: '-publishedAt',
          },
        });

        if (response.data.success && response.data.data.articles.length > 0) {
          console.log('📰 Fetched articles:', response.data.data.articles);
          setArticles(response.data.data.articles);
        }
      } catch (error) {
        console.error('Error fetching articles:', error);
        // Keep fallback articles on error
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();

    // Set up Socket.IO for real-time updates
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('📰 Connected to articles WebSocket');
    });

    // Listen for article updates
    socket.on('article:created', (newArticle: Article) => {
      console.log('➕ New article published:', newArticle);
      if (newArticle.status === 'published') {
        setArticles((prevArticles) => [newArticle, ...prevArticles].slice(0, 6));
      }
    });

    socket.on('article:updated', (updatedArticle: Article) => {
      console.log('✏️ Article updated:', updatedArticle);
      setArticles((prevArticles) => {
        const index = prevArticles.findIndex(a => a._id === updatedArticle._id);
        if (index !== -1) {
          const newArticles = [...prevArticles];
          newArticles[index] = updatedArticle;
          return newArticles.filter(a => a.status === 'published');
        }
        // If article is newly published, add it
        if (updatedArticle.status === 'published') {
          return [updatedArticle, ...prevArticles].slice(0, 6);
        }
        return prevArticles;
      });
    });

    socket.on('article:deleted', (articleId: string) => {
      console.log('🗑️ Article deleted:', articleId);
      setArticles((prevArticles) => prevArticles.filter(a => a._id !== articleId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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

  if (loading) {
    return (
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-royal-gold"></div>
            <p className="mt-4 text-gray-600">Loading latest news...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center md:text-left"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-royal-black mb-3">
            Latest News & Insights
          </h2>
          <p className="text-lg text-gray-600">
            Stay updated with the latest developments from Royal Dansity.
          </p>
        </motion.div>

        {/* News Carousel */}
        <Swiper
          key={articles.map(a => a._id).join(',')}
          modules={[Navigation, Autoplay]}
          navigation={{
            nextEl: ".news-swiper-button-next",
            prevEl: ".news-swiper-button-prev",
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          spaceBetween={24}
          loop={true}
          loopedSlides={articles.length}
          className="mb-8"
        >
          {articles.map((article, index) => (
            <SwiperSlide key={article._id}>
              <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
                {/* Image */}
                <div className="overflow-hidden h-40 md:h-48 relative">
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
                      Read More 
                      <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-sm">Slug not available</span>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex gap-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="news-swiper-button-prev w-12 h-12 rounded-full border-2 border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-white transition-all duration-300 flex items-center justify-center"
              aria-label="Previous articles"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="news-swiper-button-next w-12 h-12 rounded-full border-2 border-royal-gold text-royal-gold hover:bg-royal-gold hover:text-white transition-all duration-300 flex items-center justify-center"
              aria-label="Next articles"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.button>
          </div>

          {/* View All News Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/news"
              className="bg-royal-gold hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 inline-block"
            >
              View All News
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
