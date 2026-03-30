'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import { useLanguage } from '@/lib/context/LanguageContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Users, Car, Home, AlertTriangle, Briefcase, Building } from 'lucide-react';

const COLORS = ['#3b82f6','#ef4444',  '#851f74ff','#10b981',  '#8b5cf6', '#ec4899'];
const SQ_COLORS = ['#10b981', '#e05656ff', '#871f91ff', '#f6ab3bff', '#1c67fdff'];

export default function OverviewTab() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overview: null,
    vehicles: null,
    iqama: null,
    employees: null
  });

  useEffect(() => {
    async function fetchData() {
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
        console.error("Overview load error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !data.overview) {
    return <div className="p-12 text-center text-gray-500 animate-pulse">{t('dashboardTabs.overview.loading')}</div>;
  }

  const { overview, vehicles, iqama, employees } = data;

  const vehiclePieData = vehicles ? [
    { name: t('dashboardTabs.overview.vehicleAvailable') || 'Available', value: vehicles.available },
    { name: t('dashboardTabs.overview.vehicleProblem') || 'Problem/Break', value: vehicles.problem + vehicles.breakUp },
    { name: t('dashboardTabs.overview.vehicleStolen') || 'Stolen', value: vehicles.stolen },
    { name: t('dashboardTabs.overview.vehicleTaken') || 'Taken', value: vehicles.taken },
  ] : [];

  const employeePieData = employees ? [
    { name: t('dashboardTabs.overview.empEnable') || 'Enable', value: employees.enable },
    { name: t('dashboardTabs.overview.empDisable') || 'Disable', value: employees.disable },
    { name: t('dashboardTabs.overview.empFleeing') || 'Fleeing', value: employees.fleeing },
    { name: t('dashboardTabs.overview.empSick') || 'Sick/Accident', value: employees.sick + employees.accident },
    { name: t('dashboardTabs.overview.empVacation') || 'Vacation', value: employees.vacation },
  ] : [];

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm mt-4">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-700 whitespace-nowrap">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[
          { label: t('dashboardTabs.overview.totalEmployees'), value: overview.totalEmployees, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: t('dashboardTabs.overview.totalRiders'), value: overview.totalRiders, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: t('dashboardTabs.overview.totalCompanies'), value: overview.totalCompanies, icon: Home, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: t('dashboardTabs.overview.todayShifts'), value: overview.todayShifts, icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: t('dashboardTabs.overview.todayOrders'), value: overview.todayOrders, icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
            <div className={`p-3 rounded-xl ${kpi.bg}`}>
               <kpi.icon className={kpi.color} size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">{kpi.label}</p>
              <h3 className="text-xl font-bold text-gray-800">{kpi.value?.toLocaleString()}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Vehicles Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Car size={18} className="text-blue-500" />
            {t('dashboardTabs.overview.vehiclesOverview')}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vehiclePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {vehiclePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employees Chart */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Briefcase size={18} className="text-purple-500" />
            {t('dashboardTabs.overview.employeesStatus')}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={employeePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={5} dataKey="value">
                  {employeePieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={SQ_COLORS[index % SQ_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Iqama Critical */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
           <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            {t('dashboardTabs.overview.iqamaExpirations')}
          </h3>
          <div className="flex-1 flex flex-col justify-center space-y-4 py-4">
             <div className="bg-red-50 p-4 rounded-xl flex justify-between items-center border border-red-100">
                <span className="text-red-800 font-medium">{t('dashboardTabs.overview.alreadyExpired')}</span>
                <span className="text-2xl font-bold text-red-600">{iqama.expired}</span>
             </div>
             <div className="bg-orange-50 p-4 rounded-xl flex justify-between items-center border border-orange-100">
                <span className="text-orange-800 font-medium">{t('dashboardTabs.overview.critical')}</span>
                <span className="text-2xl font-bold text-orange-600">{iqama.critical}</span>
             </div>
             <div className="bg-yellow-50 p-4 rounded-xl flex justify-between items-center border border-yellow-100">
                <span className="text-yellow-800 font-medium">{t('dashboardTabs.overview.warning')}</span>
                <span className="text-2xl font-bold text-yellow-600">{iqama.warning}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
