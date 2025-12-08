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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [importResult, setImportResult] = useState(null);
  const [showImportDetails, setShowImportDetails] = useState(false);

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
    if (!uploadFile) {
      setMessage({ type: 'error', text: 'الرجاء اختيار ملف Excel' });
      return;
    }

    const formData = new FormData();
    formData.append('excelFile', uploadFile);

    setLoading(true);
    setImportResult(null);
    
      try {
      const token = TokenManager.getToken();
      const response = await fetch(`${API_BASE}/shift/import?ShiftDate=${selectedDate}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        setImportResult(result);
        setShowImportDetails(true);
        
        if (result.conflictCount > 0) {
          setMessage({ 
            type: 'warning', 
            text: `تم استيراد ${result.successCount} وردية بنجاح. يوجد ${result.conflictCount} تعارض يتطلب المراجعة.` 
          });
        } else {
          setMessage({ 
            type: 'success', 
            text: `تم استيراد ${result.successCount} وردية بنجاح من أصل ${result.totalRecords} سجل.` 
          });
        }
        
        setUploadFile(null);
        loadShifts();
      } else {
        setMessage({ type: 'error', text: result.title || 'فشل الاستيراد' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الاستيراد' });
    } finally {
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
      setMessage({ 
        type: 'success', 
        text: `تم حذف ${result.totalDeleted} وردية بنجاح` 
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
            <span className="flex-1">{message.text}</span>
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
                  <p className="text-3xl font-bold text-blue-700">{importResult.totalRecords}</p>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-green-600 text-sm mb-1">تم الاستيراد بنجاح</p>
                  <p className="text-3xl font-bold text-green-700">{importResult.successCount}</p>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-red-600 text-sm mb-1">الأخطاء</p>
                  <p className="text-3xl font-bold text-red-700">{importResult.errorCount}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-yellow-600 text-sm mb-1">التعارضات</p>
                  <p className="text-3xl font-bold text-yellow-700">{importResult.conflictCount}</p>
                </div>
              </div>

              {/* Errors List */}
              {importResult.errors && importResult.errors.length > 0 && (
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
                            <td className="px-4 py-2 text-sm text-red-600 font-medium">{error.rowNumber}</td>
                            <td className="px-4 py-2 text-sm text-red-700">{error.workingId}</td>
                            <td className="px-4 py-2 text-sm text-red-800">{error.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Conflicts List */}
              {importResult.conflicts && importResult.conflicts.length > 0 && (
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
                              <div className="font-medium text-yellow-800">{conflict.riderName}</div>
                              <div className="text-xs text-yellow-600">{conflict.companyName}</div>
                            </td>
                            <td className="px-4 py-2 text-sm text-yellow-700">
                              {new Date(conflict.shiftDate).toLocaleDateString('ar-SA')}
                            </td>
                            <td className="px-4 py-2 text-xs">
                              <div className="text-yellow-700">طلبات: {conflict.existingShift.acceptedOrders}</div>
                              <div className="text-yellow-600">رفض: {conflict.existingShift.rejectedOrders}</div>
                            </td>
                            <td className="px-4 py-2 text-xs">
                              <div className="text-yellow-700">طلبات: {conflict.newShift.acceptedOrders}</div>
                              <div className="text-yellow-600">رفض: {conflict.newShift.rejectedOrders}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">{shift.workingId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{shift.riderName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{shift.companyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                        {shift.acceptedDailyOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-red-600 font-semibold">{shift.rejectedDailyOrders}</div>
                        {shift.realRejectedDailyOrders > 0 && (
                          <div className="text-xs text-red-500">حقيقي: {shift.realRejectedDailyOrders}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-purple-600">{shift.stackedDeliveries}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{shift.workingHours.toFixed(1)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(shift.shiftStatus)}`}>
                          {shift.shiftStatus}
                        </span>
                        {shift.hasRejectionProblem && (
                          <div className="text-xs text-red-600 mt-1">غرامة: {shift.penaltyAmount} ر.س</div>
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