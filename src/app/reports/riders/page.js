'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, ArrowLeft } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Alert from '@/components/Ui/Alert';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';

export default function RidersReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasSearched, setHasSearched] = useState(false);

  // Direct navigation fields
  const [quickWorkingId, setQuickWorkingId] = useState('');
  const [quickIqamaNo, setQuickIqamaNo] = useState('');

  // Filter fields
  const [filterWorkingId, setFilterWorkingId] = useState('');
  const [filterIqamaNo, setFilterIqamaNo] = useState('');

  const loadReports = async () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: 'الرجاء تحديد تاريخ البداية والنهاية' });
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setMessage({ type: '', text: '' });
    setReports([]);
    
    try {
      const data = await ApiService.get(
        API_ENDPOINTS.REPORTS.CUSTOM_PERIOD_ALL,
        { startDate, endDate }
      );
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setMessage({ 
          type: 'warning', 
          text: 'لا توجد تقارير للفترة المحددة' 
        });
        setReports([]);
      } else {
        const reportsArray = Array.isArray(data) ? data : [data];
        setReports(reportsArray);
        setMessage({ 
          type: 'success', 
          text: `تم تحميل ${reportsArray.length} تقرير` 
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

  const goDirectToRider = () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: 'الرجاء تحديد تاريخ البداية والنهاية أولاً' });
      return;
    }

    if (!quickWorkingId && !quickIqamaNo) {
      setMessage({ type: 'error', text: 'الرجاء إدخال رقم العمل أو رقم الإقامة' });
      return;
    }

    // If workingId is provided, use it directly
    if (quickWorkingId) {
      router.push(`/reports/riders/${quickWorkingId}?startDate=${startDate}&endDate=${endDate}`);
    } 
    // If only iqamaNo is provided, we need to search for the workingId first
    else if (quickIqamaNo) {
      // First load all reports to find the matching rider
      setLoading(true);
      ApiService.get(API_ENDPOINTS.REPORTS.CUSTOM_PERIOD_ALL, { startDate, endDate })
        .then(data => {
          const reportsArray = Array.isArray(data) ? data : [data];
          const matchingRider = reportsArray.find(r => 
            r.iqamaNo && String(r.iqamaNo) === String(quickIqamaNo)
          );
          
          if (matchingRider) {
            router.push(`/reports/riders/${matchingRider.workingId}?startDate=${startDate}&endDate=${endDate}`);
          } else {
            setMessage({ type: 'error', text: 'لم يتم العثور على مندوب بهذا الرقم' });
          }
        })
        .catch(error => {
          setMessage({ type: 'error', text: 'فشل في البحث عن المندوب' });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const viewDetails = (report) => {
    router.push(`/reports/riders/${report.workingId}?startDate=${startDate}&endDate=${endDate}`);
  };

  const exportToCSV = () => {
    const filteredReports = getFilteredReports();
    const csvContent = [
      ['رقم العمل', 'رقم الإقامة', 'اسم المندوب', 'أيام العمل', 'الطلبات المقبولة', 'الطلبات المرفوضة', 'معدل الأداء'],
      ...filteredReports.map(r => [
        r.workingId,
        r.IqamaNo || '',
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

  // Real-time filtering function
  const getFilteredReports = () => {
    if (!filterWorkingId && !filterIqamaNo) {
      return reports;
    }

    return reports.filter(report => {
      const matchesWorkingId = !filterWorkingId || 
        String(report.workingId).toLowerCase().includes(filterWorkingId.toLowerCase());
      
      const matchesIqamaNo = !filterIqamaNo || 
        (report.iqamaNo && String(report.iqamaNo).toLowerCase().includes(filterIqamaNo.toLowerCase()));

      return matchesWorkingId && matchesIqamaNo;
    });
  };

  const filteredReports = getFilteredReports();

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

      {/* Date Range Filters */}
      <div className="m-6 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-700">اختيار الفترة الزمنية</h3>
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

      {/* Quick Navigation Section */}
      <div className="m-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-md p-6 border-2 border-purple-200">
        <h3 className="text-lg font-bold mb-4 text-purple-700 flex items-center gap-2">
          <ArrowLeft size={20} />
          الانتقال السريع لمندوب محدد
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="text"
            label="رقم العمل"
            placeholder="أدخل رقم العمل"
            value={quickWorkingId}
            onChange={(e) => setQuickWorkingId(e.target.value)}
          />

          <Input
            type="text"
            label="رقم الإقامة"
            placeholder="أدخل رقم الإقامة"
            value={quickIqamaNo}
            onChange={(e) => setQuickIqamaNo(e.target.value)}
          />

          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={goDirectToRider}
              disabled={loading || !startDate || !endDate || (!quickWorkingId && !quickIqamaNo)}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <ArrowLeft size={18} />
              الانتقال للتفاصيل
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          * يمكنك إدخال رقم العمل أو رقم الإقامة للانتقال مباشرة لتقرير المندوب
        </p>
      </div>

      {/* Real-time Filter Section */}
      {reports.length > 0 && (
        <div className="m-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl shadow-md p-6 border-2 border-green-200">
          <h3 className="text-lg font-bold mb-4 text-green-700 flex items-center gap-2">
            <Search size={20} />
            تصفية المناديب
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              label="تصفية برقم العمل"
              placeholder="ابحث برقم العمل..."
              value={filterWorkingId}
              onChange={(e) => setFilterWorkingId(e.target.value)}
            />

            <Input
              type="text"
              label="تصفية برقم الإقامة"
              placeholder="ابحث برقم الإقامة..."
              value={filterIqamaNo}
              onChange={(e) => setFilterIqamaNo(e.target.value)}
            />
          </div>
          {(filterWorkingId || filterIqamaNo) && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                النتائج: {filteredReports.length} من {reports.length}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setFilterWorkingId('');
                  setFilterIqamaNo('');
                }}
                className="text-sm"
              >
                مسح التصفية
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      {filteredReports.length > 0 && (
        <div className="m-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">إجمالي المناديب</p>
              <p className="text-3xl font-bold text-blue-600">{filteredReports.length}</p>
              {filteredReports.length !== reports.length && (
                <p className="text-xs text-gray-400 mt-1">من أصل {reports.length}</p>
              )}
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">إجمالي الطلبات</p>
              <p className="text-3xl font-bold text-green-600">
                {filteredReports.reduce((sum, r) => sum + r.totalAcceptedOrders, 0)}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">متوسط الأداء</p>
              <p className="text-3xl font-bold text-purple-600">
                {(filteredReports.reduce((sum, r) => sum + r.overallPerformanceScore, 0) / filteredReports.length).toFixed(1)}%
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Reports Table */}
      <div className="m-6 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white">
            تقارير المناديب ({filteredReports.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              {reports.length === 0 ? (
                startDate && endDate 
                  ? 'لا توجد تقارير لهذه الفترة' 
                  : 'الرجاء تحديد فترة زمنية للبحث'
              ) : (
                'لا توجد نتائج مطابقة للبحث'
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم العمل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الإقامة</th>
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
                {filteredReports.map((report, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{report.workingId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {report.iqamaNo || '-'}
                    </td>
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
    </div>
  );
}