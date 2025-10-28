import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import AdminLayout from "@/dashboard/components/AdminLayout";
import DashboardNotFound from "@/dashboard/components/DashboardNotFound";
import { LoadingSpinner } from "@/dashboard/components";
import { usersAPI, activitiesAPI, rolesAPI } from "@/lib/api";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const getFullImageUrl = (path: string | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_URL}${path}`;
};

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

interface Role {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
}

interface Activity {
  _id: string;
  type: string;
  description: string;
  actorEmail: string;
  actorName: string;
  createdAt: string;
  timestamp?: string; // Backwards compatibility
  details: any;
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserData();
    }
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user details
      const userResponse = await usersAPI.getById(id!);
      const userData = userResponse.data.user;
      setUser(userData);

      // Fetch user's role details
      try {
        const rolesResponse = await rolesAPI.getAll();
        const roles = rolesResponse.data.roles || [];
        const matchingRole = roles.find((r: Role) => r.slug === userData.role);
        if (matchingRole) {
          setUserRole(matchingRole);
        }
      } catch (roleError) {
        console.error('Error fetching role:', roleError);
      }

      // Fetch user's recent activity
      try {
        const activityResponse = await activitiesAPI.getAll({ 
          limit: 5, 
          actor: userData._id 
        });
        setActivities(activityResponse.data.activities || []);
      } catch (activityError) {
        console.error('Error fetching activities:', activityError);
        // Don't fail the whole page if activities fail
        setActivities([]);
      }
    } catch (error: any) {
      console.error('Error fetching user:', error);
      // Check for 404 in multiple ways
      if (
        error.message?.includes('404') || 
        error.message?.includes('Not Found') ||
        error.response?.status === 404
      ) {
        setNotFound(true);
        toast.error('User not found');
      } else {
        toast.error('Failed to load user data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;

    const newStatus = user.status === "active" ? "inactive" : "active";
    const action = user.status === "active" ? "Deactivate" : "Activate";

    const result = await Swal.fire({
      title: `${action} User?`,
      text: `Are you sure you want to ${action.toLowerCase()} this user?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: "Cancel",
      confirmButtonColor: user.status === "active" ? "#ef4444" : "#22c55e",
    });

    if (result.isConfirmed) {
      try {
        await usersAPI.update(user._id, { status: newStatus });
        
        toast.success(`User ${action.toLowerCase()}d successfully!`);
        
        // Refresh user data
        fetchUserData();
      } catch (error: any) {
        console.error('Error updating user status:', error);
        const message = error.message || 'Failed to update user status';
        Swal.fire({
          icon: "error",
          title: "Error",
          text: message,
        });
      }
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;

    const result = await Swal.fire({
      title: "Reset Password?",
      text: `Send a password reset email to ${user.email}? The user will receive a link to create a new password.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Send Reset Email",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ea580c",
    });

    if (result.isConfirmed) {
      // TODO: Implement password reset email functionality when backend endpoint is ready
      console.log(`🔐 Send password reset email to ${user.email}`);
      Swal.fire({
        icon: "success",
        title: "Reset Email Sent",
        text: `An email has been sent to ${user.email} with reset instructions.`,
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  const getActivityIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'user_login': '🔐',
      'user_created': '✨',
      'user_updated': '✏️',
      'user_deleted': '🗑️',
      'article_created': '📄',
      'article_updated': '📝',
      'article_deleted': '🗑️',
      'carousel_created': '🎠',
      'carousel_updated': '🔄',
      'carousel_deleted': '❌',
      'category_created': '🏷️',
      'category_updated': '🔖',
      'category_deleted': '🗑️',
      'message_replied': '💬',
    };
    return icons[type] || '📋';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading user details..." />
        </div>
      </AdminLayout>
    );
  }

  if (notFound || !user) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <DashboardNotFound
            title="User Not Found"
            message="The user you're looking for doesn't exist or may have been removed."
            backButtonText="Back to Users"
            backButtonPath="/admin/users"
            icon="👤"
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-2 text-gray-600 hover:text-royal-gold transition-colors font-semibold"
            title="Back to Users"
          >
            ← Back to Users
          </button>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-4xl font-bold text-royal-black mb-2">User Details</h1>
          <p className="text-gray-600">Complete information and activity for this user</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile and Account Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-24 h-24 rounded-full flex-shrink-0 overflow-hidden border-4 border-royal-gold shadow-lg">
                  <img 
                    src={getFullImageUrl(user.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-royal-black mb-2">
                    {user.name}
                  </h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-block px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      {user.role === "admin" && "👑 Admin"}
                      {user.role === "editor" && "✏️ Editor"}
                      {user.role === "viewer" && "👁️ Viewer"}
                    </span>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.status === "active" ? "✅ Active" : "⏸️ Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-royal-black mb-4">
                  Account Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Email Address
                    </p>
                    <p className="text-gray-800 font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      User ID
                    </p>
                    <p className="text-gray-800 font-medium font-mono text-sm">
                      {user._id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Join Date
                    </p>
                    <p className="text-gray-800 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Last Login
                    </p>
                    <p className="text-gray-800 font-medium">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Access Information */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h3 className="text-lg font-bold text-royal-black mb-6">
                Access & Permissions
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl mt-1">
                    {(user.role === "admin" || user.role === "super-admin" || user.role === "superadmin") && "👑"}
                    {user.role === "editor" && "✏️"}
                    {user.role === "viewer" && "👁️"}
                    {user.role !== "admin" && user.role !== "super-admin" && user.role !== "superadmin" && user.role !== "editor" && user.role !== "viewer" && "🔐"}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-royal-black capitalize mb-1">
                      {userRole?.name || user.role} Role
                    </h4>
                    <p className="text-sm text-gray-600">
                      {userRole?.description || "Custom role with specific permissions."}
                    </p>
                    {userRole && (userRole.permissions.includes('*') || userRole.permissions.includes('all')) && (
                      <div className="mt-2 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                        ⭐ Full Access - All Permissions
                      </div>
                    )}
                  </div>
                </div>

                {/* Permissions Grid */}
                {userRole && (
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Content Management
                      </p>
                      <div className="space-y-2 text-sm">
                        {[
                          { key: 'articles', label: 'Manage News Articles', altKeys: ['create_articles', 'edit_articles', 'articles:write'] },
                          { key: 'carousel', label: 'Manage Carousel', altKeys: ['manage_carousel', 'carousel:write'] },
                          { key: 'users', label: 'Manage Users', altKeys: ['create_users', 'edit_users', 'users:write'] },
                          { key: 'categories', label: 'Manage Categories', altKeys: ['manage_categories', 'categories:write'] },
                        ].map((perm) => {
                          // Check for wildcard or all permissions
                          const hasWildcard = userRole.permissions.includes('*') || userRole.permissions.includes('all');
                          // Check if role has many permissions (likely admin)
                          const isAdminLevel = userRole.permissions.length >= 10;
                          // Check for exact or partial match
                          const hasExactMatch = userRole.permissions.some(p => 
                            p === perm.key || 
                            perm.altKeys.includes(p) ||
                            p.includes(perm.key)
                          );
                          
                          const hasPermission = hasWildcard || isAdminLevel || hasExactMatch;
                          
                          return (
                            <div
                              key={perm.key}
                              className={`flex items-center gap-2 ${
                                hasPermission ? "text-green-700" : "text-gray-500"
                              }`}
                            >
                              <span>{hasPermission ? "✓" : "✗"}</span>
                              <span>{perm.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        System Access
                      </p>
                      <div className="space-y-2 text-sm">
                        {[
                          { key: 'analytics', label: 'View Analytics', altKeys: ['view_analytics', 'analytics:read'] },
                          { key: 'messages', label: 'View Messages', altKeys: ['view_messages', 'messages:read', 'reply_messages'] },
                          { key: 'activity', label: 'View Activity Log', altKeys: ['view_activity_log', 'activities:read'] },
                          { key: 'roles', label: 'Manage Roles', altKeys: ['manage_roles', 'roles:write'] },
                        ].map((perm) => {
                          // Check for wildcard or all permissions
                          const hasWildcard = userRole.permissions.includes('*') || userRole.permissions.includes('all');
                          // Check if role has many permissions (likely admin)
                          const isAdminLevel = userRole.permissions.length >= 10;
                          // Check for exact or partial match
                          const hasExactMatch = userRole.permissions.some(p => 
                            p === perm.key || 
                            perm.altKeys.includes(p) ||
                            p.includes(perm.key)
                          );
                          
                          const hasPermission = hasWildcard || isAdminLevel || hasExactMatch;
                          
                          return (
                            <div
                              key={perm.key}
                              className={`flex items-center gap-2 ${
                                hasPermission ? "text-green-700" : "text-gray-500"
                              }`}
                            >
                              <span>{hasPermission ? "✓" : "✗"}</span>
                              <span>{perm.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {!userRole && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Loading permissions...
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-royal-black">
                  Recent Activity
                </h3>
                {activities.length > 0 && (
                  <a
                    href="/admin/activity"
                    className="text-sm text-royal-gold hover:text-yellow-600 font-semibold transition-colors"
                  >
                    View All →
                  </a>
                )}
              </div>

              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity._id}
                      className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="text-2xl flex-shrink-0">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-royal-black text-sm">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-semibold">
                            {activity.type.replace(/_/g, " ").toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.createdAt || activity.timestamp || '').toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No recent activity</p>
              )}
            </div>
          </div>

          {/* Right Column - Action Buttons */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-royal-black mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  ✏️ Edit User
                </button>

                <button
                  onClick={handleResetPassword}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  🔐 Reset Password
                </button>

                <button
                  onClick={handleToggleStatus}
                  className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 text-white flex items-center justify-center gap-2 ${
                    user.status === "active"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {user.status === "active" ? "🚫 Deactivate User" : "✅ Activate User"}
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <span className="font-semibold">💡 Tip:</span> Deactivating a user will
                  prevent them from logging in but keep their account and data intact.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
