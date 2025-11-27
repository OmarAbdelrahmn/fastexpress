// File: src/app/housing/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import Link from 'next/link';

const API_BASE = 'https://fastexpress.tryasp.net/api';

import { 
  Home, 
  Users, 
  Building2, 
  UserCheck, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Percent
} from 'lucide-react';

export default function HousingDashboardPage() {
  const router = useRouter();
  const [housings, setHousings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadHousings();
  }, []);

  const loadHousings = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get('/api/Housing');
      setHousings(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error('Error loading housings:', err);
      setErrorMessage('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalHousings = housings.length;
  const totalCapacity = housings.reduce((sum, h) => sum + (h.capacity || 0), 0);
  const totalEmployees = housings.reduce((sum, h) => sum + (h.employees?.length || 0), 0);
  const occupancyRate = totalCapacity > 0 ? ((totalEmployees / totalCapacity) * 100).toFixed(1) : 0;
  const availableSpaces = totalCapacity - totalEmployees;

  // Housings with high occupancy (>80%)
  const highOccupancyHousings = housings.filter(h => {
    const empCount = h.employees?.length || 0;
    const occupancy = h.capacity > 0 ? (empCount / h.capacity) * 100 : 0;
    return occupancy > 80;
  }).length;

  // Empty housings
  const emptyHousings = housings.filter(h => 
    !h.employees || h.employees.length === 0
  ).length;

  return (
    <div className="space-y-6 ">
      <PageHeader
        title="لوحة تحكم السكن"
        subtitle="نظرة عامة على جميع السكنات والإحصائيات"
        icon={Home}
      />

      {errorMessage && (
        <Alert 
          type="error" 
          title="خطأ" 
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-[10px]">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">إجمالي السكنات</p>
              <p className="text-4xl font-bold">{totalHousings}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Building2 size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-blue-100 text-sm">
            <TrendingUp size={16} />
            <span>نشط ومتاح</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm mb-1">إجمالي السعة</p>
              <p className="text-4xl font-bold">{totalCapacity}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Users size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-green-100 text-sm">
            <UserCheck size={16} />
            <span>{availableSpaces} مقعد متاح</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-orange-100 text-sm mb-1">إجمالي الموظفين</p>
              <p className="text-4xl font-bold">{totalEmployees}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <UserCheck size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-orange-100 text-sm">
            <Users size={16} />
            <span>موظف مسكّن</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-purple-100 text-sm mb-1">نسبة الإشغال</p>
              <p className="text-4xl font-bold">{occupancyRate}%</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Percent size={32} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-purple-100 text-sm">
            <TrendingUp size={16} />
            <span>من السعة الكلية</span>
          </div>
        </div>
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-[15px]">
        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">سكنات عالية الإشغال</p>
              <p className="text-2xl font-bold text-red-600">{highOccupancyHousings}</p>
              <p className="text-xs text-gray-500 mt-1">أكثر من 80% إشغال</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <Home className="text-red-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">سكنات فارغة</p>
              <p className="text-2xl font-bold text-gray-600">{emptyHousings}</p>
              <p className="text-xs text-gray-500 mt-1">بدون موظفين</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <Building2 className="text-gray-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">متوسط السعة</p>
              <p className="text-2xl font-bold text-blue-600">
                {totalHousings > 0 ? Math.round(totalCapacity / totalHousings) : 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">موظف لكل سكن</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="text-blue-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Housing List with Details */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">قائمة السكنات التفصيلية</h2>
          <div className="text-sm text-gray-500">
            {housings.length} سكن
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        ) : housings.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">لا توجد سكنات متاحة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {housings.map((housing) => {
              const employeeCount = housing.employees?.length || 0;
              const occupancyPercent = housing.capacity > 0 
                ? ((employeeCount / housing.capacity) * 100).toFixed(1) 
                : 0;
              const isFull = employeeCount >= housing.capacity;
              const isHighOccupancy = occupancyPercent > 80;

              return (
                <div 
                  key={housing.id} 
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow "
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isFull ? 'bg-red-100' : isHighOccupancy ? 'bg-orange-100' : 'bg-green-100'
                      }`}>
                        <Home className={`${
                          isFull ? 'text-red-600' : isHighOccupancy ? 'text-orange-600' : 'text-green-600'
                        }`} size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{housing.name}</h3>
                        <p className="text-xs text-gray-500">ID: {housing.id}</p>
                      </div>
                    </div>
                    {isFull && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                        ممتلئ
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{housing.address}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Users size={16} className="text-gray-400" />
                        <span className="text-gray-600">السعة:</span>
                        <span className="font-medium text-gray-800">{housing.capacity}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">الإشغال:</span>
                        <span className={`font-bold ml-1 ${
                          isFull ? 'text-red-600' : isHighOccupancy ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {employeeCount}
                        </span>
                      </div>
                    </div>

                    {/* Occupancy Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">نسبة الإشغال</span>
                        <span className={`font-medium ${
                          isFull ? 'text-red-600' : isHighOccupancy ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {occupancyPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            isFull ? 'bg-red-500' : isHighOccupancy ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {housing.managerId && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">رقم إقامة المدير:</span> {housing.managerId}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    {employeeCount > 0 ? (
                      <span>{employeeCount} موظف مسكّن</span>
                    ) : (
                      <span className="text-gray-400">لا يوجد موظفين</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

     {/* Action Buttons */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pb-[35px] p-[10px]">

  {/* Manage Housing */}
  <Link href="/housing/manage" className="block">
  <Card className="hover:shadow-md transition cursor-pointer p-3 pb-[30px] border rounded-xl bg-white">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-blue-200 p-3 rounded-xl">
          <Building2 className="text-blue-700" size={26} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-base">
            إدارة السكنات
          </h3>
          <p className="text-gray-600 text-xs">عرض، تعديل، وحذف السكنات</p>
        </div>
      </div>
      <ArrowRight className="text-gray-400" size={20} />
    </div>
  </Card>
</Link>

{/* Create Housing */}
<Link href="/housing/create" className="block">
  <Card className="hover:shadow-md transition cursor-pointer p-3 pb-[30px] border rounded-xl bg-white">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-green-200 p-3 rounded-xl">
          <Home className="text-green-700" size={26} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-base">
            إضافة سكن جديد
          </h3>
          <p className="text-gray-600 text-xs">إنشاء سكن جديد في النظام</p>
        </div>
      </div>
      <ArrowRight className="text-gray-400" size={20} />
    </div>
  </Card>
</Link>

</div>

    </div>
  );
}