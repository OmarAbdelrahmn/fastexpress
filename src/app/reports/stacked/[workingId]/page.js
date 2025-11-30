'use client';

import { useState, useEffect ,useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, Calendar, ArrowLeft } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';

export default function RiderStackedDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workingId = params?.workingId;
  
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [message, setMessage] = useState({ type: '', text: '' });
  // Load report on component mount and when workingId changes
  useEffect(() => {
  if (workingId) {
    loadReport();
  } else {
    setMessage({ type: 'error', text: 'رقم العمل غير موجود في الرابط' });
  }
}, [workingId, year, month]);

const loadReport = async () => {
  if (!workingId) {
    setMessage({ type: 'error', text: 'رقم العمل غير موجود' });
    return;
  }

  setLoading(true);
  setMessage({ type: '', text: '' });
  try {
    ApiService.get(
  API_ENDPOINTS.REPORTS.STACKED(workingId),
  { params: { year, month } }
);

    setReport(data);
    setMessage({ type: 'success', text: 'تم تحميل التقرير بنجاح' });
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error.response?.data?.message || error.message || 'فشل تحميل التقرير';
    setMessage({ type: 'error', text: errorMessage });
    setReport(null);
  } finally {
    setLoading(false);
  }
};
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title={`تقرير التكديس - مندوب #${workingId}`}
        subtitle="عرض تفاصيل التوصيلات المكدسة للمندوب"
        icon={Package}
      />

      {/* Back Button */}
      <div className="m-6">
        <Button
          variant="outline"
          onClick={() => router.push('/reports/stacked')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          العودة إلى قائمة المناديب
        </Button>
      </div>

      {message.text && (
        <div className="m-6">
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage({ type: '', text: '' })}
          />
        </div>
      )}

      {/* Filters */}
      <div className="m-6 bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="number"
            label="رقم العمل"
            value={workingId}
            onChange={(e) => {
              const newWorkingId = e.target.value;
              if (newWorkingId) {
                router.push(`/reports/stacked/${newWorkingId}`);
              }
            }}
            placeholder="أدخل رقم العمل"
          />
          <Input
            type="number"
            label="السنة"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            min="2020"
            max="2030"
          />

          <Input
            type="number"
            label="الشهر"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            min="1"
            max="12"
          />

          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={loadReport}
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              <Calendar size={18} />
              تحديث التقرير
            </Button>
          </div>
        </div>
      </div>

      {/* Report Display */}
      {report && (
        <div className="m-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">المندوب</p>
                <p className="text-lg font-bold text-blue-600">{report.riderName}</p>
                <p className="text-sm text-gray-500">#{report.workingId}</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">الفترة</p>
                <p className="text-lg font-bold text-purple-600">
                  {monthNames[report.month - 1]} {report.year}
                </p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">⚠️ إجمالي التكديس</p>
                <p className="text-3xl font-bold text-red-600">{report.totalStackedDeliveries}</p>
                <p className="text-xs text-red-500">يجب تقليله</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">متوسط التكديس</p>
                <p className="text-3xl font-bold text-orange-600">
                  {report.averageStackedPerShift.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">لكل وردية</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">أعلى تكديس</p>
                <p className="text-3xl font-bold text-red-600">{report.maxStackedInDay}</p>
                {report.maxStackedDate && (
                  <p className="text-xs text-gray-500">
                    {new Date(report.maxStackedDate).toLocaleDateString('ar-SA')}
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card title="نظرة عامة على الأداء">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500">إجمالي الورديات</p>
                <p className="text-2xl font-bold">{report.totalShifts}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">متوسط التكديس اليومي</p>
                <p className="text-2xl font-bold text-orange-600">
                  {report.averageStackedPerShift.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">نسبة الورديات مع تكديس</p>
                <p className="text-2xl font-bold text-blue-600">
                  {report.dailyBreakdown 
                    ? ((report.dailyBreakdown.filter(d => d.stackedDeliveries > 0).length / report.dailyBreakdown.length) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">حالة الأداء</p>
                <p className={`text-2xl font-bold ${
                  report.averageStackedPerShift < 3 ? 'text-green-600' :
                  report.averageStackedPerShift < 5 ? 'text-blue-600' :
                  report.averageStackedPerShift < 8 ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {report.averageStackedPerShift < 3 ? '✅' :
                   report.averageStackedPerShift < 5 ? '⚠️' :
                   report.averageStackedPerShift < 8 ? '🔴' :
                   '🚨'}
                </p>
              </div>
            </div>
          </Card>

          {/* Daily Chart */}
          <Card title="التوزيع اليومي للتكديس">
            <div className="flex items-end justify-between gap-2 h-64 p-4">
              {report.dailyBreakdown?.map((day, idx) => {
                const maxStacked = Math.max(...report.dailyBreakdown.map(d => d.stackedDeliveries));
                const height = maxStacked > 0 ? (day.stackedDeliveries / maxStacked) * 100 : 0;
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-700">{day.stackedDeliveries}</p>
                      {day.stackedPercentage > 0 && (
                        <p className={`text-[10px] font-semibold ${
                          day.stackedPercentage >= 40 ? 'text-red-600' :
                          day.stackedPercentage >= 20 ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {day.stackedPercentage.toFixed(0)}%
                        </p>
                      )}
                    </div>
                    <div 
                      className={`w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer ${
                        day.stackedDeliveries >= 10 ? 'bg-gradient-to-t from-red-500 to-red-300' :
                        day.stackedDeliveries >= 5 ? 'bg-gradient-to-t from-orange-500 to-orange-300' :
                        day.stackedDeliveries > 0 ? 'bg-gradient-to-t from-yellow-500 to-yellow-300' :
                        'bg-gray-200'
                      }`}
                      style={{ height: `${height}%`, minHeight: day.stackedDeliveries > 0 ? '10px' : '5px' }}
                      title={`${day.date}: ${day.stackedDeliveries} توصيلة مكدسة من ${day.acceptedOrders}`}
                    />
                    <p className="text-[10px] text-gray-500">
                      {new Date(day.date).getDate()}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-t from-red-500 to-red-300"></div>
                <span>تكديس عالي (≥10)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-t from-orange-500 to-orange-300"></div>
                <span>تكديس متوسط (5-9)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-t from-yellow-500 to-yellow-300"></div>
                <span>تكديس منخفض (1-4)</span>
              </div>
            </div>
          </Card>

          {/* Daily Details Table */}
          <Card title="التفاصيل اليومية">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">التاريخ</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">اليوم</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">التوصيلات المكدسة</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الطلبات المقبولة</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">نسبة التكديس</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">الحالة</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.dailyBreakdown?.map((day, idx) => {
                    const dayDate = new Date(day.date);
                    const dayName = dayDate.toLocaleDateString('ar-SA', { weekday: 'long' });
                    
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap font-medium">
                          {dayDate.toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          {dayName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-lg font-bold ${
                            day.stackedDeliveries >= 10 ? 'text-red-600' :
                            day.stackedDeliveries >= 5 ? 'text-orange-600' :
                            day.stackedDeliveries > 0 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {day.stackedDeliveries}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {day.acceptedOrders}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            day.stackedPercentage >= 40 ? 'bg-red-100 text-red-800' :
                            day.stackedPercentage >= 20 ? 'bg-orange-100 text-orange-800' :
                            day.stackedPercentage > 0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {day.stackedPercentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {day.stackedDeliveries === 0 ? (
                            <span className="text-green-600">✅ ممتاز</span>
                          ) : day.stackedDeliveries < 5 ? (
                            <span className="text-blue-600">⚠️ مقبول</span>
                          ) : day.stackedDeliveries < 10 ? (
                            <span className="text-orange-600">🔴 يحتاج تحسين</span>
                          ) : (
                            <span className="text-red-600">🚨 حرج</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="⚠️ أسوأ 5 أيام">
              <div className="space-y-2">
                {report.dailyBreakdown
                  ?.sort((a, b) => b.stackedDeliveries - a.stackedDeliveries)
                  .slice(0, 5)
                  .map((day, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-100">
                      <span className="text-sm font-medium">
                        {new Date(day.date).toLocaleDateString('ar-SA')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-red-600">
                          {day.stackedDeliveries}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({day.stackedPercentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            <Card title="📈 معدلات الأداء">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">متوسط الطلبات المقبولة</span>
                  <span className="font-bold">
                    {report.dailyBreakdown
                      ? (report.dailyBreakdown.reduce((sum, d) => sum + d.acceptedOrders, 0) / report.dailyBreakdown.length).toFixed(1)
                      : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">متوسط نسبة التكديس</span>
                  <span className="font-bold text-orange-600">
                    {report.dailyBreakdown
                      ? (report.dailyBreakdown.reduce((sum, d) => sum + d.stackedPercentage, 0) / report.dailyBreakdown.length).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">✅ أيام بدون تكديس</span>
                  <span className="font-bold text-green-600">
                    {report.dailyBreakdown?.filter(d => d.stackedDeliveries === 0).length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">🚨 أيام بتكديس عالي (≥10)</span>
                  <span className="font-bold text-red-600">
                    {report.dailyBreakdown?.filter(d => d.stackedDeliveries >= 10).length || 0}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="🎯 التقييم">
              <div className="space-y-3">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">حالة الأداء</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {report.averageStackedPerShift < 3 ? '✅ ممتاز' :
                     report.averageStackedPerShift < 5 ? '⚠️ مقبول' :
                     report.averageStackedPerShift < 8 ? '🔴 يحتاج تحسين' :
                     '🚨 حرج'}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  {report.averageStackedPerShift < 3 && (
                    <p className="text-green-600 p-2 bg-green-50 rounded">✓ معدل تكديس منخفض - أداء جيد</p>
                  )}
                  {report.averageStackedPerShift >= 8 && (
                    <p className="text-red-600 p-2 bg-red-50 rounded">⚠ معدل تكديس مرتفع جداً</p>
                  )}
                  {report.maxStackedInDay >= 15 && (
                    <p className="text-red-600 p-2 bg-red-50 rounded">🚨 تكديس يومي عالي جداً</p>
                  )}
                  {report.dailyBreakdown?.filter(d => d.stackedDeliveries === 0).length >= report.dailyBreakdown?.length * 0.5 && (
                    <p className="text-green-600 p-2 bg-green-50 rounded">✓ نصف الأيام بدون تكديس</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}