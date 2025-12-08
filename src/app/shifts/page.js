'use client';

import { useState, useEffect } from 'react';
import { Calendar, Upload, FileSpreadsheet, Trash2, Search, AlertCircle, CheckCircle, XCircle, FileText, Download, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { TokenManager } from '@/lib/auth/tokenManager';

const API_BASE = 'https://fastexpress.tryasp.net/api';

export default function ShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [importResult, setImportResult] = useState(null);
  const [showImportDetails, setShowImportDetails] = useState(false);

  // Helper function to safely format dates
  // add this helper near top of file (below imports)
const normalizeServerDate = (value) => {
  // null/undefined
  if (value === null || value === undefined || value === '') return null;

  // If server already returned a Date string
  if (typeof value === 'string') {
    // handle .NET default min value or other sentinel values
    if (value.startsWith('0001') || value.startsWith('0000')) return null;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // If server returned a Date-only object { year, month, day }
  if (typeof value === 'object') {
    // Some backends return DateOnly as { year, month, day } or { Year, Month, Day }
    const year = value.year ?? value.Year;
    const month = value.month ?? value.Month;
    const day = value.day ?? value.Day;

    if (!year || Number(year) <= 1) return null; // treat year 1 as empty
    try {
      // month in JS Date is 0-based
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }

  // unknown format
  return null;
};

// replace your formatDate with this (it accepts string/object/Date)
const formatDate = (d) =>
  new Date(d).toISOString().substring(0, 10);


  // const formatDate = (dateValue) => {
  //   if (!dateValue) return '';
  //   try {
  //     const date = new Date(dateValue);
  //     if (isNaN(date.getTime())) return '';
  //     return date.toLocaleDateString('ar-SA');
  //   } catch (error) {
  //     return '';
  //   }
  // };

  // Helper function to safely render values
  const safeRender = (value, fallback = '-') => {
    if (value === null || value === undefined || value === '') return fallback;
    if (typeof value === 'object') return fallback;
    return value;
  };

  useEffect(() => {
    if (!selectedDate) {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      setSelectedDate(dateStr);
    }
  }, []);

  const loadShifts = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get(API_ENDPOINTS.SHIFT.BY_DATE, {
        shiftDate: selectedDate
      });
      
      setShifts(Array.isArray(data) ? data : []);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل تحميل الورديات' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) loadShifts();
  }, [selectedDate]);

  const handleImport = async () => {
    try {
      console.log('=== IMPORT STARTED ===');
      console.log('Upload File:', uploadFile);
      console.log('Selected Date:', selectedDate);
      
      if (!uploadFile) {
        console.log('No file selected');
        setMessage({ type: 'error', text: 'الرجاء اختيار ملف Excel' });
        return;
      }

      // Validate date format
      if (!selectedDate || selectedDate === '') {
        console.log('Invalid date');
        setMessage({ type: 'error', text: 'الرجاء اختيار تاريخ صحيح' });
        return;
      }

      setLoading(true);
      setImportResult(null);
      setMessage({ type: '', text: '' });
      
      console.log('Creating FormData...');
      const formData = new FormData();
      formData.append('excelFile', uploadFile);

      const token = TokenManager.getToken();
      console.log('Token exists:', !!token);
      
      // Ensure date is in YYYY-MM-DD format
      const dateStr = String(selectedDate).split('T')[0];
      const url = `${API_BASE}/shift/import?ShiftDate=${dateStr}`;
      
      console.log('Request URL:', url);
      console.log('Date being sent:', dateStr);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);
      
      const result = await response.json();
      console.log('Response Result:', result);
      
      if (response.ok) {
        setImportResult(result);
        setShowImportDetails(true);
        
        const successCount = result.successCount || 0;
        const conflictCount = result.conflictCount || 0;
        const totalRecords = result.totalRecords || 0;
        
        if (conflictCount > 0) {
          setMessage({ 
            type: 'warning', 
            text: `تم استيراد ${successCount} وردية بنجاح. يوجد ${conflictCount} تعارض يتطلب المراجعة.` 
          });
        } else {
          setMessage({ 
            type: 'success', 
            text: `تم استيراد ${successCount} وردية بنجاح من أصل ${totalRecords} سجل.` 
          });
        }
        
        setUploadFile(null);
        await loadShifts();
      } else {
        console.error('Server Error:', result);
        const errorMsg = result.title || result.message || result.error || 'فشل الاستيراد';
        setMessage({ 
          type: 'error', 
          text: String(errorMsg)
        });
      }
    } catch (error) {
      console.error('Exception caught:', error);
      console.error('Error stack:', error.stack);
      setMessage({ 
        type: 'error', 
        text: `حدث خطأ أثناء الاستيراد: ${error.message || 'خطأ غير معروف'}` 
      });
    } finally {
      console.log('=== IMPORT FINISHED ===');
      setLoading(false);
    }
  };

  const handleDeleteDate = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع ورديات هذا التاريخ؟')) return;

    setLoading(true);
    try {
      const result = await ApiService.delete(API_ENDPOINTS.SHIFT.DELETE_BY_DATE, {
        shiftDate: selectedDate
      });
      const totalDeleted = result.totalDeleted || 0;
      setMessage({ 
        type: 'success', 
        text: `تم حذف ${totalDeleted} وردية بنجاح` 
      });
      loadShifts();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'فشل حذف الورديات' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Incomplete': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Average': 'bg-blue-100 text-blue-800 border-blue-200',
      'Failed': 'bg-red-100 text-red-800 border-red-200',
      'Absent': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="إدارة الورديات"
        subtitle="استيراد وإدارة ورديات المناديب"
        icon={Calendar}
      />

      <div className="p-6 space-y-6">
        {/* Message Alert */}
        {message.text && (
          <div className={`p-4 rounded-lg flex items-center gap-3 shadow-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
            message.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
            'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : 
             message.type === 'warning' ? <AlertCircle size={20} /> :
             <XCircle size={20} />}
            <span className="flex-1">{String(message.text)}</span>
            <button onClick={() => setMessage({ type: '', text: '' })} className="hover:opacity-70">✕</button>
          </div>
        )}

        {/* Import Result Details */}
        {importResult && showImportDetails && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText size={20} />
                نتائج الاستيراد التفصيلية
              </h3>
              <button
                onClick={() => setShowImportDetails(false)}
                className="text-white hover:bg-white/20 rounded p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-blue-600 text-sm mb-1">إجمالي السجلات</p>
                  <p className="text-3xl font-bold text-blue-700">{safeRender(importResult.totalRecords, 0)}</p>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-green-600 text-sm mb-1">تم الاستيراد بنجاح</p>
                  <p className="text-3xl font-bold text-green-700">{safeRender(importResult.successCount, 0)}</p>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-red-600 text-sm mb-1">الأخطاء</p>
                  <p className="text-3xl font-bold text-red-700">{safeRender(importResult.errorCount, 0)}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-yellow-600 text-sm mb-1">التعارضات</p>
                  <p className="text-3xl font-bold text-yellow-700">{safeRender(importResult.conflictCount, 0)}</p>
                </div>
              </div>

              {/* Errors List */}
              {importResult.errors && Array.isArray(importResult.errors) && importResult.errors.length > 0 && (
                <div className="border border-red-200 rounded-lg overflow-hidden">
                  <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                    <h4 className="font-bold text-red-800 flex items-center gap-2">
                      <XCircle size={18} />
                      الأخطاء ({importResult.errors.length})
                    </h4>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-red-100">
                      <thead className="bg-red-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-red-700">الصف</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-red-700">رقم العمل</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-red-700">الخطأ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100">
                        {importResult.errors.map((error, index) => (
                          <tr key={index} className="hover:bg-red-50">
                            <td className="px-4 py-2 text-sm text-red-600 font-medium">{safeRender(error.rowNumber)}</td>
                            <td className="px-4 py-2 text-sm text-red-700">{safeRender(error.workingId)}</td>
                            <td className="px-4 py-2 text-sm text-red-800">{safeRender(error.message)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Conflicts List */}
              {importResult.conflicts && Array.isArray(importResult.conflicts) && importResult.conflicts.length > 0 && (
                <div className="border border-yellow-200 rounded-lg overflow-hidden">
                  <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-200">
                    <h4 className="font-bold text-yellow-800 flex items-center gap-2">
                      <AlertCircle size={18} />
                      التعارضات ({importResult.conflicts.length})
                    </h4>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-yellow-100">
                      <thead className="bg-yellow-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-yellow-700">المندوب</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-yellow-700">التاريخ</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-yellow-700">البيانات الموجودة</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-yellow-700">البيانات الجديدة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-yellow-100">
                        {importResult.conflicts.map((conflict, index) => (
                          <tr key={index} className="hover:bg-yellow-50">
                            <td className="px-4 py-2 text-sm">
                              <div className="font-medium text-yellow-800">{safeRender(conflict.riderName)}</div>
                              <div className="text-xs text-yellow-600">{safeRender(conflict.companyName)}</div>
                            </td>
                            <td className="px-4 py-2 text-sm text-yellow-700">
                              {formatDate(conflict.shiftDate)}
                            </td>
                            <td className="px-4 py-2 text-xs">
                              <div className="text-yellow-700">طلبات: {safeRender(conflict.existingShift?.acceptedOrders, 0)}</div>
                              <div className="text-yellow-600">رفض: {safeRender(conflict.existingShift?.rejectedOrders, 0)}</div>
                            </td>
                            <td className="px-4 py-2 text-xs">
                              <div className="text-yellow-700">طلبات: {safeRender(conflict.newShift?.acceptedOrders, 0)}</div>
                              <div className="text-yellow-600">رفض: {safeRender(conflict.newShift?.rejectedOrders, 0)}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ملف Excel</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Actions */}
            <div className="flex items-end gap-2">
              <button
                onClick={handleImport}
                disabled={loading || !uploadFile}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
              >
                <Upload size={18} />
                استيراد
              </button>
              <button
                onClick={loadShifts}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={handleDeleteDate}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Shifts Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white">
              الورديات - {selectedDate} ({shifts.length} وردية)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : shifts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileSpreadsheet size={48} className="mx-auto mb-4 text-gray-300" />
                لا توجد ورديات لهذا التاريخ
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم العمل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المندوب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الشركة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطلبات المقبولة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطلبات المرفوضة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التوصيل المكدس</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ساعات العمل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shifts.map((shift, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">{safeRender(shift.workingId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{safeRender(shift.riderName)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{safeRender(shift.companyName)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                        {safeRender(shift.acceptedDailyOrders, 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-red-600 font-semibold">{safeRender(shift.rejectedDailyOrders, 0)}</div>
                        {shift.realRejectedDailyOrders > 0 && (
                          <div className="text-xs text-red-500">حقيقي: {safeRender(shift.realRejectedDailyOrders, 0)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-purple-600">{safeRender(shift.stackedDeliveries, 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {shift.workingHours ? Number(shift.workingHours).toFixed(1) : '0.0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(shift.shiftStatus)}`}>
                          {safeRender(shift.shiftStatus)}
                        </span>
                        {shift.hasRejectionProblem && (
                          <div className="text-xs text-red-600 mt-1">غرامة: {safeRender(shift.penaltyAmount, 0)} ر.س</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}