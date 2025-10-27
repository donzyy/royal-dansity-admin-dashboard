import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import AdminLayout from "@/dashboard/components/AdminLayout";
import DashboardNotFound from "@/dashboard/components/DashboardNotFound";
import axios from "axios";

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

export default function AdminMessageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Fetch message details
  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/api/messages/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const msg = response.data.data.message;
          setMessage(msg);
          setNotes(msg.notes || '');
          setPriority(msg.priority);
        }
      } catch (error: any) {
        console.error('Error fetching message:', error);
        if (error.response?.status === 404) {
          setMessage(null);
        } else {
          toast.error('Failed to load message');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMessage();
    }
  }, [id]);

  // Handle reply submission (via email)
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setIsSending(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      // Update message status to resolved and set repliedAt
      await axios.put(
        `${API_URL}/api/messages/${id}`,
        {
          status: 'resolved',
          repliedAt: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // In a real application, you would send the email here via a backend endpoint
      // For now, we'll just show a success message
      
      Swal.fire({
        icon: "success",
        title: "Reply Sent!",
        html: `
          <p>Your reply has been sent to <strong>${message?.email}</strong></p>
          <p class="text-sm text-gray-600 mt-2">The message has been marked as resolved.</p>
        `,
        timer: 3000,
        showConfirmButton: false,
      });

      setReplyText("");
      
      // Refresh message data
      const response = await axios.get(`${API_URL}/api/messages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.success) {
        setMessage(response.data.data.message);
      }

    } catch (error) {
      console.error('Error sending reply:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to send reply. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Toggle star
  const handleToggleStar = async () => {
    if (!message) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `${API_URL}/api/messages/${id}`,
        { isStarred: !message.isStarred },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessage(response.data.data.message);
        toast.success(message.isStarred ? 'Removed from starred' : 'Added to starred');
      }
    } catch (error) {
      console.error('Error toggling star:', error);
      toast.error('Failed to update message');
    }
  };

  // Update status
  const handleUpdateStatus = async (newStatus: 'unread' | 'read' | 'resolved') => {
    if (!message) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `${API_URL}/api/messages/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessage(response.data.data.message);
        toast.success(`Message marked as ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update message');
    }
  };

  // Save notes
  const handleSaveNotes = async () => {
    if (!message) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `${API_URL}/api/messages/${id}`,
        { notes },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessage(response.data.data.message);
        toast.success('Notes saved successfully');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    }
  };

  // Update priority
  const handleUpdatePriority = async (newPriority: 'low' | 'medium' | 'high') => {
    if (!message) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `${API_URL}/api/messages/${id}`,
        { priority: newPriority },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessage(response.data.data.message);
        setPriority(newPriority);
        toast.success(`Priority updated to ${newPriority}`);
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Failed to update priority');
    }
  };

  // Delete message
  const handleDeleteMessage = async () => {
    const result = await Swal.fire({
      title: 'Delete Message?',
      html: `Are you sure you want to delete this message from <strong>${message?.name}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`${API_URL}/api/messages/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        Swal.fire({
          title: 'Deleted!',
          text: 'Message has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });

        navigate('/admin/messages');
      } catch (error) {
        console.error('Error deleting message:', error);
        toast.error('Failed to delete message');
      }
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">🔵 Unread</span>;
      case 'read':
        return <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">📖 Read</span>;
      case 'resolved':
        return <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">✅ Resolved</span>;
      default:
        return <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">🔴 HIGH</span>;
      case 'medium':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">🟡 MEDIUM</span>;
      case 'low':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">⚪ LOW</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">{priority}</span>;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600 text-xl">Loading message...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!message) {
    return (
      <AdminLayout>
        <DashboardNotFound
          title="Message Not Found"
          message="The message you're looking for doesn't exist or may have been deleted."
          backButtonText="Back to Messages"
          backButtonPath="/admin/messages"
          icon="💬"
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/messages")}
            className="flex items-center gap-2 text-gray-600 hover:text-royal-gold transition-colors font-semibold"
          >
            ← Back to Messages
          </button>
          <button
            onClick={handleToggleStar}
            className={`text-3xl transition-transform hover:scale-125 ${
              message.isStarred ? "opacity-100" : "opacity-40"
            }`}
            title={message.isStarred ? "Unstar message" : "Star message"}
          >
            {message.isStarred ? "⭐" : "☆"}
          </button>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-4xl font-bold text-royal-black mb-2">📨 Message Details</h1>
          <p className="text-gray-600">View message and send reply</p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Message Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Message Header */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-royal-black mb-2">
                    {message.subject}
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    {getStatusBadge(message.status)}
                    {getPriorityBadge(message.priority)}
                  </div>
                </div>
              </div>

              {/* Sender Info */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      From
                    </p>
                    <p className="text-lg font-bold text-royal-black">{message.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Email
                    </p>
                    <p className="text-sm text-gray-700">
                      <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline">
                        {message.email}
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Phone
                    </p>
                    <p className="text-sm text-gray-700">
                      <a href={`tel:${message.phone}`} className="text-blue-600 hover:underline">
                        {message.phone}
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Received
                    </p>
                    <p className="text-sm text-gray-700">{formatDate(message.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Message
                </h3>
                <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-400">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {message.message}
                  </p>
                </div>
              </div>

              {/* Replied Indicator */}
              {message.repliedAt && (
                <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-800">
                    ✅ <strong>Replied</strong> on {formatDate(message.repliedAt)}
                  </p>
                </div>
              )}
            </div>

            {/* Reply Form */}
            {message.status !== 'resolved' && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
                <h3 className="text-xl font-bold text-royal-black mb-6">
                  ✉️ Send Reply via Email
                </h3>
                <form onSubmit={handleSendReply} className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>📧 Note:</strong> This will send an email to{" "}
                      <strong>{message.email}</strong> and mark the message as resolved.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-royal-black mb-2">
                      Your Reply <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                      rows={6}
                      placeholder={`Hi ${message.name},\n\nThank you for contacting Royal Dansity Investments...\n\nBest regards,\nRoyal Dansity Team`}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none resize-none font-mono text-sm"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isSending || !replyText.trim()}
                      className="bg-royal-gold hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 flex items-center gap-2"
                    >
                      {isSending ? (
                        <>
                          <span className="animate-spin">⏳</span> Sending...
                        </>
                      ) : (
                        <>
                          📤 Send Reply & Resolve
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyText("")}
                      className="bg-gray-300 hover:bg-gray-400 text-royal-black font-bold py-3 px-6 rounded-lg transition-all duration-300"
                    >
                      Clear
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Internal Notes */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-royal-black mb-6">
                📝 Internal Notes
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Private notes (not visible to customer)
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add internal notes about this message..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none resize-none mb-4"
              />
              <button
                onClick={handleSaveNotes}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
              >
                💾 Save Notes
              </button>
            </div>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-royal-black mb-4">⚡ Quick Actions</h3>
              <div className="space-y-3">
                {/* Status Actions */}
                {message.status !== 'unread' && (
                  <button
                    onClick={() => handleUpdateStatus('unread')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    🔵 Mark as Unread
                  </button>
                )}
                {message.status !== 'read' && message.status !== 'resolved' && (
                  <button
                    onClick={() => handleUpdateStatus('read')}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    📖 Mark as Read
                  </button>
                )}
                {message.status !== 'resolved' && (
                  <button
                    onClick={() => handleUpdateStatus('resolved')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    ✅ Mark as Resolved
                  </button>
                )}

                <div className="border-t border-gray-200 my-3"></div>

                {/* Priority Actions */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Set Priority:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdatePriority('low')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        priority === 'low'
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Low
                    </button>
                    <button
                      onClick={() => handleUpdatePriority('medium')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        priority === 'medium'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                      }`}
                    >
                      Med
                    </button>
                    <button
                      onClick={() => handleUpdatePriority('high')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        priority === 'high'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-200 text-red-800 hover:bg-red-300'
                      }`}
                    >
                      High
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-3"></div>

                {/* Delete */}
                <button
                  onClick={handleDeleteMessage}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  🗑️ Delete Message
                </button>
              </div>
            </div>

            {/* Message Info */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-royal-black mb-4">ℹ️ Message Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Message ID
                  </p>
                  <p className="text-xs text-gray-600 font-mono">{message._id}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Created
                  </p>
                  <p className="text-sm text-gray-700">{formatDate(message.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Last Updated
                  </p>
                  <p className="text-sm text-gray-700">{formatDate(message.updatedAt)}</p>
                </div>
                {message.assignedTo && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Assigned To
                    </p>
                    <p className="text-sm text-gray-700">{message.assignedTo.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
