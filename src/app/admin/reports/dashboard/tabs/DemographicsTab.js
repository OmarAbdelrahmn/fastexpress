'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Globe, Briefcase, CalendarCheck, Building2 } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export default function DemographicsTab() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const [data, setData] = useState({
    countries: [],
    sponsors: [],
    validity: []
  });

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [countries, sponsors, validity] = await Promise.all([
         ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.EMPLOYEES_COUNTRIES),
         ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.EMPLOYEES_SPONSORS),
         ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.VALIDITY(year, month))
      ]);
      setData({ countries: countries.slice(0, 10), sponsors: sponsors.slice(0, 10), validity });
    } catch (err) {
      console.error("Demographics load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const validityTotals = data.validity.reduce((acc, curr) => ({
     valid: acc.valid + curr.valid,
     invalid: acc.invalid + curr.invalid,
     freelancer: acc.freelancer + curr.freelancer,
     total: acc.total + curr.total
  }), {valid: 0, invalid: 0, freelancer: 0, total: 0});

  const validityPie = [
    { name: t('dashboardTabs.demographics.valid') || 'Valid', value: validityTotals.valid },
    { name: t('dashboardTabs.demographics.invalid') || 'Invalid', value: validityTotals.invalid },
    { name: t('dashboardTabs.demographics.freelancer') || 'Freelancer', value: validityTotals.freelancer },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <h3 className="font-bold text-gray-700 mr-auto flex items-center gap-2">
          <CalendarCheck size={18} className="text-blue-500" />
          {t('dashboardTabs.demographics.validityFiltering')}
        </h3>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border-gray-200 rounded-lg text-sm focus:ring-blue-500">
           {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="border-gray-200 rounded-lg text-sm focus:ring-blue-500">
           {Array.from({length: 12}).map((_, i) => <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString(typeof document !== 'undefined' ? document.documentElement.lang : 'en', { month: 'short' })}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400 animate-pulse">{t('dashboardTabs.demographics.loading')}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Validity Overview Pie */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                <h3 className="text-sm font-bold text-gray-700 self-start w-full mb-4 flex items-center gap-2">
                  <CalendarCheck size={18} className="text-indigo-500" />
                  {t('dashboardTabs.demographics.monthlyValidity')}
                </h3>
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={validityPie} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" nameKey="name" paddingAngle={2}>
                        {validityPie.map((e, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full mt-4 flex justify-between px-4 text-xs font-semibold text-gray-500 bg-gray-50 p-2 rounded-lg text-center gap-2">
                   <div>{t('dashboardTabs.demographics.valid')} <span className="block text-emerald-600 font-bold text-lg">{validityTotals.valid}</span></div>
                   <div>{t('dashboardTabs.demographics.invalid')} <span className="block text-red-600 font-bold text-lg">{validityTotals.invalid}</span></div>
                   <div>{t('dashboardTabs.demographics.freelancer')} <span className="block text-amber-600 font-bold text-lg">{validityTotals.freelancer}</span></div>
                </div>
             </div>

             {/* Validity by Company Bar Chart */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
                 <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
                  <Building2 size={18} className="text-yellow-500" />
                  {t('dashboardTabs.demographics.validityByCompany')}
                </h3>
                <div className="h-64 w-full" dir="ltr">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.validity} margin={{top: 10, right: 10, left: 0, bottom: 20}}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="companyName" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                        <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                        <Legend />
                        <Bar dataKey="valid" fill="#10b981" radius={[0,0,0,0]} stackId="a" name={t('dashboardTabs.demographics.valid')} maxBarSize={40} />
                        <Bar dataKey="freelancer" fill="#f59e0b" radius={[0,0,0,0]} stackId="a" name={t('dashboardTabs.demographics.freelancer')} maxBarSize={40} />
                        <Bar dataKey="invalid" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" name={t('dashboardTabs.demographics.invalid')} maxBarSize={40} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Top Sponsors Vertical Bar */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center col-span-1 lg:col-span-2">
                <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
                   <Briefcase size={18} className="text-purple-500" />
                   {t('dashboardTabs.demographics.topSponsors')}
                </h3>
                <div className="h-72" dir="ltr">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.sponsors} layout="vertical" margin={{top: 0, right: 30, left: 40, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                        <XAxis type="number" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                        <YAxis dataKey="sponsor" type="category" width={100} tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend />
                        <Bar dataKey="employeeCount" fill="#f43f5e" radius={[0, 0, 0, 0]} stackId="a" name={t('dashboardTabs.demographics.employees')} />
                        <Bar dataKey="riderCount" fill="#3b82f6" radius={[0, 4, 4, 0]} stackId="a" name={t('dashboardTabs.demographics.riders')} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
