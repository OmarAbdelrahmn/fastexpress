'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Calendar, Package, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import {
  StatCard, ChartCard, FilterBar, PillButton, LoadingSkeleton,
  TOOLTIP_STYLE, PALETTE, CHART_COLORS
} from './shared';

const langTag = () => (typeof document !== 'undefined' ? document.documentElement.lang : 'en');

export default function OrdersTab() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [year, setYear]   = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [days, setDays]   = useState(30);
  const [data, setData]   = useState({ byCompany: [], trend: [], daily: [] });

  useEffect(() => { fetchData(); }, [year, month, days]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [byCompany, trend, daily] = await Promise.all([
        ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.ORDERS_BY_COMPANY(year, month)),
        ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.ORDERS_TREND(6)),
        ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.ORDERS_DAILY(days)),
      ]);
      setData({ byCompany, trend, daily });
    } catch (err) {
      console.error('Orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const monthName = new Date(year, month - 1).toLocaleString(langTag(), { month: 'long' });

  // KPIs from byCompany
  const totalOrders   = data.byCompany.reduce((s, c) => s + (c.totalOrders || 0), 0);
  const totalShifts   = data.byCompany.reduce((s, c) => s + (c.totalShifts || 0), 0);
  const totalRejected = data.trend.slice(-1)[0]?.totalRejected ?? 0;
  const acceptRate    = totalOrders > 0 ? Math.round((totalOrders / (totalOrders + totalRejected)) * 100) : 0;

  const kpis = [
    { label: 'إجمالي الطلبات',    value: totalOrders,   icon: Package,     accent: PALETTE.blue },
    { label: 'إجمالي الشيفتات',   value: totalShifts,   icon: Calendar,    accent: PALETTE.emerald },
    { label: 'طلبات مرفوضة',     value: totalRejected,  icon: XCircle,     accent: PALETTE.rose },
    { label: 'معدل القبول',       value: `${acceptRate}%`, icon: CheckCircle, accent: PALETTE.amber },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FilterBar title="فترة البيانات" icon={Calendar}>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
          </select>
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString(langTag(), { month: 'short' })}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-1.5">
          {[7, 15, 30].map(d => (
            <PillButton key={d} active={days === d} onClick={() => setDays(d)}>
              {d} يوم
            </PillButton>
          ))}
        </div>
      </FilterBar>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 h-80 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Daily Area Chart */}
            <ChartCard
              title={`اتجاه الطلبات اليومي — آخر ${days} يوم`}
              icon={TrendingUp}
              accent={PALETTE.emerald}
            >
              <div className="h-72" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.daily} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#059669" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Area
                      type="monotone"
                      dataKey="totalOrders"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fill="url(#gradOrders)"
                      name={t('dashboardTabs.orders.totalOrders') || 'إجمالي الطلبات'}
                      dot={false}
                      activeDot={{ r: 5, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Monthly Trend Line */}
            <ChartCard
              title="الاتجاه الشهري (6 أشهر)"
              icon={TrendingUp}
              accent={PALETTE.blue}
            >
              <div className="h-72" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trend} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="monthLabel" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="totalOrders"
                      stroke={PALETTE.blue}
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: PALETTE.blue, stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                      name={t('dashboardTabs.orders.totalOrders') || 'مقبولة'}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalRejected"
                      stroke={PALETTE.rose}
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      dot={{ r: 3, fill: PALETTE.rose, stroke: '#fff', strokeWidth: 2 }}
                      name={t('dashboardTabs.orders.rejectedOrders') || 'مرفوضة'}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* By Company Bar */}
          <ChartCard
            title={`الطلبات والشيفتات بالشركة — ${monthName} ${year}`}
            icon={Package}
            accent={PALETTE.violet}
          >
            <div className="h-80" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byCompany} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="companyName" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="totalOrders" fill={PALETTE.blue}   radius={[6, 6, 0, 0]} maxBarSize={48} name={t('dashboardTabs.orders.orders') || 'الطلبات'} />
                  <Bar dataKey="totalShifts" fill={PALETTE.slate}  radius={[6, 6, 0, 0]} maxBarSize={48} name={t('dashboardTabs.orders.shifts') || 'الشيفتات'} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </>
      )}
    </div>
  );
}