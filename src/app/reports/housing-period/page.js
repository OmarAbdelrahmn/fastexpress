// File: src/app/reports/housing-period/page.js
'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import { Home, Users, DollarSign, MapPin } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';

export default function HousingPeriodPage() {
  const { get, loading, error } = useApi();
  const [reportData, setReportData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await get(API_ENDPOINTS.REPORTS.HOUSING_PERIOD, {
        startDate: form.startDate,
        endDate: form.endDate,
      });
      if (result.data) {
        setReportData(result.data);
        setSuccessMessage('تم جلب تقرير الإسكان بنجاح');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error fetching housing period report:', err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="تقرير الإسكان للفترة"
        subtitle="تقرير شامل لبيانات الإسكان خلال فترة محددة"
        icon={Home}
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
      <Card title="اختيار الفترة">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="تاريخ البداية"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
            <Input
              label="تاريخ النهاية"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
          </div>
          <Button type="submit" loading={loading} className="w-full">
            عرض التقرير
          </Button>
        </form>
      </Card>

      {/* Report Data */}
      {reportData && reportData.summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الوحدات</p>
                  <p className="text-3xl font-bold">{reportData.summary.totalUnits}</p>
                </div>
                <Home className="text-blue-500" size={40} />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الوحدات المشغولة</p>
                  <p className="text-3xl font-bold">{reportData.summary.occupiedUnits}</p>
                </div>
                <Users className="text-green-500" size={40} />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الوحدات الشاغرة</p>
                  <p className="text-3xl font-bold">{reportData.summary.vacantUnits}</p>
                </div>
                <Home className="text-gray-500" size={40} />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">معدل الإشغال</p>
                  <p className="text-3xl font-bold">{reportData.summary.occupancyRate.toFixed(1)}%</p>
                </div>
                <DollarSign className="text-purple-500" size={40} />
              </div>
            </Card>
          </div>

          {/* Housing Details Table */}
          <Card title="تفاصيل وحدات الإسكان">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الوحدة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العنوان</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عدد السكان</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعر الشهري</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.housing && reportData.housing.map((unit) => (
                    <tr key={unit.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{unit.unitNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{unit.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          unit.status === 'occupied' ? 'bg-green-100 text-green-800' :
                          unit.status === 'vacant' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {unit.status === 'occupied' ? 'مشغول' : 
                           unit.status === 'vacant' ? 'شاغر' : 
                           'صيانة'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{unit.currentOccupants || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{unit.capacity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{unit.monthlyRent} ريال</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Occupancy by Location */}
          {reportData.byLocation && (
            <Card title="التوزيع حسب الموقع">
              <div className="space-y-4">
                {Object.entries(reportData.byLocation).map(([location, data]) => (
                  <div key={location}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="text-blue-500" size={16} />
                        <span className="text-sm font-medium">{location}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {data.occupied}/{data.total} وحدة
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full"
                        style={{
                          width: `${(data.occupied / data.total) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Revenue Summary */}
          {reportData.revenue && (
            <Card title="ملخص الإيرادات">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">الإيرادات المتوقعة</p>
                  <p className="text-2xl font-bold">{reportData.revenue.expected.toFixed(2)} ريال</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">الإيرادات الفعلية</p>
                  <p className="text-2xl font-bold">{reportData.revenue.actual.toFixed(2)} ريال</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">الإيرادات المفقودة</p>
                  <p className="text-2xl font-bold">{reportData.revenue.lost.toFixed(2)} ريال</p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}