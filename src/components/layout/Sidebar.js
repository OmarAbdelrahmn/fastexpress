// File: src/components/layout/Sidebar.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronLeft, X, Menu } from 'lucide-react';
import { navigationConfig } from '@/lib/config/navigation';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [openSections, setOpenSections] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <nav>
      <ul className="space-y-3">
        {/* Dashboard Home */}
        <li>
          <Link
            href="/dashboard"
            onClick={closeMobileMenu}
            className={`block w-full text-right px-5 py-4 rounded-xl transition-all duration-200 text-lg font-medium ${isActive('/dashboard')
              ? 'bg-gradient-to-r from-[#ebb62b] to-[#e08911] text-white shadow-md transform scale-105'
              : 'hover:bg-white hover:shadow-md text-gray-700'
              }`}
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">{navigationConfig.dashboard.icon}</span>
              <span>{t(navigationConfig.dashboard.title)}</span>
            </span>
          </Link>
        </li>

        {/* Dynamic Sections */}
        {Object.entries(navigationConfig)
          .filter(([key]) => key !== 'dashboard')
          .map(([key, section]) => (
            <li key={key}>
              <button
                onClick={() => toggleSection(key)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200 text-lg font-bold ${openSections[key]
                  ? 'bg-white shadow-md text-[#ebb62b]'
                  : 'text-black-700 hover:bg-white hover:shadow-md'
                  }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <span>{t(section.title)}</span>
                </span>
                {openSections[key] ? (
                  <ChevronDown size={22} className="text-[#e08911]" />
                ) : (
                  <ChevronLeft size={22} />
                )}
              </button>

              {openSections[key] && section.routes && (
                <ul className="mr-8 mt-2 space-y-2 border-r-3 border-[#ebb62b] pr-4">
                  {section.routes.map((route) => (
                    <li key={route.path}>
                      <Link
                        href={route.path}
                        onClick={closeMobileMenu}
                        className={`block w-full text-right px-4 py-3 rounded-lg text-lg font-medium transition-all duration-200 ${isActive(route.path)
                          ? 'bg-gradient-to-r from-[#1b428e] to-[#2858b8] text-white font-medium shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#1b428e] hover:pr-5'
                          }`}
                      >
                        {t(route.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
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
        className="lg:hidden fixed top-20 right-4 z-50 bg-gradient-to-r from-[#ebb62b] to-[#e08911] text-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay with Blur */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 min-h-screen bg-gradient-to-b from-gray-50 to-white shadow-lg p-4 overflow-y-auto flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-gray-50 to-white shadow-2xl p-4 overflow-y-auto z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{t("navigation.menu")}</h2>
          <button
            onClick={closeMobileMenu}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}