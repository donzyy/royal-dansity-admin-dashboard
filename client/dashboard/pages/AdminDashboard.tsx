import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "@/lib/axios";
import AdminLayout from "@/dashboard/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalMessages: number;
  unreadMessages: number;
  totalCarouselSlides: number;
  totalUsers: number;
  recentActivities: any[];
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [articlesRes, messagesRes, carouselRes, usersRes, activitiesRes] = await Promise.all([
        axios.get('/articles'),
        axios.get('/messages'),
        axios.get('/carousel'),
        axios.get('/users'),
        axios.get('/activities?limit=10'),
      ]);

      // Process articles
      const allArticles = articlesRes.data.data.articles || [];
      const published = allArticles.filter((a: any) => a.status === 'published');
      const drafts = allArticles.filter((a: any) => a.status === 'draft');

      // Process messages
      const allMessages = messagesRes.data.data.messages || [];
      const unread = allMessages.filter((m: any) => !m.isRead);

      // Set stats
      setStats({
        totalArticles: allArticles.length,
        publishedArticles: published.length,
        draftArticles: drafts.length,
        totalMessages: allMessages.length,
        unreadMessages: unread.length,
        totalCarouselSlides: carouselRes.data.data?.length || 0,
        totalUsers: usersRes.data.data.users?.length || 0,
        recentActivities: [],
      });

      // Set recent data
      setRecentArticles(allArticles.slice(0, 5));
      setRecentMessages(unread.slice(0, 5));
      setRecentActivities(activitiesRes.data.data.activities || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const userRoleData = [
    { name: "Admin", value: 2 },
    { name: "Editor", value: 2 },
    { name: "Viewer", value: 2 },
  ];

  const COLORS = ["#6a2d91", "#c9942b", "#b87333"];

  // Loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-royal-gold mb-4"></div>
            <p className="text-gray-600 text-lg">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-royal-black mb-2">
            Welcome back, {user?.name || 'Admin'}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your website today.
          </p>
        </div>

        {/* Quick Actions - Top Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-royal-gold to-royal-copper rounded-2xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-6">🚀 Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link
              to="/admin/news"
              className="bg-white/20 hover:bg-white/30 rounded-lg p-4 transition-all duration-300 text-center font-semibold flex items-center justify-center gap-2"
            >
              ✍️ Create Article
            </Link>
            <Link
              to="/admin/carousel"
              className="bg-white/20 hover:bg-white/30 rounded-lg p-4 transition-all duration-300 text-center font-semibold flex items-center justify-center gap-2"
            >
              🎠 Manage Carousel
            </Link>
            <Link
              to="/admin/messages"
              className="bg-white/20 hover:bg-white/30 rounded-lg p-4 transition-all duration-300 text-center font-semibold flex items-center justify-center gap-2"
            >
              💬 View Messages
              {stats && stats.unreadMessages > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {stats.unreadMessages}
                </span>
              )}
            </Link>
            <Link
              to="/admin/users"
              className="bg-white/20 hover:bg-white/30 rounded-lg p-4 transition-all duration-300 text-center font-semibold flex items-center justify-center gap-2"
            >
              👥 Manage Users
            </Link>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-blue-100 rounded-2xl p-6 border-2 border-gray-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Total Articles
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.totalArticles || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats?.publishedArticles || 0} published, {stats?.draftArticles || 0} drafts
                </p>
              </div>
              <span className="text-3xl">📰</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-green-100 rounded-2xl p-6 border-2 border-gray-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Messages
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats?.totalMessages || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats?.unreadMessages || 0} unread
                </p>
              </div>
              <span className="text-3xl">💬</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-purple-100 rounded-2xl p-6 border-2 border-gray-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Carousel Slides
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats?.totalCarouselSlides || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Active slides
                </p>
              </div>
              <span className="text-3xl">🎠</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-orange-100 rounded-2xl p-6 border-2 border-gray-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats?.totalUsers || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  System users
                </p>
              </div>
              <span className="text-3xl">👥</span>
            </div>
          </motion.div>
        </div>

        {/* Recent Content Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Articles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-2xl shadow-md border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-royal-black">
                📰 Recent Articles
              </h2>
              <Link
                to="/admin/news"
                className="text-royal-gold hover:text-yellow-600 text-sm font-semibold transition-colors"
              >
                View All →
              </Link>
            </div>
            {recentArticles.length > 0 ? (
              <div className="space-y-4">
                {recentArticles.map((article: any) => (
                  <Link
                    key={article._id}
                    to={`/admin/news/${article._id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-royal-black mb-1 line-clamp-1">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full ${
                            article.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {article.status}
                          </span>
                          <span>{article.category}</span>
                          <span>•</span>
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No articles yet</p>
                <Link
                  to="/admin/news"
                  className="inline-block bg-royal-gold hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-lg transition-all"
                >
                  Create Your First Article
                </Link>
              </div>
            )}
          </motion.div>

          {/* Recent Messages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-2xl shadow-md border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-royal-black">
                💬 Recent Messages
              </h2>
              <Link
                to="/admin/messages"
                className="text-royal-gold hover:text-yellow-600 text-sm font-semibold transition-colors"
              >
                View All →
              </Link>
            </div>
            {recentMessages.length > 0 ? (
              <div className="space-y-4">
                {recentMessages.map((message: any) => (
                  <Link
                    key={message._id}
                    to={`/admin/messages/${message._id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-royal-black mb-1">
                          {message.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">{message.email}</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {message.subject}
                        </p>
                      </div>
                      {!message.isRead && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {message.message}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No new messages</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Charts Section - Coming Soon */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-royal-black mb-6">
              📈 Traffic Analytics
            </h2>
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-600 font-semibold">Coming Soon!</p>
                <p className="text-sm text-gray-500 mt-2">
                  Traffic analytics will be available here
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-royal-black mb-6">
              📊 Page Performance  
            </h2>
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-6xl mb-4">📈</div>
                <p className="text-gray-600 font-semibold">Coming Soon!</p>
                <p className="text-sm text-gray-500 mt-2">
                  Page analytics will be available here
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-white rounded-2xl shadow-md border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-royal-black">
              🕒 Recent Activity
            </h2>
            <Link
              to="/admin/activity"
              className="text-royal-gold hover:text-yellow-600 text-sm font-semibold transition-colors"
            >
              View All →
            </Link>
          </div>

          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.slice(0, 6).map((activity: any, index: number) => (
                <div
                  key={activity._id}
                  className="flex gap-4 relative"
                >
                  {/* Timeline line */}
                  {index < recentActivities.slice(0, 6).length - 1 && (
                    <div className="absolute left-5 top-12 w-0.5 h-12 bg-gradient-to-b from-royal-gold to-gray-300"></div>
                  )}

                  {/* Timeline dot and icon */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-royal-gold/10 flex items-center justify-center text-lg border-2 border-royal-gold z-10">
                      {activity.type === 'article_created' && '📝'}
                      {activity.type === 'article_updated' && '✏️'}
                      {activity.type === 'article_deleted' && '🗑️'}
                      {activity.type === 'user_login' && '🔐'}
                      {activity.type === 'user_register' && '👤'}
                      {activity.type === 'carousel_updated' && '🎠'}
                      {activity.type === 'message_received' && '💬'}
                      {!['article_created', 'article_updated', 'article_deleted', 'user_login', 'user_register', 'carousel_updated', 'message_received'].includes(activity.type) && '📌'}
                    </div>
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 pt-1 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-royal-black">
                          {activity.description}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          By: <span className="font-medium">{activity.actorName || 'System'}</span>
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(activity.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}

          {recentActivities.length > 0 && (
            <div className="border-t border-gray-200 mt-6 pt-4">
              <Link
                to="/admin/activity"
                className="block text-center text-royal-gold hover:text-yellow-600 font-semibold transition-colors"
              >
                View Complete Activity Log →
              </Link>
            </div>
          )}
        </motion.div>

      </div>
    </AdminLayout>
  );
}
