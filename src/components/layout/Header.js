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
      className={`relative text-white px-6 py-4 shadow-lg sticky top-0 z-50 bg-gradient-to-r
from-[#2563EB] 
via-[#1D4ED8] 
to-[#1E3A8A] transition-transform duration-300 rounded-b-[60px] ${isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
    >
      {/* Animated Flowing Waves - Hidden on mobile/tablet - Behind all content */}
      <div className="hidden xl:flex absolute inset-0 overflow-hidden opacity-25 pointer-events-none z-0">
        <svg className="w-full h-full" viewBox="0 0 1200 80" preserveAspectRatio="none">
          {/* Bottom Wave Layer */}
          <path
            d="M-100,50 Q50,35 200,50 T500,50 T800,50 T1100,50 T1300,50"
            stroke="white"
            strokeWidth="3"
            fill="none"
            className="wave-layer-1"
            opacity="0.9"
          />

          {/* Middle Wave Layer */}
          <path
            d="M-100,40 Q80,28 260,40 T620,40 T980,40 T1300,40"
            stroke="white"
            strokeWidth="2.5"
            fill="none"
            className="wave-layer-2"
            opacity="0.7"
          />

          {/* Top Wave Layer */}
          <path
            d="M-100,30 Q120,20 340,30 T700,30 T1060,30 T1300,30"
            stroke="white"
            strokeWidth="2"
            fill="none"
            className="wave-layer-3"
            opacity="0.5"
          />

          {/* Accent Wave 1 */}
          <path
            d="M-100,45 Q90,32 280,45 T560,45 T840,45 T1120,45 T1300,45"
            stroke="white"
            strokeWidth="1.8"
            fill="none"
            className="wave-layer-4"
            opacity="0.4"
          />

          {/* Accent Wave 2 */}
          <path
            d="M-100,35 Q150,25 400,35 T650,35 T900,35 T1150,35 T1300,35"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            className="wave-layer-5"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Animated Motorcycle - Riding along the border */}
      {/* 
      <div className="motorcycle-rider">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
          <circle cx="6" cy="18" r="2" fill="white" />
          <circle cx="18" cy="18" r="2" fill="white" />
          <path d="M12 6L14 12L18 11L16 16H14L12 13L10 16H8L6 11L10 12L12 6Z" fill="white" stroke="white" strokeWidth="0.5" />
          <line x1="6" y1="18" x2="18" y2="18" stroke="white" strokeWidth="1.5" />
        </svg>
      </div> 
      */}

      <style jsx>{`
        @keyframes wave-flow-ltr {
          0% {
            transform: translateX(0);
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100px);
            opacity: 0.3;
          }
        }
        
        .wave-layer-1 {
          animation: wave-flow-ltr 6s ease-in-out infinite;
        }
        
        .wave-layer-2 {
          animation: wave-flow-ltr 7s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        
        .wave-layer-3 {
          animation: wave-flow-ltr 8s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .wave-layer-4 {
          animation: wave-flow-ltr 6.5s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        
        .wave-layer-5 {
          animation: wave-flow-ltr 7.5s ease-in-out infinite;
          animation-delay: 2s;
        }

        @keyframes ride-inside-border {
          /* Start at top-left, move right along top */
          0% {
            top: 8px;
            left: 20px;
          }
          /* Top-right corner */
          25% {
            top: 8px;
            left: calc(100% - 50px);
          }
          /* Bottom-right corner */
          50% {
            top: calc(100% - 40px);
            left: calc(100% - 50px);
          }
          /* Bottom-left corner */
          75% {
            top: calc(100% - 40px);
            left: 20px;
          }
          /* Back to top-left */
          100% {
            top: 8px;
            left: 20px;
          }
        }

        .motorcycle-rider {
          position: absolute;
          animation: ride-inside-border 15s linear infinite;
          z-index: 100;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          pointer-events: none;
        }
      `}</style>
      <div className="relative flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 bg-white/100 rounded-full flex items-center justify-center p-1 backdrop-blur-sm shadow-inner">
            <img src="/5.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-sm md:text-lg font-bold text-white tracking-wide drop-shadow-sm">
            {t("auth.fullCompanyName")}
          </h1>
        </div>
        <div className="flex items-center gap-4">

          {/* User Info */}
          {user && (
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-white text-[#2563eb] flex items-center justify-center font-bold text-sm">
                {user.unique_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-sm text-white">
                <div className="font-semibold">{user.unique_name.slice(0, 7)}</div>
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