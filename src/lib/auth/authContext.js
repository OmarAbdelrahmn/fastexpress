// File: src/lib/auth/authContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { TokenManager } from './tokenManager';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children, loginPath = '/admin/login', dashboardPath = '/admin' }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();

    // Check token validity every minute
    const interval = setInterval(checkAuth, 60000);

    return () => clearInterval(interval);
  }, []);

  const checkAuth = () => {
    const isValid = TokenManager.isTokenValid();
    setIsAuthenticated(isValid);
    setLoading(false);

    if (!isValid && typeof window !== 'undefined') {
      TokenManager.clearToken();
      // Only redirect if not already on the login page
      if (window.location.pathname !== loginPath) {
        router.push(loginPath);
      }
    }
  };

  const login = (token) => {
    TokenManager.setToken(token);
    setIsAuthenticated(true);
    router.push(dashboardPath);
  };

  const logout = () => {
    TokenManager.clearToken();
    setIsAuthenticated(false);
    router.push(loginPath);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};