'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip as RechartsTooltip, Legend
} from 'recharts';
import {
  Users, Car, AlertTriangle, Briefcase,
  Building, TrendingUp, Activity, ShieldAlert
} from 'lucide-react';
import {
  StatCard, ChartCard, LoadingSkeleton, EmptyState,
  CHART_COLORS, TOOLTIP_STYLE, PALETTE
} from './shared';

const VEHICLE_COLORS  = ['#059669', '#e11d48', '#d97706', '#64748b', '#7c3aed', '#2563eb'];
const EMPLOYEE_COLORS = ['#2563eb', '#e11d48', '#7c3aed', '#d97706', '#059669'];

const renderCustomLegend = ({ payload }) => (
  <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-4">
    {payload.map((entry, i) => (
      <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
        <span className="font-medium">{entry.value}</span>
      </li>
    ))}
  </ul>
);

export default function OverviewTab() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ overview: null, vehicles: null, iqama: null, employees: null });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [overview, vehicles, iqama, employees] = await Promise.all([
          ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.OVERVIEW),
          ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.VEHICLES_STATS),
          ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.IQAMA_EXPIRY),
          ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.EMPLOYEES_STATUS),
        ]);
        setData({ overview, vehicles, iqama, employees });
      } catch (err) {
        console.error('Overview error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !data.overview) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-28 animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-10 h-10 bg-slate-100 rounded-xl mb-3" />
              <div className="h-6 w-16 bg-slate-100 rounded-lg mb-2" />
              <div className="h-3 w-24 bg-slate-50 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 h-72 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  const { overview, vehicles, iqama, employees } = data;

  const kpis = [
    { label: t('dashboardTabs.overview.totalEmployees') || 'إجمالي الموظفين', value: overview.totalEmployees, icon: Briefcase,   accent: PALETTE.blue },
    { label: t('dashboardTabs.overview.totalRiders')    || 'إجمالي المناديب',  value: overview.totalRiders,    icon: Users,        accent: PALETTE.violet },
    { label: t('dashboardTabs.overview.totalCompanies') || 'الشركات',          value: overview.totalCompanies, icon: Building,     accent: PALETTE.indigo },
    { label: t('dashboardTabs.overview.todayShifts')    || 'شيفتات اليوم',     value: overview.todayShifts,    icon: Activity,     accent: PALETTE.emerald },
    { label: t('dashboardTabs.overview.todayOrders')    || 'طلبات اليوم',      value: overview.todayOrders,    icon: TrendingUp,   accent: PALETTE.amber },
  ];

  const vehiclePie = vehicles ? [
    { name: t('dashboardTabs.overview.vehicleAvailable') || 'متاحة',        value: vehicles.available },
    { name: t('dashboardTabs.overview.vehicleProblem')   || 'عطل',          value: vehicles.problem },
    { name: t('vehicles.outOfService')                   || 'متوقفة',       value: vehicles.breakUp },
    { name: t('vehicles.actualOutOfService')             || 'خارج الخدمة',  value: vehicles.outOfService || 0 },
    { name: t('dashboardTabs.overview.vehicleStolen')    || 'مسروقة',       value: vehicles.stolen },
    { name: t('dashboardTabs.overview.vehicleTaken')     || 'في الاستخدام', value: vehicles.taken },
  ].filter(d => d.value > 0) : [];

  const employeePie = employees ? [
    { name: t('dashboardTabs.overview.empEnable')   || 'نشط',       value: employees.enable },
    { name: t('dashboardTabs.overview.empDisable')  || 'غير نشط',   value: employees.disable },
    { name: t('dashboardTabs.overview.empFleeing')  || 'هروب',      value: employees.fleeing },
    { name: t('dashboardTabs.overview.empSick')     || 'مريض/حادث', value: employees.sick + employees.accident },
    { name: t('dashboardTabs.overview.empVacation') || 'إجازة',     value: employees.vacation },
  ].filter(d => d.value > 0) : [];

  const iqamaAlerts = [
    { label: t('dashboardTabs.overview.alreadyExpired') || 'منتهية الصلاحية', value: iqama?.expired,  accent: '#e11d48', bg: 'bg-rose-50',   border: 'border-rose-100',   text: 'text-rose-600' },
    { label: t('dashboardTabs.overview.critical')        || 'حرجة (30 يوم)',   value: iqama?.critical, accent: '#d97706', bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-600' },
    { label: t('dashboardTabs.overview.warning')         || 'تحذير (90 يوم)',  value: iqama?.warning,  accent: '#ca8a04', bg: 'bg-yellow-50', border: 'border-yellow-100', text: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {kpis.map((k, i) => (
          <StatCard key={i} {...k} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Vehicles Pie */}
        <ChartCard title={t('dashboardTabs.overview.vehiclesOverview') || 'حالة المركبات'} icon={Car} accent={PALETTE.blue}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vehiclePie} cx="50%" cy="45%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                  {vehiclePie.map((_, i) => <Cell key={i} fill={VEHICLE_COLORS[i % VEHICLE_COLORS.length]} strokeWidth={0} />)}
                </Pie>
                <RechartsTooltip contentStyle={TOOLTIP_STYLE} />
                <Legend content={renderCustomLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Employees Pie */}
        <ChartCard title={t('dashboardTabs.overview.employeesStatus') || 'حالة الموظفين'} icon={Users} accent={PALETTE.violet}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={employeePie} cx="50%" cy="45%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                  {employeePie.map((_, i) => <Cell key={i} fill={EMPLOYEE_COLORS[i % EMPLOYEE_COLORS.length]} strokeWidth={0} />)}
                </Pie>
                <RechartsTooltip contentStyle={TOOLTIP_STYLE} />
                <Legend content={renderCustomLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Iqama Alerts */}
        <ChartCard title={t('dashboardTabs.overview.iqamaExpirations') || 'انتهاء الإقامات'} icon={ShieldAlert} accent={PALETTE.rose}>
          <div className="space-y-3 pt-1">
            {iqamaAlerts.map((alert, i) => (
              <div key={i} className={`flex items-center justify-between px-4 py-3.5 rounded-xl border ${alert.bg} ${alert.border}`}>
                <div className="flex items-center gap-2.5">
                  <AlertTriangle size={15} className={alert.text} />
                  <span className={`text-sm font-medium ${alert.text.replace('600', '800')}`}>{alert.label}</span>
                </div>
                <span className={`text-2xl font-bold ${alert.text}`}>{alert.value ?? 0}</span>
              </div>
            ))}
            {iqama && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>إجمالي تحت المراقبة</span>
                <span className="font-bold text-slate-600">
                  {((iqama.expired || 0) + (iqama.critical || 0) + (iqama.warning || 0)).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}