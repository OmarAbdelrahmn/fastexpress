'use client';

import { useState } from 'react';
import { Users, Search, Filter } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';
import Modal from '@/components/Ui/Model';

export default function RidersReportPage() {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadReports = async () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: 'الرجاء تحديد تاريخ البداية والنهاية' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.CUSTOM_PERIOD_ALL,
        { startDate, endDate }
      );
      setReports(Array.isArray(data) ? data : []);
      setMessage({ type: 'success', text: `تم تحميل ${data.length} تقرير` });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'فشل تحميل التقارير' });
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['رقم العمل', 'اسم المندوب', 'أيام العمل', 'الطلبات المقبولة', 'الطلبات المرفوضة', 'معدل الأداء'],
      ...reports.map(r => [
        r.workingId,
        r.riderName,
        r.totalWorkingDays,
        r.totalAcceptedOrders,
        r.totalRejectedOrders,
        r.overallPerformanceScore.toFixed(1)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `riders_report_${startDate}_${endDate}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="تقارير المناديب"
        subtitle="عرض تقارير جميع المناديب خلال فترة محددة"
        icon={Users}
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
              variant="primary"
              onClick={loadReports}
              disabled={loading || !startDate || !endDate}
              loading={loading}
              className="w-full"
            >
              <Search size={18} />
              عرض التقارير
            </Button>
          </div>

          {reports.length > 0 && (
            <div className="flex items-end">
              <Button
                variant="success"
                onClick={exportToCSV}
                className="w-full"
              >
                تصدير CSV
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {reports.length > 0 && (
        <div className="m-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">إجمالي المناديب</p>
              <p className="text-3xl font-bold text-blue-600">{reports.length}</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">إجمالي الطلبات</p>
              <p className="text-3xl font-bold text-green-600">
                {reports.reduce((sum, r) => sum + r.totalAcceptedOrders, 0)}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">متوسط الأداء</p>
              <p className="text-3xl font-bold text-purple-600">
                {(reports.reduce((sum, r) => sum + r.overallPerformanceScore, 0) / reports.length).toFixed(1)}%
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">إجمالي الغرامات</p>
              <p className="text-3xl font-bold text-red-600">
                {reports.reduce((sum, r) => sum + r.totalPenaltyAmount, 0).toFixed(2)} ر.س
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Reports Table */}
      <div className="m-6 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white">
            تقارير المناديب ({reports.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              {startDate && endDate 
                ? 'لا توجد تقارير لهذه الفترة' 
                : 'الرجاء تحديد فترة زمنية للبحث'}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم العمل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المندوب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">أيام العمل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطلبات المقبولة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطلبات المرفوضة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ساعات العمل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">معدل الأداء</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{report.workingId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.riderName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.totalWorkingDays}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                      {report.totalAcceptedOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
                      {report.totalRejectedOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{report.totalWorkingHours.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.overallPerformanceScore >= 90 ? 'bg-green-100 text-green-800' :
                        report.overallPerformanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.overallPerformanceScore.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        onClick={() => viewDetails(report)}
                        className="text-sm"
                      >
                        التفاصيل
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="تفاصيل تقرير المندوب"
        size="xl"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">اسم المندوب</p>
                <p className="text-lg font-bold">{selectedReport.riderName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">رقم العمل</p>
                <p className="text-lg font-bold">{selectedReport.workingId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">من تاريخ</p>
                <p className="text-lg font-bold">{selectedReport.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">إلى تاريخ</p>
                <p className="text-lg font-bold">{selectedReport.endDate}</p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-bold mb-3">إحصائيات الأداء</h4>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">أيام العمل</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedReport.totalWorkingDays}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ورديات مكتملة</p>
                  <p className="text-2xl font-bold text-green-600">{selectedReport.completedShifts}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ورديات غير مكتملة</p>
                  <p className="text-2xl font-bold text-yellow-600">{selectedReport.incompleteShifts}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ورديات فاشلة</p>
                  <p className="text-2xl font-bold text-red-600">{selectedReport.failedShifts}</p>
                </div>
              </div>
            </div>

            {/* Company Breakdowns */}
            {selectedReport.companyBreakdowns && selectedReport.companyBreakdowns.length > 0 && (
              <div>
                <h4 className="font-bold mb-3">توزيع الشركات</h4>
                <div className="space-y-2">
                  {selectedReport.companyBreakdowns.map((company, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{company.companyName}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">أيام: {company.workingDays}</span>
                        <span className="text-sm text-green-600">طلبات: {company.totalAcceptedOrders}</span>
                        <span className="text-sm font-bold">{company.performanceScore.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}