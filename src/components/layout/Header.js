'use client';

import { useEffect, useState } from 'react';
import { LogOut, Clock, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/authContext';
import { TokenManager } from '@/lib/auth/tokenManager';
import LanguageSwitcher from '@/components/Ui/LanguageSwitcher';

export default function Header() {
  const { logout } = useAuth();
  const [remainingTime, setRemainingTime] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = TokenManager.getUserFromToken();
    setUser(userData);

    const updateTimer = () => {
      const remaining = TokenManager.getRemainingTime();
      if (remaining <= 0) {
        logout();
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [logout]);

  return (
    <header 
      className = "text-white px-6 py-4 shadow-lg sticky top-0 z-50 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          شركة الخدمة السريعة للخدمات اللوجستية
        </h1>
        
        <div className="flex items-center gap-6">
          {/* <LanguageSwitcher /> */}
          
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <User size={18} />
              <span>{user.username || user.name}</span>
              {user.role && (
                <span 
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: '#463aeeff', color: '#1b428e' }}
                >
                  {user.role}
                </span>
              )}
            </div>
          )}
          {/* Logout Button */}
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: '#180e0eff' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f53232ff'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#17006bff'}
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </header>
  );
}