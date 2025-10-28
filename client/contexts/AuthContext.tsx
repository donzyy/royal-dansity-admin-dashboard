import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI, setTokens as setApiTokens, clearTokens as clearApiTokens } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  joinDate: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setAccessToken(token);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });

      if (response.success) {
        const { user: userData, accessToken: token, refreshToken } = response.data;

        // Store in state
        setUser(userData);
        setAccessToken(token);

        // Store in localStorage and API client
        localStorage.setItem('user', JSON.stringify(userData));
        setApiTokens(token, refreshToken);

        // Show success toast
        toast.success(`Welcome back, ${userData.name}!`, {
          duration: 5000, // Extended to 5 seconds
          icon: '👋',
        });

        // Add 5-second delay before navigation (matches toast duration)
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Navigate to dashboard
        navigate('/admin');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle different error scenarios
      if (error.response?.status === 429) {
        toast.error('Too many login attempts. Please try again later.', {
          duration: 5000,
          icon: '⏱️',
        });
      } else if (error.response?.status === 401) {
        toast.error('Invalid email or password', {
          duration: 4000,
          icon: '🔒',
        });
      } else if (error.response?.status === 403) {
        toast.error(error.response.data.message || 'Account is inactive', {
          duration: 4000,
          icon: '⛔',
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message, {
          duration: 4000,
          icon: '❌',
        });
      } else {
        toast.error('Login failed. Please try again.', {
          duration: 4000,
          icon: '❌',
        });
      }

      throw error;
    }
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setAccessToken(null);

    // Clear ALL localStorage items to prevent data leakage
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Also remove 'token' if it exists
    localStorage.removeItem('userSettings'); // Clear account settings
    localStorage.removeItem('accountSettingsTab'); // Clear tab preference
    clearApiTokens();

    // Show toast
    toast.success('Logged out successfully', {
      duration: 2000,
      icon: '👋',
    });

    // Navigate to login
    navigate('/admin/login');
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success) {
        const userData = response.data!.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    accessToken,
    loading,
    login,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!user && !!accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

