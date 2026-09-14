import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { ApiClient } from '../services/api';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const res = await ApiClient.request('/api/v1/auth/me');
    if (res.success && res.data?.admin) {
      setUser(res.data.admin);
    } else {
      setUser(null);
      ApiClient.setAccessToken(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = ApiClient.getAccessToken();
      if (token) {
        await refreshUser();
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, passwordPlain: string) => {
    const res = await ApiClient.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordPlain })
    });

    if (res.success && res.data) {
      ApiClient.setAccessToken(res.data.accessToken);
      setUser(res.data.admin);
      return { success: true };
    }

    return {
      success: false,
      error: res.error?.message || 'Login failed'
    };
  };

  const logout = async () => {
    await ApiClient.request('/api/v1/auth/logout', { method: 'POST' });
    ApiClient.setAccessToken(null);
    setUser(null);
  };

  const hasPermission = (perm: string): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return user.permissions?.includes(perm) || false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
