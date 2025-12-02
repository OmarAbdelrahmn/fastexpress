'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, User, Calendar, TrendingUp, AlertTriangle, Award, Clock, Package } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Card from '@/components/Ui/Card';

export default function RiderDetailPage({ params }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const workingId = unwrappedParams.workingId;
  
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    console.log('Component mounted with:', { workingId, startDate, endDate });
    if (workingId && startDate && endDate) {
      loadRiderReport();
    } else {
      setLoading(false);
      setMessage({ 
        type: 'error', 
        text: 'معلومات غير كاملة. الرجاء التأكد من رقم العمل والتواريخ.' 
      });
    }
  }, [workingId, startDate, endDate]);

  const loadRiderReport = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      console.log('Fetching reports with dates:', startDate, endDate);
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.CUSTOM_PERIOD_ALL,
        { startDate, endDate }
      );
      
      console.log('API Response:', data);
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setMessage({ 
          type: 'error', 
          text: 'لم يتم العثور على تقارير' 
        });
        setReport(null);
      } else {
        const reportsArray = Array.isArray(data) ? data : [data];
        // console.log('Looking for workingId:', workingId);
        // console.log('Available reports:', reportsArray.map(r => r.workingId));
        // console.log("workingId from URL:", workingId, typeof workingId);
        // console.log("workingId from reports:", reportsArray.map(r => [r.workingId, typeof r.workingId]));
        const riderReport = reportsArray.find(r => String(r.workingId) === String(workingId));
        
        if (!riderReport) {
          setMessage({ 
            type: 'error', 
            text: 'لم يتم العثور على تقرير لهذا المندوب' 
          });
          setReport(null);
        } else {
          console.log('Found report:', riderReport);
          setReport(riderReport);
        }
      }
    } catch (error) {
      console.error('Error loading report:', error);
      setReport(null);
      setMessage({ 
        type: 'error', 
        text: error.message || 'فشل في تحميل التقرير' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
        <div className="m-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowRight size={18} />
            رجوع
          </Button>
          {message.text && (
            <Alert
              type={message.type}
              message={message.text}
              onClose={() => setMessage({ type: '', text: '' })}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title={`تقرير المندوب: ${report.riderName}`}
        subtitle={`رقم العمل: ${report.workingId} | من ${report.startDate} إلى ${report.endDate}`}
        icon={User}
      />

      <div className="m-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowRight size={18} />
          رجوع
        </Button>

        {message.text && (
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage({ type: '', text: '' })}
            className="mb-4"
          />
        )}

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">أيام العمل</p>
                <p className="text-2xl font-bold text-blue-600">{report.totalWorkingDays}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-green-600">{report.totalAcceptedOrders}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">معدل الأداء</p>
                <p className="text-2xl font-bold text-purple-600">{report.overallPerformanceScore.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Shifts Statistics */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="text-blue-600" />
            إحصائيات الورديات
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">ورديات مكتملة</p>
              <p className="text-3xl font-bold text-green-600">{report.completedShifts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ورديات غير مكتملة</p>
              <p className="text-3xl font-bold text-yellow-600">{report.incompleteShifts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ورديات فاشلة</p>
              <p className="text-3xl font-bold text-red-600">{report.failedShifts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ورديات مشكلة</p>
              <p className="text-3xl font-bold text-orange-600">{report.problematicShiftsCount}</p>
            </div>
          </div>
        </div>

        {/* Orders Statistics */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Package className="text-green-600" />
            إحصائيات الطلبات
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">الطلبات المقبولة</p>
              <p className="text-3xl font-bold text-green-600">{report.totalAcceptedOrders}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">الطلبات المرفوضة</p>
              <p className="text-3xl font-bold text-red-600">{report.totalRejectedOrders}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">الرفض الحقيقي</p>
              <p className="text-3xl font-bold text-orange-600">{report.totalRealRejectedOrders}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ساعات العمل</p>
              <p className="text-3xl font-bold text-blue-600">{report.totalWorkingHours.toFixed(1)}</p>
            </div>
          </div>
        </div>

        {/* Working ID History */}
        {report.workingIdHistory && report.workingIdHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-600" />
              سجل أرقام العمل ({report.workingIdHistory.length})
            </h3>
            <div className="space-y-3">
              {report.workingIdHistory.map((period, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-blue-700">رقم العمل: {period.workingId}</p>
                      <p className="text-sm text-gray-600">من {period.startDate} إلى {period.endDate}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500">عدد الورديات</p>
                    <p className="text-2xl font-bold text-blue-600">{period.shiftCount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Company Breakdowns */}
        {report.companyBreakdowns && report.companyBreakdowns.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">
              توزيع الشركات ({report.companyBreakdowns.length})
            </h3>
            <div className="space-y-4">
              {report.companyBreakdowns.map((company, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow">
                  {/* Company Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        {company.companyName.substring(0, 1)}
                      </div>
                      <div>
                        <h4 className="font-bold text-xl">{company.companyName}</h4>
                        <p className="text-sm text-gray-500">الهدف اليومي: {company.dailyOrderTarget} طلب</p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-lg font-bold ${
                      company.performanceScore >= 90 ? 'bg-green-100 text-green-800' :
                      company.performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {company.performanceScore.toFixed(1)}%
                    </span>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">أيام العمل</p>
                      <p className="text-xl font-bold text-blue-600">{company.workingDays}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">الطلبات المتوقعة</p>
                      <p className="text-xl font-bold text-purple-600">{company.expectedOrders}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">الطلبات المقبولة</p>
                      <p className="text-xl font-bold text-green-600">{company.totalAcceptedOrders}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">الطلبات المرفوضة</p>
                      <p className="text-xl font-bold text-red-600">{company.totalRejectedOrders}</p>
                    </div>
                  </div>

                  {/* Detailed Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-gray-500">الرفض الحقيقي</p>
                      <p className="font-bold text-orange-600">{company.totalRealRejectedOrders}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ساعات العمل</p>
                      <p className="font-bold text-blue-600">{company.totalWorkingHours.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ورديات مشكلة</p>
                      <p className="font-bold text-red-600">{company.problematicShiftsCount}</p>
                    </div>
                  </div>

                  {/* Shift Status */}
                  <div className="grid grid-cols-3 gap-3 mb-3 pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">ورديات مكتملة</p>
                      <p className="text-lg font-bold text-green-600">{company.completedShifts}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">ورديات غير مكتملة</p>
                      <p className="text-lg font-bold text-yellow-600">{company.incompleteShifts}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">ورديات فاشلة</p>
                      <p className="text-lg font-bold text-red-600">{company.failedShifts}</p>
                    </div>
                  </div>

                  {/* Stacked Deliveries */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">إجمالي التوصيلات المتراكمة</p>
                        <p className="text-xl font-bold text-indigo-600">{company.totalStackedDeliveries}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">متوسط التوصيلات لكل وردية</p>
                        <p className="text-xl font-bold text-blue-600">{company.averageStackedPerShift.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problematic Shifts */}
        {report.problematicShifts && report.problematicShifts.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
              <AlertTriangle />
              الورديات المشكلة ({report.problematicShifts.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {report.problematicShifts.map((shift, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{shift.shiftDate}</p>
                      <p className="text-sm text-gray-600">{shift.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">مقبول</p>
                      <p className="font-bold text-green-600">{shift.acceptedOrders}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">مرفوض</p>
                      <p className="font-bold text-red-600">{shift.rejectedOrders}</p>
                    </div>
                    {shift.penalty > 0 && (
                      <div className="bg-red-600 text-white px-3 py-1 rounded-full">
                        <p className="font-bold">{shift.penalty.toFixed(2)} ر.س</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}