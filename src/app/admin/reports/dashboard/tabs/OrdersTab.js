'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Calendar, Package, TrendingUp } from 'lucide-react';

export default function OrdersTab() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [days, setDays] = useState(30);

  const [data, setData] = useState({
    byCompany: [],
    trend: [],
    daily: []
  });

  useEffect(() => {
    fetchData();
  }, [year, month, days]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [byCompany, trend, daily] = await Promise.all([
        ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.ORDERS_BY_COMPANY(year, month)),
        ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.ORDERS_TREND(6)),
        ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.ORDERS_DAILY(days))
      ]);
      setData({ byCompany, trend, daily });
    } catch (err) {
      console.error("Orders load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const langTag = typeof document !== 'undefined' ? document.documentElement.lang : 'en';
  const currentMonthName = new Date(year, month - 1).toLocaleString(langTag, { month: 'long' });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <h3 className="font-bold text-gray-700 mr-auto flex items-center gap-2">
          <Calendar size={18} className="text-blue-500" />
          {t('dashboardTabs.orders.dataPeriod')}
        </h3>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border-gray-200 rounded-lg text-sm focus:ring-blue-500">
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border-gray-200 rounded-lg text-sm focus:ring-blue-500">
          {Array.from({ length: 12 }).map((_, i) => <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString(langTag, { month: 'short' })}</option>)}
        </select>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="border-gray-200 rounded-lg text-sm focus:ring-blue-500">
          <option value={7}>{t('dashboardTabs.orders.last7Days')}</option>
          <option value={15}>{t('dashboardTabs.orders.last15Days')}</option>
          <option value={30}>{t('dashboardTabs.orders.last30Days')}</option>
        </select>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400 animate-pulse">{t('dashboardTabs.orders.loading')}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Trend */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" />
                {t('dashboardTabs.orders.dailyTrend')} {t('dashboardTabs.orders.lastDays').replace('{{days}}', days)}
              </h3>
              <div className="h-72" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.daily} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="totalOrders" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" name={t('dashboardTabs.orders.totalOrders')} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-500" />
                {t('dashboardTabs.orders.monthlyOverview')}
              </h3>
              <div className="h-72" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trend} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="totalOrders" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name={t('dashboardTabs.orders.totalOrders')} />
                    <Line type="monotone" dataKey="totalRejected" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name={t('dashboardTabs.orders.rejectedOrders')} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Orders by Company Bar Chart */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
              <Package size={18} className="text-purple-500" />
              {t('dashboardTabs.orders.ordersByCompany')} ({currentMonthName} {year})
            </h3>
            <div className="h-[400px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byCompany} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="companyName" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Bar dataKey="totalOrders" fill="#D7C49E" radius={[6, 6, 0, 0]} name={t('dashboardTabs.orders.orders')} maxBarSize={60} />
                  <Bar dataKey="totalShifts" fill="#343148" radius={[6, 6, 0, 0]} name={t('dashboardTabs.orders.shifts')} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
