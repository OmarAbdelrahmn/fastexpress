// File: src/components/layout/Header.js
'use client';

import { useEffect, useState } from 'react';
import { LogOut, Clock, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/authContext';
import { TokenManager } from '@/lib/auth/tokenManager';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function Header() {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const [remainingTime, setRemainingTime] = useState('');
  const [user, setUser] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        // Always show at top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`text-white px-6 py-4 shadow-lg sticky top-0 z-50 bg-gradient-to-r from-[#2563eb] via-[#2858b8] to-[#2563eb] transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">
          {t("auth.fullCompanyName")}
        </h1>

        <div className="flex items-center gap-4">

          {/* User Info */}
          {user && (
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-white text-[#2563eb] flex items-center justify-center font-bold text-sm">
                {user.unique_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-sm text-white">
                <div className="font-semibold">{user.unique_name.slice(0,6)}</div>
                {user.roles[0] && <div className="text-[8px] text-white/80 uppercase tracking-wider">{user.roles[0]}</div>}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 text-white hover:text-red-200 transition-colors rounded-lg hover:bg-white/10"
            title={t("auth.logout")}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}