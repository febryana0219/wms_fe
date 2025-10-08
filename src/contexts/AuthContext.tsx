import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthTokens } from '../types';
import { apiClient } from '../services/apiClient';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!tokens;

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiClient.post<{ success: boolean; data: { token: AuthTokens; user: User }; message: string }>('/auth/login', { email, password });

      if (response.success) {
        const { token, user } = response.data;
        setUser(user);
        setTokens(token);

        localStorage.setItem('access_token', token.access_token);
        localStorage.setItem('refresh_token', token.refresh_token);
        localStorage.setItem('user', JSON.stringify(user));

        toast.success(response.message);
        return true;
      } else {
        toast.error(response.message);
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (tokens) {
        await apiClient.logout();
      }
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setUser(null);
      setTokens(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      if (!refresh_token) return false;

      const response = await apiClient.post<{ success: boolean; data: { token: AuthTokens; user: User }; message: string }>('/auth/refresh_token', { refresh_token });
      if (response.success) {
        const { token, user } = response.data;
        setTokens(token);
        setUser(user);

        localStorage.setItem('access_token', token.access_token);
        localStorage.setItem('refresh_token', token.refresh_token);
        localStorage.setItem('user', JSON.stringify(user));

        return true;
      } else {
        await logout();
        return false;
      }
    } catch {
      await logout();
      return false;
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const access_token = localStorage.getItem('access_token');
        const refresh_token = localStorage.getItem('refresh_token');
        const savedUser = localStorage.getItem('user');

        if (access_token && refresh_token && savedUser) {
          try {
            const response = await apiClient.get<{ success: boolean; data: { user: User }; message: string }>('/auth/me');
            if (response.success) {
              setUser(response.data.user);
              setTokens({ access_token, refresh_token, expires_in: 86400, token_type: 'Bearer' });
            } else {
              await refreshToken();
            }
          } catch {
            await refreshToken();
          }
        }
      } catch (err) {
        console.error('Auth init error', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // Auto refresh token 5 minutes before expiry
  useEffect(() => {
    if (!tokens) return;
    const interval = setInterval(() => refreshToken(), (tokens.expires_in - 300) * 1000);
    return () => clearInterval(interval);
  }, [tokens]);

  return (
    <AuthContext.Provider value={{ user, tokens, isLoading, isAuthenticated, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};
