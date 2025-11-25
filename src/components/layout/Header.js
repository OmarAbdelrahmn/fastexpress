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
    <header 
      className="text-white px-6 py-4 shadow-lg sticky top-0 z-50"
      style={{ background: '#090979',
background: 'linear-gradient(196deg,rgba(2, 0, 36, 1) 0%, rgba(9, 9, 121, 1) 35%, rgba(0, 212, 255, 1) 100%'
  }}
    >
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
                <span 
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: '#ebb62b', color: '#1b428e' }}
                >
                  {user.role}
                </span>
              )}
            </div>
          )}

          {/* Session Timer */}
          <div 
            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded"
            style={{ backgroundColor: '#f53232ff' }}
          >
            <Clock size={16} />
            <span>باقي: {remainingTime}</span>
          </div>

          {/* Logout Button */}
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: '#e08911' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ebb62b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e08911'}
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </header>
  );
}