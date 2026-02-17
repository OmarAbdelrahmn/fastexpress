'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronLeft, X, Menu } from 'lucide-react';
import { adminNavigationConfig, userNavigationConfig } from '@/lib/config/navigation';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [openSections, setOpenSections] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isMemberPath = pathname.startsWith('/member');
  const currentConfig = isMemberPath ? userNavigationConfig : adminNavigationConfig;

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => pathname === path;

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <nav className="p-4">
      <div className="mb-8 px-4 flex items-center justify-center">
        <h2 className="text-2xl font-extrabold text-[#2563eb] tracking-tight">Express Service</h2>
      </div>
      <ul className="space-y-2">
        <li>
          <Link
            href={currentConfig.dashboard.path}
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${isActive(currentConfig.dashboard.path)
              ? 'bg-blue-50 text-[#2563eb] border-r-4 border-[#2563eb]'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <span className="text-xl">{currentConfig.dashboard.icon}</span>
            <span>{t(currentConfig.dashboard.title)}</span>
          </Link>
        </li>

        {Object.entries(currentConfig)
          .filter(([key]) => key !== 'dashboard')
          .map(([key, section]) => (
            <li key={key}>
              {section.routes ? (
                <>
                  <button
                    onClick={() => toggleSection(key)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 font-medium ${openSections[key]
                      ? 'bg-gray-50 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{section.icon}</span>
                      <span>{t(section.title)}</span>
                    </div>
                    {openSections[key] ? (
                      <ChevronDown size={18} className="text-gray-400" />
                    ) : (
                      <ChevronLeft size={18} className="text-gray-400" />
                    )}
                  </button>
                  {openSections[key] && section.routes && (
                    <ul className="mr-8 mt-1 space-y-1 border-r-2 border-gray-100 pr-3">
                      {section.routes.map((route) => (
                        <li key={route.path}>
                          <Link
                            href={route.path}
                            onClick={closeMobileMenu}
                            className={`block w-full text-right px-3 py-2 rounded-md text-sm transition-all duration-200 ${isActive(route.path)
                              ? 'text-[#2563eb] font-semibold bg-blue-50/50'
                              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                              }`}
                          >
                            {t(route.label)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={section.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${isActive(section.path)
                    ? 'bg-blue-50 text-[#2563eb] border-r-4 border-[#2563eb]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <span className="text-xl">{section.icon}</span>
                  <span>{t(section.title)}</span>
                </Link>
              )}
            </li>
          ))}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Mobile Burger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed bottom-19 right-4 z-50 bg-white text-gray-700 p-2 rounded-md shadow-md hover:bg-gray-50 border border-gray-200"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 min-h-screen bg-white border-l border-gray-100 shadow-sm flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <button
          onClick={closeMobileMenu}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        <SidebarContent />
      </aside>
    </>
  );
}