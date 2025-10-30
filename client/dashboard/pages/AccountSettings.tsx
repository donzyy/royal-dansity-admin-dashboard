import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import AdminLayout from "@/dashboard/components/AdminLayout";
import PasswordStrengthIndicator from "@/shared/components/PasswordStrengthIndicator";
import { authAPI, usersAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import axios from "@/lib/axios";
import {
  validatePassword,
  passwordsMatch,
  type PasswordValidation,
} from "@/lib/passwordUtils";

type SettingsTab =
  | "profile"
  | "personal"
  | "work"
  | "email"
  | "notifications"
  | "security";

interface UserSettings {
  profile: {
    fullName: string;
    displayName: string;
    role: string;
    bio: string;
  };
  personal: {
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    timezone: string;
  };
  work: {
    organization: string;
    department: string;
    jobTitle: string;
    yearsOfExperience: string;
    education: string;
  };
  email: {
    defaultFromEmail: string;
    emailSignature: string;
  };
  notifications: {
    newMessages: boolean;
    visitorActivity: boolean;
    contactFormSubmissions: boolean;
    carouselUpdates: boolean;
    adminAnnouncements: boolean;
  };
}

export default function AccountSettings() {
  const { user: authUser, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    const saved = localStorage.getItem("accountSettingsTab");
    return (saved as SettingsTab) || "profile";
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation | null>(null);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem("userSettings");
    return saved
      ? JSON.parse(saved)
      : {
          profile: {
            fullName: "Admin User",
            displayName: "Admin",
            role: "Admin",
            bio: "Welcome to Royal Dansity",
          },
          personal: {
            email: "admin@royaldansity.com",
            phone: "+1 (555) 123-4567",
            address: "123 Business Street",
            city: "Accra",
            country: "Ghana",
            timezone: "GMT+0",
          },
          work: {
            organization: "Royal Dansity Investments",
            department: "Administration",
            jobTitle: "System Administrator",
            yearsOfExperience: "5+",
            education: "Bachelor of Business Administration",
          },
          email: {
            defaultFromEmail: "admin@royaldansity.com",
            emailSignature: "Best regards,\nRoyal Dansity Team",
          },
          notifications: {
            newMessages: true,
            visitorActivity: true,
            contactFormSubmissions: true,
            carouselUpdates: true,
            adminAnnouncements: true,
          },
        };
  });

  // Fetch current user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getCurrentUser();
      const userData = response.data.user;
      setCurrentUser(userData);
      
      // Update profile settings with real data
      setSettings(prev => ({
        ...prev,
        profile: {
          fullName: userData.name || "",
          displayName: userData.name?.split(' ')[0] || "",
          role: userData.role || "viewer",
          bio: userData.bio || "",
        },
        personal: {
          email: userData.email || "",
          phone: prev.personal.phone,
          address: prev.personal.address,
          city: prev.personal.city,
          country: prev.personal.country,
          timezone: prev.personal.timezone,
        },
      }));

      // Set profile picture preview if exists
      if (userData.avatar) {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const avatarUrl = userData.avatar.startsWith('http') 
          ? userData.avatar 
          : `${API_BASE}${userData.avatar}`;
        setProfilePicturePreview(avatarUrl);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("accountSettingsTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (newPassword) {
      const validation = validatePassword(newPassword);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  }, [newPassword]);

  useEffect(() => {
    if (confirmNewPassword) {
      setPasswordMismatch(!passwordsMatch(newPassword, confirmNewPassword));
    } else {
      setPasswordMismatch(false);
    }
  }, [newPassword, confirmNewPassword]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // For Profile Information tab - save to API
      if (activeTab === "profile") {
        const updateData: any = {
          name: settings.profile.fullName,
        };

        // Upload avatar if a new file was selected
        if (profilePictureFile) {
          const formData = new FormData();
          formData.append('avatar', profilePictureFile);
          formData.append('uploadType', 'user');
          
          try {
            const uploadResponse = await axios.post('/users/me/avatar', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });

            if (uploadResponse.data.success) {
              updateData.avatar = uploadResponse.data.data.user.avatar;
            }
          } catch (error) {
            console.error('Error uploading avatar:', error);
          }
        }

        // Update user profile
        await authAPI.updateProfile(updateData);
        
        // Refresh user data in AuthContext and localStorage
        await refreshUser();
        
        // Fetch fresh user data for the form
        await fetchUserData();
        
        toast.success("Profile updated successfully!");
      } else {
        // For other tabs - save to localStorage (demo purposes)
        localStorage.setItem("userSettings", JSON.stringify(settings));
        toast.success("Settings saved locally!");
      }
      
      setSaveMessage("✓ Settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };


  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValidation?.isValid) {
      toast.error("Password does not meet the requirements");
      return;
    }

    if (!passwordsMatch(newPassword, confirmNewPassword)) {
      toast.error("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      await authAPI.updatePassword(currentPassword, newPassword);
      toast.success("Password changed successfully!");
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordValidation(null);
    } catch (error: any) {
      console.error("Error changing password:", error);
      const message = error.message || "Failed to change password. Please check your current password.";
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: "profile", label: "Profile Information", icon: "👤" },
    { id: "personal", label: "Personal Info", icon: "🏠" },
    { id: "work", label: "Work & Education", icon: "💼" },
    { id: "email", label: "Email Settings", icon: "✉️" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "security", label: "Security", icon: "🔒" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-royal-black mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600">
            Manage your profile, preferences, and system settings
          </p>
        </div>

        {/* Success Message */}
        {saveMessage && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-green-800 font-semibold">
            {saveMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-4 text-center font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-royal-gold text-white border-b-4 border-royal-gold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Profile Information Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-royal-gold border-t-transparent rounded-full"></div>
                    <span className="ml-3 text-gray-600">Loading profile...</span>
                  </div>
                ) : (
                  <>
                <h2 className="text-2xl font-bold text-royal-black">
                  Profile Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-royal-black mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={settings.profile.fullName}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          profile: {
                            ...prev.profile,
                            fullName: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-royal-black mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={settings.profile.displayName}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          profile: {
                            ...prev.profile,
                            displayName: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-royal-black mb-2">
                      Role (Read-only)
                    </label>
                    <input
                      type="text"
                      value={settings.profile.role}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-royal-black mb-2">
                      Profile Picture
                    </label>
                    
                    {/* Dashed Upload Area with Preview */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-royal-gold transition-colors duration-300">
                      {profilePicturePreview ? (
                        <div className="space-y-4">
                          {/* Preview */}
                          <div className="flex justify-center">
                            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-royal-gold shadow-lg">
                              <img
                                src={profilePicturePreview}
                                alt="Profile Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-3 justify-center">
                            <label className="cursor-pointer bg-royal-gold hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300">
                              Change Image
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setProfilePictureFile(file);
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setProfilePicturePreview(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setProfilePicturePreview(null);
                                setProfilePictureFile(null);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer block text-center">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setProfilePictureFile(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setProfilePicturePreview(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          
                          {/* Upload Icon */}
                          <div className="flex flex-col items-center space-y-3">
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                              <svg
                                className="w-10 h-10 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-royal-black">
                                Click to upload profile picture
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG, GIF up to 5MB
                              </p>
                            </div>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Short Bio
                  </label>
                  <textarea
                    value={settings.profile.bio}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, bio: e.target.value },
                      }))
                    }
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none resize-none"
                  />
                </div>
                  </>
                )}
              </div>
            )}

            {/* Personal Info Tab */}
            {activeTab === "personal" && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">⚠️ Note:</span> This tab currently uses local storage for demo purposes. Changes are saved locally only.
                  </p>
                </div>
                <h2 className="text-2xl font-bold text-royal-black">
                  Personal Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-royal-black mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.personal.email}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          personal: { ...prev.personal, email: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-royal-black mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.personal.phone}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          personal: { ...prev.personal, phone: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={settings.personal.address}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        personal: {
                          ...prev.personal,
                          address: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-royal-black mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={settings.personal.city}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          personal: { ...prev.personal, city: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-royal-black mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={settings.personal.country}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          personal: {
                            ...prev.personal,
                            country: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-royal-black mb-2">
                      Timezone
                    </label>
                    <input
                      type="text"
                      value={settings.personal.timezone}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          personal: {
                            ...prev.personal,
                            timezone: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Work & Education Tab */}
            {activeTab === "work" && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">⚠️ Note:</span> This tab currently uses local storage for demo purposes. Changes are saved locally only.
                  </p>
                </div>
                <h2 className="text-2xl font-bold text-royal-black">
                  Work & Education
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-royal-black mb-2">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={settings.work.organization}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          work: { ...prev.work, organization: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-royal-black mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={settings.work.department}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          work: { ...prev.work, department: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-royal-black mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={settings.work.jobTitle}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          work: { ...prev.work, jobTitle: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-royal-black mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      value={settings.work.yearsOfExperience}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          work: {
                            ...prev.work,
                            yearsOfExperience: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Education
                  </label>
                  <textarea
                    value={settings.work.education}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        work: { ...prev.work, education: e.target.value },
                      }))
                    }
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Email Settings Tab */}
            {activeTab === "email" && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">⚠️ Note:</span> This tab currently uses local storage for demo purposes. Changes are saved locally only.
                  </p>
                </div>
                <h2 className="text-2xl font-bold text-royal-black">
                  Email Settings
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Default From Email
                  </label>
                  <input
                    type="email"
                    value={settings.email.defaultFromEmail}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        email: {
                          ...prev.email,
                          defaultFromEmail: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Admin only: This is the default email used for replies
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-royal-black mb-2">
                    Email Signature
                  </label>
                  <textarea
                    value={settings.email.emailSignature}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        email: {
                          ...prev.email,
                          emailSignature: e.target.value,
                        },
                      }))
                    }
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none resize-none"
                    placeholder="Your email signature here..."
                  />
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">⚠️ Note:</span> This tab currently uses local storage for demo purposes. Changes are saved locally only.
                  </p>
                </div>
                <h2 className="text-2xl font-bold text-royal-black">
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      key: "newMessages" as const,
                      label: "New Messages",
                      description: "Get notified when you receive new messages",
                    },
                    {
                      key: "visitorActivity" as const,
                      label: "Visitor Activity",
                      description: "Get notified about visitor activity",
                    },
                    {
                      key: "contactFormSubmissions" as const,
                      label: "Contact Form Submissions",
                      description: "Get notified when contact forms are submitted",
                    },
                    {
                      key: "carouselUpdates" as const,
                      label: "Carousel Updates",
                      description: "Get notified about carousel changes",
                    },
                    {
                      key: "adminAnnouncements" as const,
                      label: "Admin Announcements",
                      description: "Receive important admin announcements",
                    },
                  ].map((notif) => (
                    <div
                      key={notif.key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div>
                        <p className="font-semibold text-royal-black">
                          {notif.label}
                        </p>
                        <p className="text-sm text-gray-600">
                          {notif.description}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications[notif.key]}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              notifications: {
                                ...prev.notifications,
                                [notif.key]: e.target.checked,
                              },
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-royal-gold rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-gold"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-royal-black mb-6">
                  Security Settings
                </h2>

                {/* Change Password Form */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-royal-black mb-4 flex items-center gap-2">
                    <span>🔑</span> Change Password
                  </h3>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-semibold text-royal-black mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none transition-colors"
                          required
                          disabled={isChangingPassword}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          title={showCurrentPassword ? "Hide password" : "Show password"}
                        >
                          {showCurrentPassword ? "👁️‍🗨️" : "👁️"}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-semibold text-royal-black mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter your new password"
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-royal-gold focus:outline-none transition-colors"
                          required
                          disabled={isChangingPassword}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          title={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? "👁️‍🗨️" : "👁️"}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-sm font-semibold text-royal-black mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Confirm your new password"
                          className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none transition-colors ${
                            passwordMismatch
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-200 focus:border-royal-gold"
                          }`}
                          required
                          disabled={isChangingPassword}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          title={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                        </button>
                      </div>
                      {passwordMismatch && (
                        <p className="text-xs text-red-600 mt-2">
                          Passwords do not match
                        </p>
                      )}
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <PasswordStrengthIndicator
                        validation={passwordValidation}
                        showErrors={true}
                      />
                    )}

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={
                          isChangingPassword ||
                          !currentPassword ||
                          !passwordValidation?.isValid ||
                          passwordMismatch ||
                          !confirmNewPassword
                        }
                        className="w-full bg-gradient-to-r from-royal-gold to-royal-copper text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isChangingPassword ? "Changing Password..." : "Change Password"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Security Tips */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <span>💡</span> Security Tips
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-900">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>Use a strong password with at least 8 characters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>Include uppercase, lowercase, and numbers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>Don't reuse passwords from other websites</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>Change your password regularly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>Never share your password with anyone</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-royal-gold hover:bg-yellow-600 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
          >
            {isSaving ? "Saving..." : "💾 Save Changes"}
          </button>
          <button
            onClick={() => window.location.href = "/admin"}
            className="bg-gray-300 hover:bg-gray-400 text-royal-black font-bold py-3 px-8 rounded-lg transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
