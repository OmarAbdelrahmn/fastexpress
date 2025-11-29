// File: src/app/reports/top-riders-monthly/page.js
'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import { Award, Trophy, Medal } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import {ApiService} from '@/lib/api/apiService'


export default function TopRidersMonthlyPage() {
  const { get, loading, error } = useApi();
  const [reportData, setReportData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    topCount: 10,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(''); // تصفير رسائل النجاح السابقة

    let safeYear = parseInt(form.year, 10);
    if (isNaN(safeYear)) safeYear = new Date().getFullYear();

    let safeMonth = parseInt(form.month, 10);
    if (isNaN(safeMonth) || safeMonth < 1 || safeMonth > 12) {
      safeMonth = new Date().getMonth() + 1;
    }

    let safeTopCount = parseInt(form.topCount, 10);
    if (isNaN(safeTopCount)) safeTopCount = 10;

    setForm({
      year: safeYear,
      month: safeMonth,
      topCount: safeTopCount
    });

    
    try {
      const result = await ApiService.get(API_ENDPOINTS.REPORTS.TOP_RIDERS_MONTHLY, {
        year: safeYear,
        month: safeMonth, 
        topCount: safeTopCount,
      });

      if (result.data) {
        setReportData(result.data);
        setSuccessMessage('تم جلب تقرير أفضل السائقين بنجاح');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error fetching top riders monthly:', err);
    }
  };
  const getMedalIcon = (rank) => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Medal className="text-orange-600" size={24} />;
    return <Award className="text-blue-500" size={20} />;
  };

  const getMedalColor = (rank) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'bg-gray-50 border-gray-200';
    if (rank === 3) return 'bg-orange-50 border-orange-200';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="أفضل السائقين الشهري"
        subtitle="ترتيب أفضل السائقين أداءً لشهر محدد"
        icon={Award}
      />

      {successMessage && (
        <Alert 
          type="success" 
          title="نجح" 
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      {error && (
        <Alert type="error" title="خطأ" message={error} />
      )}

      {/* Form */}
      <Card title="معايير البحث">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="السنة"
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: parseInt(e.target.value, 10) || '' })}
              required
            />
            <Input
            label="الشهر"
            type="number"
            min="1"
            max="12"
            value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })} // إزالة parseInt هنا لتسهيل الكتابة
            required
            />
            <Input
              label="عدد السائقين"
              type="number"
              min="1"
              max="50"
              value={form.topCount}
              onChange={(e) => setForm({ ...form, topCount: parseInt(e.target.value, 10) || '' })}
              required
            />
          </div>
          <Button type="submit" loading={loading} className="w-full">
            عرض الترتيب
          </Button>
        </form>
      </Card>

      {/* Report Data */}
      {reportData && reportData.riders && reportData.riders.length > 0 && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600">إجمالي السائقين</p>
                <p className="text-3xl font-bold">{reportData.riders.length}</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                <p className="text-3xl font-bold">
                  {reportData.riders.reduce((sum, r) => sum + (r.totalOrders || 0), 0)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
                <p className="text-3xl font-bold">
                  {reportData.riders.reduce((sum, r) => sum + (r.totalRevenue || 0), 0).toFixed(2)} ريال
                </p>
              </div>
            </Card>
          </div>

          {/* Top 3 Podium */}
          {reportData.riders.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 items-end">
              {/* 2nd Place */}
              <Card className="bg-gray-50 border-2 border-gray-300">
                <div className="text-center space-y-3">
                  <Medal className="text-gray-400 mx-auto" size={48} />
                  <div>
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-lg font-semibold">{reportData.riders[1].name}</p>
                    <p className="text-sm text-gray-600">رقم العمل: {reportData.riders[1].workingId}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm text-gray-600">الطلبات</p>
                    <p className="text-2xl font-bold text-gray-700">{reportData.riders[1].totalOrders}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm text-gray-600">الإيرادات</p>
                    <p className="text-xl font-bold text-gray-700">
                      {reportData.riders[1].totalRevenue.toFixed(2)} ريال
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-lg">
                    <p className="text-xs text-gray-600">معدل الإنجاز</p>
                    <p className="text-lg font-bold text-gray-700">
                      {reportData.riders[1].completionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Card>

              {/* 1st Place */}
              <Card className="bg-yellow-50 border-4 border-yellow-400 transform scale-105">
                <div className="text-center space-y-3">
                  <Trophy className="text-yellow-500 mx-auto" size={64} />
                  <div>
                    <p className="text-4xl font-bold text-yellow-600">1</p>
                    <p className="text-xl font-bold">{reportData.riders[0].name}</p>
                    <p className="text-sm text-gray-600">رقم العمل: {reportData.riders[0].workingId}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">الطلبات</p>
                    <p className="text-3xl font-bold text-yellow-600">{reportData.riders[0].totalOrders}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-sm text-gray-600">الإيرادات</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {reportData.riders[0].totalRevenue.toFixed(2)} ريال
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600">معدل الإنجاز</p>
                    <p className="text-xl font-bold text-yellow-600">
                      {reportData.riders[0].completionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Card>

              {/* 3rd Place */}
              <Card className="bg-orange-50 border-2 border-orange-300">
                <div className="text-center space-y-3">
                  <Medal className="text-orange-600 mx-auto" size={48} />
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-lg font-semibold">{reportData.riders[2].name}</p>
                    <p className="text-sm text-gray-600">رقم العمل: {reportData.riders[2].workingId}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm text-gray-600">الطلبات</p>
                    <p className="text-2xl font-bold text-orange-600">{reportData.riders[2].totalOrders}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-sm text-gray-600">الإيرادات</p>
                    <p className="text-xl font-bold text-orange-600">
                      {reportData.riders[2].totalRevenue.toFixed(2)} ريال
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-lg">
                    <p className="text-xs text-gray-600">معدل الإنجاز</p>
                    <p className="text-lg font-bold text-orange-600">
                      {reportData.riders[2].completionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Performance Chart */}
          <Card title="مقارنة الأداء الشهري">
            <div className="space-y-4">
              {reportData.riders.map((rider, index) => (
                <div key={rider.workingId || index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getMedalIcon(index + 1)}
                      <div>
                        <span className="text-sm font-medium">{rider.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({rider.workingId})</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{rider.totalOrders} طلب</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full flex items-center justify-end px-2 ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-500' :
                        'bg-blue-500'
                      }`}
                      style={{
                        width: `${reportData.riders[0].totalOrders > 0 ? (rider.totalOrders / reportData.riders[0].totalOrders) * 100 : 0}%`,
                        minWidth: '60px'
                      }}
                    >
                      <span className="text-xs text-white font-medium">
                        {rider.totalRevenue.toFixed(0)} ريال
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Full Ranking Table */}
          <Card title="الترتيب الكامل">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الترتيب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم العمل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطلبات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإيرادات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">متوسط الطلب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">معدل الإنجاز</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {reportData.riders.map((rider, index) => (
                    <tr key={rider.workingId || index} className={`border-2 ${getMedalColor(index + 1)}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getMedalIcon(index + 1)}
                          <span className="text-lg font-bold">{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{rider.workingId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{rider.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{rider.totalOrders}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {rider.totalRevenue.toFixed(2)} ريال
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {rider.totalOrders > 0 ? (rider.totalRevenue / rider.totalOrders).toFixed(2) : '0.00'} ريال
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {rider.completionRate.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Statistics Summary */}
          <Card title="إحصائيات عامة">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">متوسط الطلبات لكل سائق</p>
                <p className="text-2xl font-bold">
                  {reportData.riders.length > 0
                    ? (reportData.riders.reduce((sum, r) => sum + r.totalOrders, 0) / reportData.riders.length).toFixed(1)
                    : '0.0'}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">متوسط الإيرادات لكل سائق</p>
                <p className="text-2xl font-bold">
                  {reportData.riders.length > 0
                    ? (reportData.riders.reduce((sum, r) => sum + r.totalRevenue, 0) / reportData.riders.length).toFixed(2)
                    : '0.00'} ريال
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">أعلى إنجاز</p>
                <p className="text-2xl font-bold">
                  {reportData.riders.length > 0
                    ? Math.max(...reportData.riders.map(r => r.completionRate)).toFixed(1)
                    : '0.0'}%
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">متوسط الإنجاز</p>
                <p className="text-2xl font-bold">
                  {reportData.riders.length > 0
                    ? (reportData.riders.reduce((sum, r) => sum + r.completionRate, 0) / reportData.riders.length).toFixed(1)
                    : '0.0'}%
                </p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* No Data Message */}
      {reportData && reportData.riders && reportData.riders.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">لا توجد بيانات للعرض في الفترة المحددة</p>
          </div>
        </Card>
      )}
    </div>
  );
}