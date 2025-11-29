'use client';

import { useState } from 'react';
import { Calendar, Search, FileText, BarChart3 } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Modal from '@/components/Ui/Model';

export default function YearlyReportsPage() {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [workingId, setWorkingId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // أضف هذا

  const loadAllRiders = async () => {
  setLoading(true);
  setHasSearched(true);
  setMessage({ type: '', text: '' });
  setReports([]);
  
  try {
    const data = await ApiService.get(
      API_ENDPOINTS.REPORTS.YEARLY_ALL,
      { year }
    );
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      setMessage({ 
        type: 'warning', 
        text: `لا توجد تقارير سنوية للعام ${year}` 
      });
      setReports([]);
    } else {
      const reportsArray = Array.isArray(data) ? data : [data];
      setReports(reportsArray);
      setMessage({ 
        type: 'success', 
        text: `تم تحميل ${reportsArray.length} تقرير سنوي` 
      });
    }
  } catch (error) {
    console.error('Error:', error);
    setReports([]);
    setMessage({ 
      type: 'error', 
      text: error.message || 'فشل في تحميل التقارير' 
    });
  } finally {
    setLoading(false);
  }
};

  const loadSingleRider = async () => {
  if (!workingId) {
    setMessage({ type: 'error', text: 'الرجاء إدخال رقم العمل' });
    return;
  }

  setLoading(true);
  setHasSearched(true);
  setMessage({ type: '', text: '' });
  setReports([]);
  
  try {
    const data = await ApiService.get(
      API_ENDPOINTS.REPORTS.YEARLY(workingId),
      { year }
    );
    
    if (!data) {
      setMessage({ 
        type: 'warning', 
        text: `لا توجد بيانات للمندوب #${workingId} في العام ${year}` 
      });
      setReports([]);
    } else {
      setReports([data]);
      setMessage({ type: 'success', text: 'تم تحميل التقرير بنجاح' });
    }
  } catch (error) {
    console.error('Error:', error);
    setReports([]);
    setMessage({ 
      type: 'error', 
      text: error.message || `فشل في تحميل تقرير المندوب #${workingId}` 
    });
  } finally {
    setLoading(false);
  }
};
  const viewDetails = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="التقارير السنوية"
        subtitle="عرض تقارير المناديب السنوية"
        icon={Calendar}
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
            label="السنة"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            min="2020"
            max="2030"
          />

          <Input
            type="number"
            label="رقم العمل (اختياري)"
            value={workingId}
            onChange={(e) => setWorkingId(e.target.value)}
            placeholder="للبحث عن مندوب محدد"
          />

          <div className="flex items-end">
            <Button
              variant="blue"
              onClick={loadAllRiders}
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              <FileText size={18} />
              جميع المناديب
            </Button>
          </div>

          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={loadSingleRider}
              disabled={loading || !workingId}
              loading={loading}
              className="w-full"
            >
              <Search size={18} />
              بحث
            </Button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="m-6 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white">
            التقارير السنوية - {year} ({reports.length} تقرير)
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              لا توجد تقارير لعرضها
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
                        report.averagePerformanceScore >= 90 ? 'bg-green-100 text-green-800' :
                        report.averagePerformanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.averagePerformanceScore.toFixed(1)}%
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
        title="تفاصيل التقرير السنوي"
        size="xl"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">اسم المندوب</p>
                <p className="text-lg font-bold">{selectedReport.riderName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">رقم العمل</p>
                <p className="text-lg font-bold">{selectedReport.workingId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">السنة</p>
                <p className="text-lg font-bold">{selectedReport.year}</p>
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

            {/* Monthly Breakdowns */}
            {selectedReport.monthlyBreakdowns && selectedReport.monthlyBreakdowns.length > 0 && (
              <div>
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <BarChart3 size={20} />
                  التوزيع الشهري
                </h4>
                <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                  {selectedReport.monthlyBreakdowns.map((monthly, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-blue-600">{monthNames[monthly.month - 1]}</span>
                        <span className="text-sm font-bold">{monthly.performanceScore.toFixed(1)}%</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">أيام العمل:</span>
                          <span className="font-medium">{monthly.workingDays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">طلبات مقبولة:</span>
                          <span className="font-medium text-green-600">{monthly.totalAcceptedOrders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">طلبات مرفوضة:</span>
                          <span className="font-medium text-red-600">{monthly.totalRejectedOrders}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Company Breakdowns */}
            {selectedReport.yearlyCompanyBreakdowns && selectedReport.yearlyCompanyBreakdowns.length > 0 && (
              <div>
                <h4 className="font-bold mb-3">توزيع الشركات</h4>
                <div className="space-y-2">
                  {selectedReport.yearlyCompanyBreakdowns.map((company, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{company.companyName}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">أيام: {company.totalWorkingDays}</span>
                        <span className="text-sm text-green-600">طلبات: {company.totalAcceptedOrders}</span>
                        <span className="text-sm font-bold">{company.averagePerformanceScore.toFixed(1)}%</span>
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