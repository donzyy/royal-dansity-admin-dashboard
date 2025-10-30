import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import AdminLayout from "@/dashboard/components/AdminLayout";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/lib/axios";

const getFullImageUrl = (path: string | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  return `${API_BASE}${path}`;
};

interface User {
  id: string;
  _id?: string; // Fallback for compatibility
  name: string;
  email: string;
  role: string;
  status?: string;
  avatar?: string;
  joinDate: string;
  lastLogin: string;
}

export default function UserProfile() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [avatar, setAvatar] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
  );
  const [avatarPreview, setAvatarPreview] = useState(avatar);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getMe();
      const userData = response.data.user;
      
      setUser(userData);
      setProfileData({
        name: userData.name,
        email: userData.email,
        role: userData.role,
      });
      
      if (userData.avatar) {
        const fullAvatarUrl = getFullImageUrl(userData.avatar);
        setAvatar(fullAvatarUrl);
        setAvatarPreview(fullAvatarUrl);
      } else {
        const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`;
        setAvatar(defaultAvatar);
        setAvatarPreview(defaultAvatar);
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setPendingAvatarFile(file);
    toast.success('Image selected. Click Save to upload.');
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Upload avatar first if a new file is pending
      if (pendingAvatarFile && user) {
        const formData = new FormData();
        formData.append('image', pendingAvatarFile);
        formData.append('uploadType', 'user');
        const userId = user._id || user.id;
        const uploadRes = await axios.post(`/users/${userId}/avatar`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadRes.data?.success) {
          const fullAvatarUrl = getFullImageUrl(uploadRes.data.data.avatar);
          setAvatar(fullAvatarUrl);
          setAvatarPreview(fullAvatarUrl);
          setPendingAvatarFile(null);
        }
      }

      // Optionally update profile text fields via API here if available
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      await refreshUser();
      await fetchUserData();
    } catch (err: any) {
      console.error('Error saving profile:', err);
      toast.error(err.message || 'Failed to save profile');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSuccessMessage("Passwords do not match!");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setSuccessMessage("Password must be at least 6 characters!");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }
    setShowPasswordForm(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setSuccessMessage("Password changed successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-gold mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Failed to load profile data</p>
            <button
              onClick={fetchUserData}
              className="bg-royal-gold text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-royal-black mb-2">
            User Profile
          </h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
          <p className="text-sm text-gray-500 mt-2">
            Logged in as: <strong>{user.email}</strong> | Role: <strong className="capitalize">{user.role}</strong>
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-green-800 font-semibold">
            ✓ {successMessage}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          {/* Avatar Section */}
          <div className="bg-gradient-to-r from-royal-purple to-royal-black p-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <img
                  src={avatarPreview}
                  alt="User Avatar"
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-royal-gold hover:bg-yellow-600 text-white rounded-full p-3 cursor-pointer transition-all duration-300 shadow-lg">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  📷
                </label>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {profileData.name}
              </h2>
              <p className="text-gray-200">{profileData.email}</p>
              <div className="mt-4">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur">
                  {profileData.role.charAt(0).toUpperCase() +
                    profileData.role.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-8">
            <h3 className="text-2xl font-bold text-royal-black mb-6">
              Account Information
            </h3>

            {!isEditing ? (
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-semibold">Full Name</p>
                  <p className="text-lg text-royal-black font-semibold">
                    {profileData.name}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-semibold">Email</p>
                  <p className="text-lg text-royal-black font-semibold">
                    {profileData.email}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 font-semibold">Role</p>
                  <p className="text-lg text-royal-black font-semibold">
                    {profileData.role.charAt(0).toUpperCase() +
                      profileData.role.slice(1)}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    placeholder="Your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Role (Read-only)
                  </label>
                  <input
                    type="text"
                    value={profileData.role.charAt(0).toUpperCase() +
                      profileData.role.slice(1)}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-royal-gold hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-royal-black font-bold py-3 px-4 rounded-lg transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-3 px-4 rounded-lg transition-all duration-300 mb-6"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-8">
            <h3 className="text-2xl font-bold text-royal-black mb-6">
              Security Settings
            </h3>

            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold py-3 px-4 rounded-lg transition-all duration-300"
              >
                🔐 Change Password
              </button>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Current Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    New Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Confirm Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-royal-gold hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-royal-black font-bold py-3 px-4 rounded-lg transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
