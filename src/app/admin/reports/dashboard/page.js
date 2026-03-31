'use client';

import { useState } from 'react';
import {
  BarChart3, LayoutDashboard, ShoppingCart, Users,
  Home, Globe, Building2
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
    { id: 'overview', label: t('dashboardTabs.overview.tabName') || 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: t('dashboardTabs.orders.tabName') || 'Orders Trends', icon: ShoppingCart },
    { id: 'riders', label: t('dashboardTabs.riders.tabName') || 'Riders Stats', icon: Users },
    { id: 'logistics', label: t('dashboardTabs.logistics.tabName') || 'Vehicles & Housing', icon: Home },
    { id: 'companies', label: t('dashboardTabs.companies.tabName') || 'Companies', icon: Building2 },
  ];

  
  return (
    <div className="min-h-screen bg-gray-50/50">
      <PageHeader
        title={t('reports.dashboardPage.title') || 'Comprehensive Dashboard'}
        subtitle={t('reports.dashboardPage.subtitle') || 'Real-time overview of business metrics and operations'}
        icon={BarChart3}
      />

      <div className="mx-6 mb-6 pt-4">
        {/* Modern Tabs Navigation */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-6 flex space-x-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 translate-y-[-1px]'
                  : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'stroke-[2.5px]' : ''} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'riders' && <RidersTab />}
          {activeTab === 'logistics' && <LogisticsTab />}
          {activeTab === 'companies' && <CompaniesTab />}
        </div>
      </div>
    </div>
  );
}