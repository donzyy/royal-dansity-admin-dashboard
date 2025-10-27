import "./global.css";

import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Website Pages
import Index from "./website/pages/Index";
import About from "./website/pages/About";
import Services from "./website/pages/Services";
import News from "./website/pages/News";
import Contact from "./website/pages/Contact";
import ArticleDetail from "./website/pages/ArticleDetail";
import UserProfile from "./dashboard/pages/UserProfile";
import AccountSettings from "./dashboard/pages/AccountSettings";

// Dashboard Pages
import AdminLogin from "./dashboard/pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./dashboard/pages/AdminDashboard";
import AdminNews from "./dashboard/pages/AdminNews";
import AdminNewsDetail from "./dashboard/pages/AdminNewsDetail";
import AdminNewsEdit from "./dashboard/pages/AdminNewsEdit";
import AdminMessages from "./dashboard/pages/AdminMessages";
import AdminMessageDetail from "./dashboard/pages/AdminMessageDetail";
import AdminCarousel from "./dashboard/pages/AdminCarousel";
import AdminCarouselDetail from "./dashboard/pages/AdminCarouselDetail";
import AdminCarouselEdit from "./dashboard/pages/AdminCarouselEdit";
import AdminAnalytics from "./dashboard/pages/AdminAnalytics";
import AdminActivityLog from "./dashboard/pages/AdminActivityLog";
import AdminUsers from "./dashboard/pages/AdminUsers";
import AdminUserDetail from "./dashboard/pages/AdminUserDetail";
import AdminUserEdit from "./dashboard/pages/AdminUserEdit";
import AdminCategories from "./dashboard/pages/AdminCategories";
import AdminCategoryEdit from "./dashboard/pages/AdminCategoryEdit";
import AdminRoles from "./dashboard/pages/AdminRoles";
import AdminRoleEdit from "./dashboard/pages/AdminRoleEdit";

// Shared Components
import DesktopOnlyGuard from "./dashboard/components/DesktopOnlyGuard";
import NotFound from "./shared/components/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1c2434',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              iconTheme: {
                primary: '#B87333',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/news" element={<News />} />
          <Route path="/article/:slug" element={<ArticleDetail />} />
          <Route path="/newsdetails/:slug" element={<ArticleDetail />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<DesktopOnlyGuard><AdminLogin /></DesktopOnlyGuard>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route 
            path="/admin" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/news/create" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="editor">
                  <AdminNewsEdit />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/news" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute>
                  <AdminNews />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/news/:id" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute>
                  <AdminNewsDetail />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/news/edit/:id" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="editor">
                  <AdminNewsEdit />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/categories" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="admin">
                  <AdminCategories />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/categories/create" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="admin">
                  <AdminCategoryEdit />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/categories/edit/:id" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="admin">
                  <AdminCategoryEdit />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/roles" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="admin">
                  <AdminRoles />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/roles/create" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="admin">
                  <AdminRoleEdit />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/roles/edit/:id" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="admin">
                  <AdminRoleEdit />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/messages" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute>
                  <AdminMessages />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/messages/:id" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute>
                  <AdminMessageDetail />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/carousel" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="editor">
                  <AdminCarousel />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/carousel/create" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="editor">
                  <AdminCarouselEdit />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/carousel/edit/:id" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="editor">
                  <AdminCarouselEdit />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/carousel/:id" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="editor">
                  <AdminCarouselDetail />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute>
                  <AdminAnalytics />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/activity" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="admin">
                  <AdminActivityLog />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/users/create" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="admin">
                  <AdminUserEdit />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/users/edit/:id" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="admin">
                  <AdminUserEdit />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/users/:id" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute requiredRole="admin">
                  <AdminUserDetail />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/profile" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <DesktopOnlyGuard>
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              </DesktopOnlyGuard>
            } 
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
