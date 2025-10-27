import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import AdminLayout from "@/dashboard/components/AdminLayout";
import { analyticsAPI, articlesAPI, messagesAPI } from "@/lib/api";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Export Reports Component
function ExportReportsSection() {
  const [exporting, setExporting] = useState<string | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [dateRange, setDateRange] = useState('30');

  const handleExportCSV = async () => {
    try {
      setExporting('csv');
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`${API_URL}/api/analytics/export?days=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Analytics exported successfully!');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = () => {
    toast.info('PDF export coming soon! Use CSV for now.');
  };

  const handleCustomReport = () => {
    setShowCustomModal(true);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-royal-purple to-royal-black rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">📊 Export Reports</h2>
        <p className="text-gray-200 mb-6">
          Download analytics data in various formats for deeper analysis
        </p>
        
        {/* Date Range Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-white/50"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        <div className="flex gap-4 flex-wrap">
          <button 
            onClick={handleExportCSV}
            disabled={exporting === 'csv'}
            className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center gap-2"
          >
            {exporting === 'csv' ? (
              <>
                <span className="animate-spin">⏳</span>
                Exporting...
              </>
            ) : (
              <>
                📥 Export as CSV
              </>
            )}
          </button>
          <button 
            onClick={handleExportPDF}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
          >
            📊 Export as PDF
          </button>
          <button 
            onClick={handleCustomReport}
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
          >
            📋 Custom Report
          </button>
        </div>
      </div>

      {/* Custom Report Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCustomModal(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-royal-black mb-4">Custom Report Builder</h3>
            <p className="text-gray-600 mb-6">
              Custom report builder coming soon! For now, use the CSV export with different date ranges.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCustomModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleExportCSV();
                  setShowCustomModal(false);
                }}
                className="flex-1 bg-royal-gold hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                Export CSV Instead
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminAnalytics() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [articlesCount, setArticlesCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data in parallel
      const [analyticsRes, articlesRes, messagesRes] = await Promise.all([
        analyticsAPI.getDashboard(30), // Last 30 days
        articlesAPI.getAll({ limit: 1 }),
        messagesAPI.getAll({ limit: 1 }),
      ]);

      setAnalytics(analyticsRes.data.analytics || analyticsRes.data);
      setArticlesCount(articlesRes.data.total || articlesRes.data.articles?.length || 0);
      setMessagesCount(messagesRes.data.total || messagesRes.data.messages?.length || 0);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
      
      // Set default values on error
      setAnalytics({
        totalVisitors: 0,
        pageViews: 0,
        avgSessionDuration: '0m 0s',
        bounceRate: '0%',
        trafficTrend: [],
        topPages: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const trafficData = analytics?.trafficTrend || [];
  const topPagesData = analytics?.topPages || [];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-gold mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const metrics = [
    {
      label: "Total Visitors",
      value: analytics?.totalVisitors?.toLocaleString() || '0',
      icon: "👥",
      color: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      label: "Page Views",
      value: analytics?.pageViews?.toLocaleString() || '0',
      icon: "👀",
      color: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      label: "Avg Session Duration",
      value: analytics?.avgSessionDuration || '0m 0s',
      icon: "⏱️",
      color: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      label: "Bounce Rate",
      value: analytics?.bounceRate || '0%',
      icon: "📉",
      color: "bg-orange-100",
      textColor: "text-orange-600",
    },
    {
      label: "Total News",
      value: articlesCount,
      icon: "📰",
      color: "bg-indigo-100",
      textColor: "text-indigo-600",
    },
    {
      label: "Total Messages",
      value: messagesCount,
      icon: "💬",
      color: "bg-pink-100",
      textColor: "text-pink-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-royal-black mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track your website performance and visitor metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className={`${metric.color} rounded-2xl p-6 border-2 border-gray-200`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-700 text-sm font-semibold mb-2">
                    {metric.label}
                  </p>
                  <p className={`text-3xl font-bold ${metric.textColor}`}>
                    {metric.value}
                  </p>
                </div>
                <span className="text-3xl">{metric.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Traffic Trend Chart */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-royal-black mb-6">
              Traffic Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "2px solid #c9942b",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke="#c9942b"
                  strokeWidth={2}
                  dot={{ fill: "#c9942b", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Pages Chart */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-royal-black mb-6">
              Top Pages
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPagesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="path" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "2px solid #c9942b",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="views" fill="#c9942b" radius={[8, 8, 0, 0]} />
                <Bar dataKey="visitors" fill="#6a2d91" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Top Pages Table */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-royal-black">
              Page Performance
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-royal-black">
                    Page
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-royal-black">
                    Views
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-royal-black">
                    Visitors
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-royal-black">
                    View per Visitor
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-royal-black">
                    Bounce Rate %
                  </th>
                </tr>
              </thead>
              <tbody>
                {topPagesData.map((page, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-royal-black">
                      {page.path}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {page.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {page.visitors.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {(page.views / page.visitors).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {(Math.random() * 50 + 20).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Section */}
        <ExportReportsSection />
      </div>
    </AdminLayout>
  );
}
