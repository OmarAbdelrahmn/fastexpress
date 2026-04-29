'use client';

import { useState } from 'react';
import {
  BarChart3, LayoutDashboard, ShoppingCart, Users,
  Home, Building2, ChevronRight
} from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { useLanguage } from '@/lib/context/LanguageContext';
import OverviewTab from './tabs/OverviewTab';
import OrdersTab from './tabs/OrdersTab';
import RidersTab from './tabs/RidersTab';
import LogisticsTab from './tabs/LogisticsTab';
import CompaniesTab from './tabs/CompaniesTab';

export default function ComprehensiveDashboardPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview',   label: t('dashboardTabs.overview.tabName')   || 'نظرة عامة',      icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
    { id: 'orders',     label: t('dashboardTabs.orders.tabName')     || 'اتجاهات الطلبات', icon: ShoppingCart,    color: 'from-emerald-500 to-emerald-600' },
    { id: 'riders',     label: t('dashboardTabs.riders.tabName')     || 'إحصاء السائقين',  icon: Users,           color: 'from-violet-500 to-violet-600' },
    { id: 'logistics',  label: t('dashboardTabs.logistics.tabName')  || 'المركبات والسكن',  icon: Home,            color: 'from-amber-500 to-amber-600' },
    { id: 'companies',  label: t('dashboardTabs.companies.tabName')  || 'الشركات',          icon: Building2,       color: 'from-rose-500 to-rose-600' },
  ];

  const activeTabConfig = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title={t('reports.dashboardPage.title') || 'لوحة التقارير الشاملة'}
        subtitle={t('reports.dashboardPage.subtitle') || 'مؤشرات الأعمال والعمليات في الوقت الفعلي'}
        icon={BarChart3}
      />

      <div className="px-6 pt-6 pb-10">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  {tab.label}
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white opacity-60" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Breadcrumb indicator */}
          <div className="flex items-center gap-1.5 mt-3 px-1">
            <span className="text-xs text-slate-400">التقارير</span>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="text-xs font-medium text-slate-600">{activeTabConfig?.label}</span>
          </div>
        </div>

        {/* Tab Content */}
        <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
          {activeTab === 'overview'  && <OverviewTab />}
          {activeTab === 'orders'    && <OrdersTab />}
          {activeTab === 'riders'    && <RidersTab />}
          {activeTab === 'logistics' && <LogisticsTab />}
          {activeTab === 'companies' && <CompaniesTab />}
        </div>
      </div>
    </div>
  );
}