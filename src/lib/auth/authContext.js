// File: src/lib/auth/authContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { TokenManager } from './tokenManager';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
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
      if (window.location.pathname !== '/login') {
        // router.push('/login');
      }
    }
  };

  const login = (token) => {
    TokenManager.setToken(token);
    setIsAuthenticated(true);
    // router.push('/dashboard');
  };

  const logout = () => {
    TokenManager.clearToken();
    setIsAuthenticated(false);
    // router.push('/login');
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