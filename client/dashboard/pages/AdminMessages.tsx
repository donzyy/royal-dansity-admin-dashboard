import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/dashboard/components/AdminLayout";
import axios from "@/lib/axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface Message {
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
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  unread: number;
  read: number;
  resolved: number;
  starred: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminMessages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    unread: 0,
    read: 0,
    resolved: 0,
    starred: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 15,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read' | 'resolved' | 'starred'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch messages from API
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Build query params
      const params: any = {
        page: currentPage,
        limit: 15,
        sort: '-createdAt',
      };

      if (filterStatus !== 'all') {
        if (filterStatus === 'starred') {
          params.isStarred = 'true';
        } else {
          params.status = filterStatus;
        }
      }

      if (filterPriority !== 'all') {
        params.priority = filterPriority;
      }

      const response = await axios.get('/messages', { params });

      if (response.data.success) {
        setMessages(response.data.data.messages);
        setStats(response.data.data.stats);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [currentPage, filterStatus, filterPriority]);

  // Search handler
  const handleSearch = () => {
    setCurrentPage(1);
    fetchMessages();
  };

  // Search messages (client-side for now)
  const filteredMessages = messages.filter((msg) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      msg.name.toLowerCase().includes(search) ||
      msg.email.toLowerCase().includes(search) ||
      msg.subject.toLowerCase().includes(search) ||
      msg.message.toLowerCase().includes(search)
    );
  });

  // Toggle star
  const handleToggleStar = async (id: string, currentStarred: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`/messages/${id}`, { isStarred: !currentStarred });

      toast.success(currentStarred ? 'Removed from starred' : 'Added to starred');
      
      // Refresh data to update stats and list
      fetchMessages();
    } catch (error) {
      console.error('Error toggling star:', error);
      toast.error('Failed to update message');
    }
  };

  // Toggle status
  const handleToggleStatus = async (id: string, newStatus: 'unread' | 'read' | 'resolved') => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`/messages/${id}`, { status: newStatus });

      // Update local state
      setMessages(messages.map((msg) =>
        msg._id === id ? { ...msg, status: newStatus } : msg
      ));

      toast.success(`Message marked as ${newStatus}`);
      fetchMessages(); // Refresh to update stats
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update message');
    }
  };

  // Delete message
  const handleDeleteMessage = async (id: string, subject: string) => {
    const result = await Swal.fire({
      title: 'Delete Message?',
      html: `Are you sure you want to delete this message?<br/><br/><strong>"${subject}"</strong>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/messages/${id}`);

        Swal.fire({
          title: 'Deleted!',
          text: 'Message has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });

        fetchMessages(); // Refresh list
      } catch (error) {
        console.error('Error deleting message:', error);
        toast.error('Failed to delete message');
      }
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-gray-100 text-gray-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority badge color
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && messages.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-royal-gold mb-4"></div>
            <p className="text-gray-600 text-lg">Loading messages...</p>
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
            <h1 className="text-4xl font-bold text-royal-black mb-2">📨 Messages</h1>
            <p className="text-gray-600">
              View and manage customer messages and inquiries
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-6">
          <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Total Message</p>
            <p className="text-3xl font-bold text-purple-600">{stats.total}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Unread Message</p>
            <p className="text-3xl font-bold text-blue-600">{stats.unread}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Read Message</p>
            <p className="text-3xl font-bold text-gray-600">{stats.read}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Resolved Message</p>
            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
            <p className="text-sm font-semibold text-gray-600 mb-1">Starred Message</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.starred}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Messages
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search name, email, subject..."
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
              <label htmlFor="statusFilter" className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none transition-colors"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="resolved">Resolved</option>
                <option value="starred">Starred</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label htmlFor="priorityFilter" className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priorityFilter"
                value={filterPriority}
                onChange={(e) => {
                  setFilterPriority(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none transition-colors"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-royal-gold/10 to-yellow-100 border-b-2 border-royal-gold">
                <tr>
                  <th className="px-4 py-4 text-center">
                    <span className="font-bold text-royal-black">⭐</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="font-bold text-royal-black">From</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="font-bold text-royal-black">Subject</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="font-bold text-royal-black">Date</span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="font-bold text-royal-black">Priority</span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="font-bold text-royal-black">Status</span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="font-bold text-royal-black">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((msg) => (
                    <tr
                      key={msg._id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${
                        msg.status === 'unread' ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => navigate(`/admin/messages/${msg._id}`)}
                    >
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStar(msg._id, msg.isStarred);
                          }}
                          className="text-xl hover:scale-125 transition-transform"
                          title={msg.isStarred ? 'Unstar' : 'Star'}
                        >
                          {msg.isStarred ? '⭐' : '☆'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-royal-black">
                            {msg.name}
                          </p>
                          <p className="text-xs text-gray-500">{msg.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 truncate max-w-md">
                          {msg.subject}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-md mt-1">
                          {msg.message.substring(0, 60)}...
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(msg.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full font-semibold text-xs uppercase ${getPriorityBadgeColor(
                            msg.priority
                          )}`}
                        >
                          {msg.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full font-semibold text-xs uppercase ${getStatusBadgeColor(
                            msg.status
                          )}`}
                        >
                          {msg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/messages/${msg._id}`);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(
                                msg._id,
                                msg.status === 'unread' ? 'read' : 'unread'
                              );
                            }}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title={msg.status === 'unread' ? 'Mark as Read' : 'Mark as Unread'}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMessage(msg._id, msg.subject);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-600 font-semibold"
                    >
                      {searchTerm ? 'No messages match your search' : 'No messages found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredMessages.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total messages)
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
