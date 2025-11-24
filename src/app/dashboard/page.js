// File: src/app/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import { Car, Users, TrendingUp, Package } from 'lucide-react';

export default function DashboardPage() {
  const { get, loading } = useApi();
  const [stats, setStats] = useState({
    vehicles: 0,
    riders: 0,
    trips: 0,
    companies: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Load statistics from different endpoints
    try {
      // const [vehiclesRes, ridersRes] = await Promise.all([
      //   // get(API_ENDPOINTS.VEHICLES.LIST),
      //   // get(API_ENDPOINTS.RIDER.LIST),
      // ]);

      // setStats({
      //   vehicles: vehiclesRes.data?.length || 0,
      //   riders: ridersRes.data?.length || 0,
      //   trips: 342, // Placeholder
      //   companies: 12, // Placeholder
      // });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      
    }
  };

  const statCards = [
    {
      title: 'المركبات',
      value: stats.vehicles,
      subtitle: 'إجمالي المركبات',
      icon: Car,
      color: 'blue',
    },
    {
      title: 'السائقين',
      value: stats.riders,
      subtitle: 'سائق نشط',
      icon: Users,
      color: 'green',
    },
    {
      title: 'الرحلات اليوم',
      value: stats.trips,
      subtitle: 'رحلة مكتملة',
      icon: TrendingUp,
      color: 'orange',
    },
    {
      title: 'الشركات',
      value: stats.companies,
      subtitle: 'شركة مسجلة',
      icon: Package,
      color: 'purple',
    },
  ];

  const colors = {
    blue: 'bg-blue-50 border-blue-500 text-blue-600',
    green: 'bg-green-50 border-green-500 text-green-600',
    orange: 'bg-orange-50 border-orange-500 text-orange-600',
    purple: 'bg-purple-50 border-purple-500 text-purple-600',
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2">مرحباً بك في لوحة التحكم</h1>
        <p className="text-orange-100">نظام إدارة الخدمات اللوجستية</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${colors[stat.color]} p-6 rounded-lg border-r-4 shadow-md`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon size={32} />
                <h3 className="text-lg font-bold">{stat.title}</h3>
              </div>
              <p className="text-4xl font-bold mb-2">{loading ? '...' : stat.value}</p>
              <p className="text-sm opacity-80">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card title="إجراءات سريعة">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <Car className="mx-auto mb-2 text-orange-500" size={32} />
            <p className="font-medium">إضافة مركبة</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <Users className="mx-auto mb-2 text-orange-500" size={32} />
            <p className="font-medium">إضافة سائق</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <TrendingUp className="mx-auto mb-2 text-orange-500" size={32} />
            <p className="font-medium">عرض التقارير</p>
          </button>
        </div>
      </Card>
    </div>
  );
}