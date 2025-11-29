'use client';

import { useState } from 'react';
import { Package, Search } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';
import Modal from '@/components/Ui/Model';

export default function StackedDeliveriesPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [workingId, setWorkingId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);

  const loadReport = async () => {
    if (!workingId) {
      setMessage({ type: 'error', text: 'الرجاء إدخال رقم العمل' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.STACKED(workingId),
        { year, month }
      );
      setReport(data);
      setMessage({ type: 'success', text: 'تم تحميل التقرير بنجاح' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'فشل تحميل التقرير' });
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const viewDailyDetails = () => {
    setShowModal(true);
  };

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="تقرير التوصيلات المكدسة"
        subtitle="عرض تفاصيل التوصيلات المكدسة للمناديب"
        icon={Package}
      />

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
            onChange={(e) => setWorkingId(e.target.value)}
            placeholder="أدخل رقم العمل"
            required
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
              disabled={loading || !workingId}
              loading={loading}
              className="w-full"
            >
              <Search size={18} />
              عرض التقرير
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
                <p className="text-gray-500 text-sm mb-2">إجمالي التكديس</p>
                <p className="text-3xl font-bold text-green-600">{report.totalStackedDeliveries}</p>
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
                  <p className="text-xs text-gray-500">{report.maxStackedDate}</p>
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
                <p className="text-2xl font-bold text-green-600">
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
                <p className="text-sm text-gray-500">معدل الكفاءة</p>
                <p className="text-2xl font-bold text-purple-600">
                  {report.totalStackedDeliveries > 0 && report.totalShifts > 0
                    ? ((report.totalStackedDeliveries / report.totalShifts) * 10).toFixed(1)
                    : 0}
                </p>
              </div>
            </div>
          </Card>

          {/* Daily Chart */}
          <Card title="التوزيع اليومي">
            <div className="flex items-end justify-between gap-2 h-64 p-4">
              {report.dailyBreakdown?.map((day, idx) => {
                const maxStacked = Math.max(...report.dailyBreakdown.map(d => d.stackedDeliveries));
                const height = maxStacked > 0 ? (day.stackedDeliveries / maxStacked) * 100 : 0;
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-700">{day.stackedDeliveries}</p>
                      {day.stackedPercentage > 0 && (
                        <p className="text-[10px] text-green-600">
                          {day.stackedPercentage.toFixed(0)}%
                        </p>
                      )}
                    </div>
                    <div 
                      className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${height}%`, minHeight: day.stackedDeliveries > 0 ? '10px' : '0' }}
                      title={`${day.date}: ${day.stackedDeliveries} توصيلة مكدسة من ${day.acceptedOrders}`}
                    />
                    <p className="text-[10px] text-gray-500 writing-mode-vertical transform rotate-0">
                      {new Date(day.date).getDate()}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-4">
              <Button
                variant="outline"
                onClick={viewDailyDetails}
                className="text-sm"
              >
                عرض التفاصيل اليومية
              </Button>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="📊 أفضل 5 أيام">
              <div className="space-y-2">
                {report.dailyBreakdown
                  ?.sort((a, b) => b.stackedDeliveries - a.stackedDeliveries)
                  .slice(0, 5)
                  .map((day, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{day.date}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-green-600">
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
                  <span className="font-bold text-green-600">
                    {report.dailyBreakdown
                      ? (report.dailyBreakdown.reduce((sum, d) => sum + d.stackedPercentage, 0) / report.dailyBreakdown.length).toFixed(1)
                      : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">أيام بدون تكديس</span>
                  <span className="font-bold text-red-600">
                    {report.dailyBreakdown?.filter(d => d.stackedDeliveries === 0).length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">أيام بتكديس عالي (+10)</span>
                  <span className="font-bold text-purple-600">
                    {report.dailyBreakdown?.filter(d => d.stackedDeliveries >= 10).length || 0}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="🎯 التقييم">
              <div className="space-y-3">
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">مستوى الكفاءة</p>
                  <p className="text-3xl font-bold text-green-600">
                    {report.averageStackedPerShift >= 8 ? 'ممتاز' :
                     report.averageStackedPerShift >= 5 ? 'جيد جداً' :
                     report.averageStackedPerShift >= 3 ? 'جيد' :
                     'يحتاج تحسين'}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  {report.averageStackedPerShift >= 8 && (
                    <p className="text-green-600">✓ أداء استثنائي في التكديس</p>
                  )}
                  {report.maxStackedInDay >= 15 && (
                    <p className="text-purple-600">✓ قدرة عالية على التعامل مع الضغط</p>
                  )}
                  {report.totalStackedDeliveries >= 100 && (
                    <p className="text-blue-600">✓ حجم عمل كبير</p>
                  )}
                  {report.averageStackedPerShift < 3 && (
                    <p className="text-orange-600">⚠ يمكن تحسين معدل التكديس</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Daily Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="التفاصيل اليومية"
        size="lg"
      >
        {report && report.dailyBreakdown && (
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">التاريخ</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">التوصيلات المكدسة</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">الطلبات المقبولة</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">نسبة التكديس</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.dailyBreakdown.map((day, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap font-medium">{day.date}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="text-green-600 font-bold">{day.stackedDeliveries}</span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{day.acceptedOrders}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          day.stackedPercentage >= 40 ? 'bg-green-100 text-green-800' :
                          day.stackedPercentage >= 20 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {day.stackedPercentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}