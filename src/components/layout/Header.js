// File: src/components/layout/Header.js
'use client';

import { useEffect, useState } from 'react';
import { LogOut, Clock, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/authContext';
import { TokenManager } from '@/lib/auth/tokenManager';

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
    <header className="bg-orange-500 text-white px-6 py-4 shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          شركة الخدمة السريعة للخدمات اللوجستية
        </h1>
        
        <div className="flex items-center gap-6">
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <User size={18} />
              <span>{user.username || user.name}</span>
              {user.role && (
                <span className="bg-orange-600 px-2 py-0.5 rounded text-xs">
                  {user.role}
                </span>
              )}
            </div>
          )}

          {/* Session Timer */}
          <div className="flex items-center gap-2 text-sm bg-orange-600 px-3 py-1.5 rounded">
            <Clock size={16} />
            <span>باقي: {remainingTime}</span>
          </div>

          {/* Logout Button */}
          <button 
            onClick={logout}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </header>
  );
}