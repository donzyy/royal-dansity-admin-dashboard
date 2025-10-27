import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import AdminLayout from "@/dashboard/components/AdminLayout";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface Activity {
  _id: string;
  type: string;
  description: string;
  actorId?: string;
  actorName?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: any;
  createdAt: string;
}

export default function AdminActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/activities`);
      setActivities(response.data.data.activities || []);
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      setError(err.response?.data?.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  // Group activities by month/year
  const groupedActivities = activities.reduce(
    (acc, activity) => {
      const date = new Date(activity.createdAt);
      const monthYear = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });

      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(activity);
      return acc;
    },
    {} as Record<string, Activity[]>
  );

  // Sort months in descending order (newest first)
  const sortedMonths = Object.keys(groupedActivities).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });

  // Get icon for activity type
  const getActivityIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      'news_add': '📝',
      'news_edit': '✏️',
      'news_delete': '🗑️',
      'article_created': '📝',
      'article_updated': '✏️',
      'article_deleted': '🗑️',
      'category_add': '🏷️',
      'category_edit': '✏️',
      'category_delete': '🗑️',
      'user_login': '🔐',
      'user_register': '👤',
      'user_created': '👤',
      'user_updated': '✏️',
      'user_deleted': '🗑️',
      'user_edit': '✏️',
      'user_delete': '🗑️',
      'carousel_add': '🎠',
      'carousel_edit': '🎠',
      'carousel_delete': '🎠',
      'carousel_created': '🎠',
      'carousel_updated': '🎠',
      'carousel_deleted': '🎠',
      'message_reply': '💬',
      'message_received': '💬',
      'message_read': '✅',
      'message_deleted': '🗑️',
      'login': '🔐',
      'logout': '🚪',
    };
    return iconMap[type] || '📌';
  };

  // Loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-royal-gold mb-4"></div>
            <p className="text-gray-600 text-lg">Loading activity log...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Activities</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchActivities}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
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
            📋 Activity Log
          </h1>
          <p className="text-gray-600">
            Complete history of all platform activities and changes
          </p>
        </div>

        {/* Activity Summary Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-royal-gold/10 to-yellow-100 rounded-xl p-8 border-l-4 border-royal-gold"
        >
          <h3 className="font-bold text-lg text-royal-black mb-6">📊 Activity Summary</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <p className="text-3xl font-bold text-royal-black">
                {activities.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Activities</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-royal-black">
                {sortedMonths.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Months with Activity</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-royal-black">
                {new Set(activities.map((a) => a.actorName || 'System')).size}
              </p>
              <p className="text-sm text-gray-600 mt-1">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-royal-black">
                {new Set(activities.map((a) => a.type)).size}
              </p>
              <p className="text-sm text-gray-600 mt-1">Activity Types</p>
            </div>
          </div>
        </motion.div>

        {/* Activity Timeline by Month */}
        <div className="space-y-12">
          {sortedMonths.map((monthYear) => (
            <div key={monthYear} className="space-y-6">
              {/* Month Header */}
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold text-royal-black">
                  🗓 {monthYear}
                </h2>
                <div className="flex-1 h-1 bg-gradient-to-r from-royal-gold to-transparent rounded-full"></div>
              </div>

              {/* Activities for this month */}
              <div className="space-y-4">
                {groupedActivities[monthYear]
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map((activity, index) => (
                    <motion.div
                      key={activity._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex gap-4 relative bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      {/* Timeline line (only if not last) */}
                      {index <
                        groupedActivities[monthYear].length - 1 && (
                        <div className="absolute left-12 top-16 w-0.5 h-12 bg-gradient-to-b from-royal-gold to-gray-300"></div>
                      )}

                      {/* Icon and dot */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-royal-gold/10 flex items-center justify-center text-2xl border-2 border-royal-gold z-10">
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>

                      {/* Activity Details */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-royal-black mb-1">
                              {activity.description}
                            </h3>
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">By:</span>{" "}
                              {activity.actorName || 'System'}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(activity.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                          <span className="inline-block px-3 py-1 bg-royal-gold/10 text-royal-black text-xs font-semibold rounded-full whitespace-nowrap flex-shrink-0">
                            {activity.type.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedMonths.length === 0 && (
          <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
            <p className="text-gray-600 font-semibold text-lg">
              No activities recorded yet
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Activity logs will appear here as you make changes to the platform
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
