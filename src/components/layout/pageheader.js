'use client';
import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Ui/Breadcrumbs';

export default function PageHeader({
  title,
  subtitle,
  actions,
  icon: Icon,
  stats
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className={`text-white px-6 py-4 shadow-lg sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>

      <div className="flex justify-end">
        <Breadcrumb />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="bg-white/20 p-3 rounded-lg">
              <Icon size={32} />
            </div>
          )}
          <div>
            <h1 className="text-lg md:text-3xl font-bold mb-1">{title}</h1>
            {subtitle && (
              <p className="text-orange-100 text-sm">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex gap-3">
            {actions}
          </div>
        )}
      </div>

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-orange-400/30">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-orange-100 text-lg md:text-xl font-bold mb-1">{stat.label}</p>
              <p className="text-3xl md:text-4xl font-extrabold">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}