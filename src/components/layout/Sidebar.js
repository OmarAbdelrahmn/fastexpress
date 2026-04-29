'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronLeft,
  X,
  Menu,
  LayoutDashboard,
  BarChart3,
  Car,
  Users,
  Home,
  Calendar,
  RefreshCw,
  Building2,
  Wrench,
  Fuel,
  ShieldCheck,
  UserCircle,
  Settings,
  Bike,
  AlertTriangle,
  Zap,
  BookOpen,
} from 'lucide-react';
import { adminNavigationConfig, userNavigationConfig } from '@/lib/config/navigation';
import { useLanguage } from '@/lib/context/LanguageContext';

// Map navigation keys to Lucide icons
const ICON_MAP = {
  // Admin
  dashboard: LayoutDashboard,
  reports: BarChart3,
  vehicles: Car,
  riders: Users,
  housing: Home,
  shifts: Calendar,
  substitution: RefreshCw,
  company: Building2,
  maintenance: Wrench,
  petrol: Fuel,
  admin: ShieldCheck,
  account: UserCircle,
  sittings: Settings,
  // Member
  actions: Zap,
  disabilities: AlertTriangle,
  requests: BookOpen,
};

function NavIcon({ sectionKey, size = 18 }) {
  const Icon = ICON_MAP[sectionKey] || LayoutDashboard;
  return <Icon size={size} strokeWidth={1.8} />;
}

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
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-slate-100" dir="ltr">
        <div className="flex items-center gap-3">
          {/* <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-200">
            <Bike size={18} color="white" strokeWidth={2} />
          </div> */}
          <div className="text-center">
            <p className="text-[19px] font-bold text-slate-800 leading-none tracking-tight">
              Express Service
            </p>
            <p className="text-[13px] text-slate-400 mt-0.5 tracking-widest uppercase">
              Management
            </p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-thin">
        {/* Dashboard */}
        <Link
          href={currentConfig.dashboard.path}
          onClick={closeMobileMenu}
          className={`group flex items-center gap-3 px-3 py-[11px] rounded-xl transition-all duration-200 ${
            isActive(currentConfig.dashboard.path)
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <span className={`flex-shrink-0 ${isActive(currentConfig.dashboard.path) ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`}>
            <NavIcon sectionKey="dashboard" />
          </span>
          <span className="text-sm font-medium tracking-tight">{t(currentConfig.dashboard.title)}</span>
          {isActive(currentConfig.dashboard.path) && (
            <span className="mr-auto w-1.5 h-1.5 rounded-full bg-white/70" />
          )}
        </Link>

        {/* Divider */}
        <div className="pt-3 pb-1 px-3">
          <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">القائمة</p>
        </div>

        {/* Sections */}
        {Object.entries(currentConfig)
          .filter(([key]) => key !== 'dashboard')
          .map(([key, section]) => {
            const anyChildActive = section.routes?.some(r => isActive(r.path));
            const isOpen = openSections[key];
            const isSectionActive = section.path ? isActive(section.path) : anyChildActive;

            return (
              <div key={key}>
                {section.routes ? (
                  <>
                    <button
                      onClick={() => toggleSection(key)}
                      className={`group w-full flex items-center gap-3 px-3 py-[11px] rounded-xl transition-all duration-200 ${
                        isSectionActive
                          ? 'bg-blue-50 text-blue-700'
                          : isOpen
                          ? 'bg-slate-50 text-slate-700'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }`}
                    >
                      <span className={`flex-shrink-0 transition-colors ${
                        isSectionActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-400'
                      }`}>
                        <NavIcon sectionKey={key} />
                      </span>
                      <span className="text-sm font-medium tracking-tight flex-1 text-right">
                        {t(section.title)}
                      </span>
                      <span className={`flex-shrink-0 transition-transform duration-200 text-slate-400 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown size={14} />
                      </span>
                    </button>

                    {/* Sub-routes */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="mr-4 mt-1 mb-1 border-r-2 border-slate-100 pr-3 space-y-0.5">
                        {section.routes.map((route) => (
                          <Link
                            key={route.path}
                            href={route.path}
                            onClick={closeMobileMenu}
                            className={`block w-full text-right px-3 py-[9px] rounded-lg text-[13px] transition-all duration-150 ${
                              isActive(route.path)
                                ? 'text-blue-600 font-semibold bg-blue-50'
                                : 'text-slate-500 hover:text-slate-500 hover:bg-slate-50 hover:translate-x-1'
                            }`}
                          >
                            {isActive(route.path) && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 ml-2 mb-0.5" />
                            )}
                            {t(route.label)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={section.path}
                    onClick={closeMobileMenu}
                    className={`group flex items-center gap-3 px-3 py-[11px] rounded-xl transition-all duration-200 ${
                      isSectionActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <span className={`flex-shrink-0 ${isSectionActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`}>
                      <NavIcon sectionKey={key} />
                    </span>
                    <span className="text-sm font-medium tracking-tight">{t(section.title)}</span>
                    {isSectionActive && (
                      <span className="mr-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                    )}
                  </Link>
                )}
              </div>
            );
          })}
      </nav>

      {/* Footer */}
      {/* <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">ES</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-slate-600 truncate">نظام الإدارة</p>
            <p className="text-[10px] text-slate-400">v2.0</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
        </div>
      </div> */}
    </div>
  );

  return (
    <>
      {/* Mobile Burger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed bottom-6 right-4 z-50 bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-300 hover:bg-blue-700 active:scale-95 transition-all"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-l border-slate-100 shadow-sm flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* <button
          onClick={closeMobileMenu}
          className="absolute top-4 left-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X size={20} />
        </button> */}
        <SidebarContent />
      </aside>
    </>
  );
}