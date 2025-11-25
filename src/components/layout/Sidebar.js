// File: src/components/layout/Sidebar.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { navigationConfig } from '@/lib/config/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => pathname === path;

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-gray-50 to-white shadow-lg p-4 overflow-y-auto flex-shrink-0">
      <nav>
        <ul className="space-y-3">
          {/* Dashboard Home */}
          <li>
            <Link
              href="/dashboard"
              className={`block w-full text-right px-5 py-4 rounded-xl transition-all duration-200 text-lg font-medium ${
                isActive('/dashboard') 
                  ? 'bg-gradient-to-r from-[#ebb62b] to-[#e08911] text-white shadow-md transform scale-105' 
                  : 'hover:bg-white hover:shadow-md text-gray-700'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">{navigationConfig.dashboard.icon}</span>
                <span>{navigationConfig.dashboard.title}</span>
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
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200 text-lg font-bold ${
                    openSections[key]
                      ? 'bg-white shadow-md text-[#ebb62b]'
                      : 'text-black-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    <span>{section.title}</span>
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
                          className={`block w-full text-right px-4 py-3 rounded-lg text-lg font-medium transition-all duration-200 ${
                            isActive(route.path)
                              ? 'bg-gradient-to-r from-[#1b428e] to-[#2858b8] text-white font-medium shadow-sm'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-[#1b428e] hover:pr-5'
                          }`}
                        >
                          {route.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
        </ul>
      </nav>
    </aside>
  );
}