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
    <aside className="w-64 bg-gray-50 border-l-4 border-orange-500 p-5 overflow-y-auto h-[calc(100vh-64px)]">
      <nav>
        <ul className="space-y-2">
          {/* Dashboard Home */}
          <li>
            <Link
              href="/dashboard"
              className={`block w-full text-right px-4 py-2 rounded-lg transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-orange-500 text-white' 
                  : 'hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{navigationConfig.dashboard.icon}</span>
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
                  className="w-full flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span>{section.icon}</span>
                    <span>{section.title}</span>
                  </span>
                  {openSections[key] ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronLeft size={18} />
                  )}
                </button>
                
                {openSections[key] && section.routes && (
                  <ul className="mr-6 mt-2 space-y-1 border-r-2 border-orange-300 pr-3">
                    {section.routes.map((route) => (
                      <li key={route.path}>
                        <Link
                          href={route.path}
                          className={`block w-full text-right px-3 py-1.5 rounded text-sm transition-colors ${
                            isActive(route.path)
                              ? 'bg-orange-100 text-orange-600 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
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