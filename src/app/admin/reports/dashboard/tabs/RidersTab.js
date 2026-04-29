'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Users, Award, Building2, Calendar, Star } from 'lucide-react';
import {
  StatCard, ChartCard, FilterBar, TOOLTIP_STYLE, PALETTE
} from './shared';

const PIE_COLORS = [PALETTE.blue, PALETTE.rose, PALETTE.emerald, PALETTE.violet, PALETTE.amber, PALETTE.cyan];
const langTag = () => (typeof document !== 'undefined' ? document.documentElement.lang : 'en');

const getShortName = (name = '') => {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).join(' ') || name.slice(0, 8);
};

const renderCustomLegend = ({ payload }) => (
  <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
    {payload.map((entry, i) => (
      <li key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
        <span>{entry.value}</span>
      </li>
    ))}
  </ul>
);

const RANK_STYLES = [
  { bg: 'bg-amber-50 border-amber-200',  badge: 'bg-amber-400 text-white',  emoji: '🥇' },
  { bg: 'bg-slate-50 border-slate-200',  badge: 'bg-slate-400 text-white',  emoji: '🥈' },
  { bg: 'bg-orange-50 border-orange-200',badge: 'bg-orange-400 text-white', emoji: '🥉' },
];

export default function RidersTab() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [year, setYear]       = useState(new Date().getFullYear());
  const [month, setMonth]     = useState(new Date().getMonth() + 1);
  const [topCount, setTopCount] = useState(10);
  const [data, setData]       = useState({ topRiders: [], byCompany: [] });

  useEffect(() => { fetchData(); }, [year, month, topCount]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [top, byComp] = await Promise.all([
        ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.RIDERS_TOP(year, month, null, topCount)),
        ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.RIDERS_BY_COMPANY),
      ]);
      setData({ topRiders: top, byCompany: byComp });
    } catch (err) {
      console.error('Riders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalActive = data.byCompany.reduce((s, c) => s + (c.activeRiders || 0), 0);
  const topRiderOrders = data.topRiders[0]?.totalOrders ?? 0;
  const avgPerShift = data.topRiders.length
    ? (data.topRiders.reduce((s, r) => s + (r.avgOrdersPerShift || 0), 0) / data.topRiders.length).toFixed(1)
    : 0;

  const kpis = [
    { label: 'إجمالي المناديب النشطين', value: totalActive,     icon: Users,   accent: PALETTE.blue },
    { label: 'أعلى مندوب (طلبات)',      value: topRiderOrders,  icon: Star,    accent: PALETTE.amber },
    { label: 'متوسط طلبات/شيفت',        value: avgPerShift,     icon: Award,   accent: PALETTE.violet },
    { label: 'عدد الشركات',             value: data.byCompany.length, icon: Building2, accent: PALETTE.emerald },
  ];

  const chartData = data.topRiders.map(r => ({
    name: getShortName(r.nameAR || r.nameEN || ''),
    orders: r.totalOrders,
    shifts: r.totalShifts,
  }));

  const companyPie = data.byCompany.map(c => ({
    name: c.companyName,
    value: c.activeRiders,
  }));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FilterBar title="تصفية المناديب" icon={Users}>
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
        <select
          value={topCount}
          onChange={e => setTopCount(Number(e.target.value))}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {[5, 10, 20, 50].map(n => <option key={n} value={n}>Top {n}</option>)}
        </select>
      </FilterBar>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 h-72 animate-pulse" />
          <div className="bg-white rounded-2xl border border-slate-100 p-5 h-72 col-span-2 animate-pulse" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* By Company Pie */}
            <ChartCard title="المناديب النشطون / الشركة" icon={Building2} accent={PALETTE.indigo}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={companyPie} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" nameKey="name">
                      {companyPie.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend content={renderCustomLegend} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Top Riders Bar */}
            <ChartCard title={`Top ${topCount} مناديب حسب الطلبات`} icon={Award} accent={PALETTE.amber} className="col-span-2">
              <div className="h-64" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} interval={0} tickLine={false} axisLine={false} angle={-25} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="orders" fill={PALETTE.violet} radius={[5, 5, 0, 0]} maxBarSize={36} name="الطلبات" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Award size={16} className="text-amber-500" />
              <h3 className="font-bold text-slate-700 text-sm">
                {t('dashboardTabs.riders.leaderboard') || 'لوحة المتصدرين'}
              </h3>
              <span className="mr-auto text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                {data.topRiders.length} مندوب
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3 text-start text-xs font-semibold text-slate-400 uppercase tracking-wider">الترتيب</th>
                    <th className="px-5 py-3 text-start text-xs font-semibold text-slate-400 uppercase tracking-wider">المندوب</th>
                    <th className="px-5 py-3 text-start text-xs font-semibold text-slate-400 uppercase tracking-wider">الشركة</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">الطلبات</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">الشيفتات</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">متوسط/شيفت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.topRiders.map((rider, idx) => {
                    const rs = RANK_STYLES[idx] || { bg: 'bg-white', badge: 'bg-slate-100 text-slate-500', emoji: null };
                    return (
                      <tr key={idx} className={`transition-colors hover:bg-slate-50/60 ${idx < 3 ? rs.bg : ''}`}>
                        <td className="px-5 py-3.5">
                          {idx < 3 ? (
                            <span className="text-lg">{rs.emoji}</span>
                          ) : (
                            <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                              {rider.rank}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-800">{rider.nameAR || rider.nameEN}</div>
                          <div className="text-xs text-slate-400 mt-0.5">#{rider.workingId}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            {rider.companyName}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="font-bold text-emerald-600 text-base">{rider.totalOrders?.toLocaleString()}</span>
                        </td>
                        <td className="px-5 py-3.5 text-center font-medium text-slate-600">{rider.totalShifts}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="font-semibold text-violet-600">{rider.avgOrdersPerShift?.toFixed(1) || '—'}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {!data.topRiders.length && (
                    <tr><td colSpan="6" className="text-center py-12 text-slate-400 text-sm">لا توجد بيانات</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}