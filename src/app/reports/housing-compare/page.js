'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import { Building } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import {ApiService} from '@/lib/api/apiService'

export default function HousingComparePage() {
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
      const result = await ApiService.get(API_ENDPOINTS.REPORTS.HOUSING_COMPARE_PERIOD, {
        startDate: form.startDate,
        endDate: form.endDate,
      });
      if (result.data) {
        setReportData(result.data);
        setSuccessMessage('تم جلب تقرير مقارنة الإسكان بنجاح');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="مقارنة الإسكان للفترة" subtitle="مقارنة جميع وحدات الإسكان خلال فترة محددة" icon={Building} />
      {successMessage && <Alert type="success" title="نجح" message={successMessage} onClose={() => setSuccessMessage('')} />}
      {error && <Alert type="error" title="خطأ" message={error} />}

      <Card title="اختيار الفترة">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="تاريخ البداية" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <Input label="تاريخ النهاية" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
          </div>
          <Button type="submit" loading={loading} className="w-full">عرض المقارنة</Button>
        </form>
      </Card>

      {reportData && reportData.comparison && (
        <Card title="مقارنة وحدات الإسكان">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوحدة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموقع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإشغال</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإيرادات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.comparison.map((unit) => (
                  <tr key={unit.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{unit.unitNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{unit.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{unit.occupancyRate.toFixed(1)}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{unit.revenue.toFixed(2)} ريال</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
