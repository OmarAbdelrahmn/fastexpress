'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Car, Home, Globe, Users, Wrench, CheckCircle } from 'lucide-react';
import {
  StatCard, ChartCard, TOOLTIP_STYLE, PALETTE, EmptyState
} from './shared';

export default function LogisticsTab() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState({ vehicles: null, housing: [], countries: [] });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [vehiclesRes, housingRes, demoRes] = await Promise.all([
          ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.VEHICLES_STATS),
          ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.HOUSING_STATS),
          ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.EMPLOYEES_COUNTRIES),
        ]);
        setData({ vehicles: vehiclesRes, housing: housingRes, countries: demoRes.slice(0, 10) });
      } catch (err) {
        console.error('Logistics error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { vehicles, housing, countries } = data;
  const totalVehicles = vehicles ? (vehicles.available + vehicles.taken + vehicles.problem + vehicles.breakUp + (vehicles.outOfService || 0) + vehicles.stolen) : 0;
  const totalHousingCapacity = housing.reduce((s, h) => s + (h.capacity || 0), 0);
  const totalOccupied        = housing.reduce((s, h) => s + (h.occupiedCount || 0), 0);
  const overallOccupancy     = totalHousingCapacity > 0 ? Math.round((totalOccupied / totalHousingCapacity) * 100) : 0;

  const kpis = [
    { label: 'إجمالي المركبات',   value: totalVehicles,         icon: Car,         accent: PALETTE.blue },
    { label: 'متاحة للتسليم',     value: vehicles?.available,   icon: CheckCircle, accent: PALETTE.emerald },
    { label: 'في الخدمة',         value: vehicles?.taken,       icon: Car,         accent: PALETTE.violet },
    { label: 'سعة السكن الكلية',  value: totalHousingCapacity,  icon: Home,        accent: PALETTE.amber },
    { label: 'نسبة الإشغال',      value: `${overallOccupancy}%`,icon: Users,       accent: PALETTE.rose },
  ];

  const vTypes = vehicles?.byType || [];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 h-80 animate-pulse" />
          <div className="bg-white rounded-2xl border border-slate-100 p-5 h-80 animate-pulse" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Vehicles by Type */}
            <ChartCard title="المركبات حسب النوع" icon={Car} accent={PALETTE.blue}>
              <div className="h-72" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vTypes} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }} barGap={3}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="vehicleType" type="category" width={85} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="available" stackId="a" fill={PALETTE.emerald} radius={[0, 0, 0, 0]} name={t('dashboardTabs.logistics.available') || 'متاح'} maxBarSize={24} />
                    <Bar dataKey="taken"     stackId="a" fill={PALETTE.blue}    radius={[0, 4, 4, 0]} name={t('dashboardTabs.logistics.taken') || 'مستخدم'}    maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Nationalities */}
            <ChartCard title="أبرز الجنسيات" icon={Globe} accent={PALETTE.cyan}>
              <div className="h-72" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countries} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="country" type="category" width={80} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="employeeCount" stackId="a" fill="#475569"   radius={[0, 0, 0, 0]} name={t('dashboardTabs.demographics.employees') || 'موظفون'} maxBarSize={22} />
                    <Bar dataKey="riderCount"    stackId="a" fill={PALETTE.cyan} radius={[0, 4, 4, 0]} name={t('dashboardTabs.demographics.riders') || 'مناديب'}   maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Housing Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Home size={16} className="text-amber-500" />
              <h3 className="font-bold text-slate-700 text-sm">
                {t('dashboardTabs.logistics.allHousings') || 'جميع مرافق السكن'}
              </h3>
              <span className="mr-auto text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                {housing.length} مرفق
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3 text-start text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('dashboardTabs.logistics.housingName') || 'الاسم'}</th>
                    <th className="px-5 py-3 text-start text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('dashboardTabs.logistics.address') || 'العنوان'}</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('dashboardTabs.logistics.capacity') || 'الطاقة'}</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('dashboardTabs.logistics.occupied') || 'مشغول'}</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('dashboardTabs.logistics.occupancyRate') || 'نسبة الإشغال'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {housing.map((h, idx) => {
                    const rate = h.occupancyRate ?? 0;
                    const rateColor = rate > 90 ? 'text-rose-500' : rate > 70 ? 'text-amber-500' : 'text-emerald-600';
                    const barColor  = rate > 90 ? 'bg-rose-400' : rate > 70 ? 'bg-amber-400' : 'bg-emerald-400';
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-800">{h.housingName}</td>
                        <td className="px-5 py-3.5 text-xs text-slate-400 max-w-[180px] truncate">{h.address || '—'}</td>
                        <td className="px-5 py-3.5 text-center font-medium text-slate-600">{h.capacity}</td>
                        <td className="px-5 py-3.5 text-center font-bold text-blue-600">{h.occupiedCount}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center gap-2.5">
                            <span className={`font-bold text-sm ${rateColor}`}>{rate.toFixed(1)}%</span>
                            <div className="w-20 bg-slate-100 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full transition-all ${barColor}`} style={{ width: `${Math.min(100, rate)}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!housing.length && (
                    <tr><td colSpan="5" className="text-center py-12"><EmptyState /></td></tr>
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