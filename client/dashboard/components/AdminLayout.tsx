import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "./NotificationBell";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_COLORS = [
  { name: "Royal Copper", value: "#B87333", key: "royal-copper" },
  { name: "Deep Navy", value: "#1E3A8A", key: "deep-navy" },
  { name: "Light Navy", value: "#3B82F6", key: "light-navy" },
  { name: "Graphite", value: "#2E2E2E", key: "graphite" },
  { name: "Slate Gray", value: "#64748B", key: "slate-gray" },
  { name: "Classic Gold", value: "#FBBF24", key: "classic-gold" },
  { name: "Emerald Green", value: "#10B981", key: "emerald-green" },
  { name: "Light Emerald", value: "#34D399", key: "light-emerald" },
  { name: "Purple Haze", value: "#8B5CF6", key: "purple-haze" },
  { name: "Light Purple", value: "#A78BFA", key: "light-purple" },
  { name: "Rose Pink", value: "#F43F5E", key: "rose-pink" },
  { name: "Soft Neutral", value: "#F5E6D3", key: "soft-neutral" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [sidebarColor, setSidebarColor] = useState(() => {
    return localStorage.getItem("sidebarColor") || "#2D2D2D";
  });
  const [companyLogo, setCompanyLogo] = useState(() => {
    return localStorage.getItem("companyLogo") || "https://cdn.builder.io/api/v1/image/assets%2Fc1a72e692ea5461694fcea1d0b1d2a6c%2Fb052e28f3f744d14a6203df3e30e5970";
  });
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    localStorage.setItem("sidebarColor", sidebarColor);
  }, [sidebarColor]);

  useEffect(() => {
    localStorage.setItem("companyLogo", companyLogo);
  }, [companyLogo]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const navItems = [
    { label: "Overview", href: "/admin", icon: "📊" },
    { label: "News Management", href: "/admin/news", icon: "📰" },
    { label: "Categories", href: "/admin/categories", icon: "🏷️" },
    { label: "Messages", href: "/admin/messages", icon: "💬" },
    { label: "Carousel", href: "/admin/carousel", icon: "🎠" },
    { label: "Analytics", href: "/admin/analytics", icon: "📈" },
    { label: "Users", href: "/admin/users", icon: "👥" },
    { label: "Roles", href: "/admin/roles", icon: "🔐" },
  ];

  const handleLogout = () => {
    logout();
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-72" : "w-20"
        } text-white transition-all duration-300 flex flex-col min-h-screen`}
        style={{ backgroundColor: sidebarColor }}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {sidebarOpen ? (
            <img
              src={companyLogo}
              alt="Company Logo"
              className="h-16 w-auto max-w-[200px] object-contain"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src={companyLogo}
                alt="Logo"
                className="h-10 w-10 object-contain"
              />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:text-royal-gold transition-colors"
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive(item.href)
                  ? "bg-royal-gold text-royal-black font-semibold"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Sidebar Settings & User Section */}
        <div className="p-4 border-t border-white/10 space-y-2">
          {/* Color Settings Button */}
          <div className="relative">
            <button
              onClick={() => setColorMenuOpen(!colorMenuOpen)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-all duration-300"
              title="Sidebar Color Settings"
            >
              <span className="text-lg">⚙️</span>
              {sidebarOpen && <span className="text-sm font-semibold">Theme</span>}
            </button>

            {colorMenuOpen && (
              <div 
                className={`absolute ${sidebarOpen ? 'bottom-full left-0 right-0' : 'bottom-0 left-full ml-2'} bg-gray-900 rounded-lg shadow-xl p-3 ${sidebarOpen ? 'mb-2' : ''} space-y-2 z-50 min-w-[200px]`}
              >
                <p className="text-xs font-semibold text-gray-300 px-2">
                  Choose Theme
                </p>
                {SIDEBAR_COLORS.map((color) => (
                  <button
                    key={color.key}
                    onClick={() => {
                      setSidebarColor(color.value);
                      setColorMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-sm text-gray-200"
                  >
                    <div
                      className="w-5 h-5 rounded border-2 border-white flex-shrink-0"
                      style={{ backgroundColor: color.value }}
                    />
                    {sidebarOpen && <span>{color.name}</span>}
                    {sidebarColor === color.value && (
                      <span className="ml-auto text-green-400">✓</span>
                    )}
                  </button>
                ))}
                
                {/* Logo Upload */}
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <label className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-sm text-gray-200 cursor-pointer">
                    <span>📷</span>
                    {sidebarOpen && <span>Upload Logo</span>}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-full flex items-center gap-3 hover:bg-white/10 p-2 rounded-lg transition-all duration-300"
              title={!sidebarOpen && user ? user.name : undefined}
            >
              {/* User Avatar or Initials */}
              <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border-2 border-royal-gold">
                {user?.avatar ? (
                  <img
                    src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${user.avatar}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials on error
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.nextElementSibling) {
                        (target.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div 
                  className="w-full h-full bg-yellow-400 flex items-center justify-center text-gray-900 font-bold"
                  style={{ display: user?.avatar ? 'none' : 'flex' }}
                >
                  {getUserInitials()}
                </div>
              </div>
              {sidebarOpen && user && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-gray-300 truncate">{user.email}</p>
                </div>
              )}
            </button>

            {profileMenuOpen && (
              <div 
                className={`absolute ${sidebarOpen ? 'bottom-full left-0 right-0 mb-2' : 'bottom-0 left-full ml-2'} bg-gray-900 rounded-lg shadow-xl p-2 space-y-1 z-50 min-w-[200px]`}
              >
                <Link
                  to="/admin/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-white/20 rounded-lg transition-all duration-300"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  👤 View Profile
                </Link>
                <Link
                  to="/admin/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-white/20 rounded-lg transition-all duration-300"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  ⚙️ Account Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-red-500/30 rounded-lg transition-all duration-300 text-left"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm hover:opacity-80"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            title="Logout"
          >
            {sidebarOpen ? "Logout" : "🚪"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-royal-black">
            Royal Dansity Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <a
              href="/"
              className="text-sm text-royal-gold hover:text-yellow-600 font-semibold transition-colors"
            >
              ← View Site
            </a>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">{children}</div>
      </div>
    </div>
  );
}
