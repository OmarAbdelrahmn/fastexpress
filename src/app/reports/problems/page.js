'use client';

import { useState } from 'react';
import { AlertTriangle, Search, FileText } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';

export default function ProblemsReportPage() {
  const [loading, setLoading] = useState(false);
  const [problems, setProblems] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadProblems = async () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: 'الرجاء تحديد تاريخ البداية والنهاية' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.PROBLEM,
        { startDate, endDate }
      );
      setProblems(Array.isArray(data) ? data : []);
      setMessage({ 
        type: 'success', 
        text: `تم تحميل ${data.length} وردية ذات مشاكل` 
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'فشل تحميل التقرير' });
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  const getTotalPenalty = () => {
    return problems.reduce((sum, p) => sum + p.penaltyAmount, 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Incomplete': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="تقارير المشاكل"
        subtitle="عرض الورديات ذات المشاكل والأداء السيء"
        icon={AlertTriangle}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="date"
            label="من تاريخ"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <Input
            type="date"
            label="إلى تاريخ"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />

          <div className="flex items-end">
            <Button
              variant="danger"
              onClick={loadProblems}
              disabled={loading || !startDate || !endDate}
              loading={loading}
              className="w-full"
            >
              <Search size={18} />
              عرض المشاكل
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {problems.length > 0 && (
        <div className="m-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">إجمالي المشاكل</p>
              <p className="text-3xl font-bold text-red-600">{problems.length}</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">ورديات فاشلة</p>
              <p className="text-3xl font-bold text-red-600">
                {problems.filter(p => p.status === 'Failed').length}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">ورديات غير مكتملة</p>
              <p className="text-3xl font-bold text-yellow-600">
                {problems.filter(p => p.status === 'Incomplete').length}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">إجمالي الغرامات</p>
              <p className="text-3xl font-bold text-orange-600">
                {getTotalPenalty().toFixed(2)} ر.س
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Problems Table */}
      <div className="m-6 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-red-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle size={20} />
            الورديات ذات المشاكل ({problems.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              {startDate && endDate 
                ? 'لا توجد مشاكل في هذه الفترة' 
                : 'الرجاء تحديد فترة زمنية للبحث'}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم العمل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المندوب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الشركة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">طلبات مقبولة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">طلبات مرفوضة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الغرامة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">وصف المشكلة</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {problems.map((problem, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {problem.shiftDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {problem.workingId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {problem.riderName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {problem.companyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                      {problem.acceptedOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-red-600 font-semibold">
                          {problem.rejectedOrders}
                        </p>
                        <p className="text-xs text-red-500">
                          حقيقي: {problem.realRejectedOrders}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        getStatusColor(problem.status)
                      }`}>
                        {problem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-orange-600 font-bold">
                        {problem.penaltyAmount.toFixed(2)} ر.س
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-red-600">
                          {problem.problemDescription}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Statistics by Rider */}
      {problems.length > 0 && (
        <div className="m-6">
          <Card title="المناديب الأكثر مشاكل">
            <div className="space-y-2">
              {Object.entries(
                problems.reduce((acc, p) => {
                  const key = `${p.workingId}-${p.riderName}`;
                  if (!acc[key]) {
                    acc[key] = { 
                      workingId: p.workingId, 
                      name: p.riderName, 
                      count: 0, 
                      penalty: 0 
                    };
                  }
                  acc[key].count++;
                  acc[key].penalty += p.penaltyAmount;
                  return acc;
                }, {})
              )
                .map(([key, data]) => data)
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
                .map((rider, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                      <div>
                        <p className="font-medium">{rider.name}</p>
                        <p className="text-sm text-gray-500">رقم العمل: {rider.workingId}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-bold text-red-600">{rider.count} مشكلة</p>
                      <p className="text-sm text-orange-600">غرامة: {rider.penalty.toFixed(2)} ر.س</p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}