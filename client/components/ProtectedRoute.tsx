import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-royal-gold"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  // For now, we allow all authenticated users
  // The backend will handle permission checks via the API
  // If you need frontend role checking, implement permission-based logic here
  if (requiredRole && user) {
    // Define admin-level roles that have full access
    const adminRoles = ['admin', 'super-admin', 'superadmin', 'administrator'];
    
    // If user has an admin-level role, grant access
    if (adminRoles.includes(user.role.toLowerCase())) {
      return <>{children}</>;
    }
    
    // Otherwise, check if user's role matches the required role
    if (user.role.toLowerCase() !== requiredRole.toLowerCase()) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <div className="text-6xl mb-4">⛔</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
              <br />
              <span className="text-sm text-gray-500 mt-2 block">
                Required role: {requiredRole}
              </span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-royal-gold hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

