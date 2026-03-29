'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Users, Award, Building2 } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

export default function RidersTab() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [topCount, setTopCount] = useState(10);
  const [companyId, setCompanyId] = useState('');

  const [data, setData] = useState({
    topRiders: [],
    byCompany: []
  });

  useEffect(() => {
    fetchData();
  }, [year, month, topCount, companyId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [top, byComp] = await Promise.all([
        ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.RIDERS_TOP(year, month, companyId || null, topCount)),
        ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.RIDERS_BY_COMPANY)
      ]);
      setData({ topRiders: top, byCompany: byComp });
    } catch (err) {
      console.error("Riders load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const arCompanyMap = {
     'Ninja': 'نينجا',
     'Keta': 'كيتا',
     'Hunger': 'هنقرستيشن',
     'HungerStation': 'هنقرستيشن',
     'Amazon': 'أمازون',
     'Jahez': 'جاهز',
     'ToYou': 'تويو',
     'Mrsool': 'مرسول'
  };
  
  const getCompanyName = (name) => {
     if (typeof document !== 'undefined' && document.documentElement.lang === 'ar') {
        return arCompanyMap[name] || name;
     }
     return name;
  };

  const getShortName = (name) => {
     if (!name) return '';
     const trimmed = name.trim();
     if (!trimmed) return '';
     const parts = trimmed.split(/\s+/);
     return parts.slice(0, 2).join(' ');
  };

  const chartData = data.topRiders.map(r => {
    const rawName = r.nameAR || r.nameEN || '';
    const shortName = getShortName(rawName);
    const displayName = shortName || (r.workingId ? `${r.workingId.toString().slice(-4)}` : '');
    
    return {
      name: displayName,
      orders: r.totalOrders,
      shifts: r.totalShifts,
      workingId: r.workingId,
      fullName: rawName
    };
  });

  const companyPieData = data.byCompany.map(c => ({
    name: getCompanyName(c.companyName),
    value: c.activeRiders
  }));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <h3 className="font-bold text-gray-700 mr-auto flex items-center gap-2">
          <Users size={18} className="text-purple-500" />
          {t('dashboardTabs.riders.filtering')}
        </h3>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border-gray-200 rounded-lg text-sm focus:ring-blue-500">
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border-gray-200 rounded-lg text-sm focus:ring-blue-500">
          {Array.from({ length: 12 }).map((_, i) => <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString(typeof document !== 'undefined' ? document.documentElement.lang : 'en', { month: 'short' })}</option>)}
        </select>
        <select value={topCount} onChange={(e) => setTopCount(Number(e.target.value))} className="border-gray-200 rounded-lg text-sm focus:ring-blue-500">
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={50}>Top 50</option>
        </select>
        {/* Note: Company filter ideally populated by an endpoint, but keeping text for this example or omitting if not preloaded */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Company Pie */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="text-sm font-bold text-gray-700 self-start w-full mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-indigo-500" />
            {t('dashboardTabs.riders.activePerCompany')}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {loading ? <div className="animate-pulse bg-gray-100 rounded-full h-48 w-48 mx-auto mt-4" /> : (
                <PieChart>
                  <Pie data={companyPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={4}>
                    {companyPieData.map((e, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Riders Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
            <Award size={18} className="text-yellow-500" />
            {t('dashboardTabs.riders.topRiders').replace('{{count}}', topCount)}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {loading ? <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg" /> : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Riders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-4">
          <h3 className="font-bold text-gray-700">{t('dashboardTabs.riders.leaderboard')}</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="p-8 text-center text-gray-400 animate-pulse">{t('dashboardTabs.riders.loadingPie')}</div> : (
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
                <tr>
                  <th className="px-6 py-4">{t('dashboardTabs.riders.rank')}</th>
                  <th className="px-6 py-4">{t('dashboardTabs.riders.idName')}</th>
                  <th className="px-6 py-4">{t('dashboardTabs.riders.company')}</th>
                  <th className="px-6 py-4 text-center">{t('dashboardTabs.riders.orders')}</th>
                  <th className="px-6 py-4 text-center">{t('dashboardTabs.riders.shifts')}</th>
                  <th className="px-6 py-4 text-center">{t('dashboardTabs.riders.avgPerShift')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.topRiders.map((rider, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition">
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {rider.rank === 1 ? '🥇' : rider.rank === 2 ? '🥈' : rider.rank === 3 ? '🥉' : `#${rider.rank}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{rider.nameAR || rider.nameEN}</div>
                      <div className="text-xs text-gray-400">{rider.workingId}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{rider.companyName}</td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-600">{rider.totalOrders}</td>
                    <td className="px-6 py-4 text-center font-medium bg-gray-50/50">{rider.totalShifts}</td>
                    <td className="px-6 py-4 text-center font-semibold text-purple-600">{rider.avgOrdersPerShift?.toFixed(1) || 0}</td>
                  </tr>
                ))}
                {data.topRiders.length === 0 && (
                  <tr><td colSpan="6" className="text-center p-8 text-gray-400">{t('dashboardTabs.riders.noData')}</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
