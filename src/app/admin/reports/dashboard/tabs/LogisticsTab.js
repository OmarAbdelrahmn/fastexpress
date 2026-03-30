'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';
import { Car, Home, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function LogisticsTab() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    vehicles: null,
    housing: [],
    countries: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, housingRes, demoRes] = await Promise.all([
         ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.VEHICLES_STATS),
         ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.HOUSING_STATS),
         ApiService.get(API_ENDPOINTS.DASHBOARD_NEW.EMPLOYEES_COUNTRIES)
      ]);
      setData({ vehicles: vehiclesRes, housing: housingRes, countries: demoRes.slice(0, 10) });
    } catch (err) {
      console.error("Logistics load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const vTypes = data.vehicles?.byType || [];
  
  const countries = data.countries || [];

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400 animate-pulse">{t('dashboardTabs.logistics.loading')}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Vehicles Stats */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
                   <Car size={18} className="text-indigo-500" />
                   {t('dashboardTabs.logistics.vehiclesByType')}
                </h3>
                <div className="h-72" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vTypes} layout="vertical" margin={{top: 0, right: 30, left: 20, bottom: 5}}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                      <XAxis type="number" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                      <YAxis dataKey="vehicleType" type="category" width={80} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend />
                      <Bar dataKey="available" stackId="a" fill="#02343F" radius={[0, 0, 0, 0]} name={t('dashboardTabs.logistics.available')} />
                      <Bar dataKey="taken" stackId="a" fill="#b3ae82ff" radius={[0, 4, 4, 0]} name={t('dashboardTabs.logistics.taken')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Employee Countries Vertical Bar */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
                   <Globe size={18} className="text-blue-500" />
                   {t('dashboardTabs.demographics.topNationalities')}
                </h3>
                <div className="h-72" dir="ltr">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={countries} layout="vertical" margin={{top: 0, right: 30, left: 30, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                        <XAxis type="number" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                        <YAxis dataKey="country" type="category" width={80} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend />
                        <Bar dataKey="employeeCount" stackId="a" fill="#50586C" radius={[0, 0, 0, 0]} name={t('dashboardTabs.demographics.employees')} />
                        <Bar dataKey="riderCount" stackId="a" fill="#97a6c7ff" radius={[0, 4, 4, 0]} name={t('dashboardTabs.demographics.riders')} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* All Housing Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4">
              <h3 className="font-bold text-gray-700">{t('dashboardTabs.logistics.allHousings')}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-semibold text-gray-500">
                  <tr>
                    <th className="px-6 py-4">{t('dashboardTabs.logistics.housingName')}</th>
                    <th className="px-6 py-4">{t('dashboardTabs.logistics.address')}</th>
                    <th className="px-6 py-4 text-center">{t('dashboardTabs.logistics.capacity')}</th>
                    <th className="px-6 py-4 text-center">{t('dashboardTabs.logistics.occupied')}</th>
                    <th className="px-6 py-4 text-center">{t('dashboardTabs.logistics.occupancyRate')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.housing.map((h, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/50 transition">
                      <td className="px-6 py-4 font-bold text-gray-800">{h.housingName}</td>
                      <td className="px-6 py-4 text-xs">{h.address || '-'}</td>
                      <td className="px-6 py-4 text-center font-medium bg-gray-50/50">{h.capacity}</td>
                      <td className="px-6 py-4 text-center font-bold text-blue-600">{h.occupiedCount}</td>
                      <td className="px-6 py-4 text-center">
                         <div className="flex items-center justify-center gap-2">
                            <span className={`font-bold ${h.occupancyRate > 90 ? 'text-red-500' : h.occupancyRate > 70 ? 'text-orange-500' : 'text-emerald-500'}`}>
                              {h.occupancyRate?.toFixed(1)}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                               <div className={`h-2 rounded-full ${h.occupancyRate > 90 ? 'bg-red-500' : h.occupancyRate > 70 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{width: `${Math.min(100, h.occupancyRate)}%`}}></div>
                            </div>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {data.housing.length === 0 && (
                    <tr><td colSpan="5" className="text-center p-8 text-gray-400">{t('dashboardTabs.logistics.noData')}</td></tr>
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
