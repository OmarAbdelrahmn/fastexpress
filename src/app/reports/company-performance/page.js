'use client';

import { useState, useEffect } from 'react';
import { Building2, Search, TrendingUp, Users ,AlertCircle  } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';
import ExportButtons from '@/components/Ui/ExportButtons';

export default function CompanyPerformancePage() {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasSearched, setHasSearched] = useState(false); // أضف هذا

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await ApiService.get(API_ENDPOINTS.COMPANY.LIST);
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

const loadReport = async () => {
  if (!selectedCompany || !startDate || !endDate) {
    setMessage({ type: 'error', text: 'الرجاء تحديد جميع الحقول' });
    return;
  }
  
  setLoading(true);
  setHasSearched(true);
  setMessage({ type: '', text: '' });
  setReport(null);
  
  
  try {
    const data = await ApiService.get(
      API_ENDPOINTS.REPORTS.COMPANY_PERFORMANCE,
      { companyName: selectedCompany, startDate, endDate }
    );
    
    if (!data) {
      setMessage({ 
        type: 'warning', 
        text: `لا توجد بيانات للشركة ${selectedCompany} في الفترة المحددة` 
      });
      setReport(null);
    } else {
      setReport(data);
      setMessage({ type: 'success', text: 'تم تحميل التقرير بنجاح' });
    }
  } catch (error) {
    console.error('Error:', error);
    setReport(null);
    setMessage({ 
      type: 'error', 
      text: error.message || 'فشل في تحميل التقرير' 
    });
  } finally {
    setLoading(false);
  }
};
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="أداء الشركة"
        subtitle="تحليل أداء الشركات خلال فترة محددة"
        icon={Building2}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الشركة</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر شركة</option>
              {companies.map((company, idx) => (
                <option key={idx} value={company.name}>{company.name}</option>
              ))}
            </select>
          </div>

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
              onClick={loadReport}
              disabled={loading || !selectedCompany || !startDate || !endDate}
              loading={loading}
              className="w-full"
            >
              <Search size={18} />
              عرض التقرير
            </Button>
          </div>
        </div>
      </div>
      {!loading && !report && hasSearched && (
      <div className="m-6 bg-white rounded-xl shadow-md p-12">
        <div className="text-center space-y-4">
          <AlertCircle size={64} className="mx-auto text-orange-400" />
          <div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              لا توجد بيانات
            </h3>
            <p className="text-gray-500 mb-4">
              لم يتم العثور على تقرير للشركة {selectedCompany}
            </p>
            <p className="text-sm text-gray-400">
              تأكد من وجود ورديات مسجلة للشركة في الفترة من {startDate} إلى {endDate}
            </p>
          </div>
          </div>
        </div>
      )}
      {/* Report Display */}
      {report && (
        
        <div className="m-6 space-y-6">
          <div className="m-6 flex justify-end">
    <ExportButtons
    />
  </div>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">الهدف اليومي</p>
                <p className="text-3xl font-bold text-blue-600">{report.dailyOrderTarget}</p>
                <p className="text-xs text-gray-500 mt-1">طلب/يوم</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">الطلبات المتوقعة</p>
                <p className="text-3xl font-bold text-purple-600">{report.expectedOrders}</p>
                <p className="text-xs text-gray-500 mt-1">خلال الفترة</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">الطلبات المقبولة</p>
                <p className="text-3xl font-bold text-green-600">{report.totalAcceptedOrders}</p>
                <p className="text-xs text-gray-500 mt-1">طلب منفذ</p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">معدل الأداء</p>
                <p className={`text-3xl font-bold ${
                  report.overallPerformanceScore >= 90 ? 'text-green-600' :
                  report.overallPerformanceScore >= 70 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {report.overallPerformanceScore.toFixed(1)}%
                </p>
              </div>
            </Card>
          </div>

          {/* Performance Details */}
          <Card title="تفاصيل الأداء">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500">أيام العمل</p>
                <p className="text-2xl font-bold">{report.totalWorkingDays}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ورديات مكتملة</p>
                <p className="text-2xl font-bold text-green-600">{report.completedShifts}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ورديات غير مكتملة</p>
                <p className="text-2xl font-bold text-yellow-600">{report.incompleteShifts}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ورديات فاشلة</p>
                <p className="text-2xl font-bold text-red-600">{report.failedShifts}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">الطلبات المرفوضة</p>
                <p className="text-2xl font-bold text-red-600">{report.totalRejectedOrders}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">نسبة الإنجاز</p>
                <p className="text-2xl font-bold">
                  {((report.totalAcceptedOrders / report.expectedOrders) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">معدل الرفض</p>
                <p className="text-2xl font-bold text-orange-600">
                  {((report.totalRejectedOrders / (report.totalAcceptedOrders + report.totalRejectedOrders)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          {/* Rider Performances */}
          <Card title={`أداء المناديب (${report.riderPerformances?.length || 0} مندوب)`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم العمل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المندوب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الورديات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مكتمل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطلبات المقبولة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطلبات المرفوضة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">معدل الأداء</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.riderPerformances?.map((rider, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{rider.workingId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{rider.riderName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{rider.totalShifts}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600">{rider.completedShifts}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                        {rider.totalAcceptedOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
                        {rider.totalRejectedOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          rider.performanceScore >= 90 ? 'bg-green-100 text-green-800' :
                          rider.performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rider.performanceScore.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
      
    </div>
  );
}