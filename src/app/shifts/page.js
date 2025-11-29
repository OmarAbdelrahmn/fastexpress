'use client';

import { useState, useEffect } from 'react';
import { Calendar, Upload, FileSpreadsheet, Trash2, Search, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";

export default function ShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_BASE = 'https://fastexpress.tryasp.net/api';

  // Load shifts for selected date
  const loadShifts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/shift/date?shiftDate=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      const data = await response.json();
      setShifts(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل تحميل الورديات' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) loadShifts();
  }, [selectedDate]);

  // Import shifts from Excel
  const handleImport = async () => {
    if (!uploadFile) {
      setMessage({ type: 'error', text: 'الرجاء اختيار ملف Excel' });
      return;
    }

    const formData = new FormData();
    formData.append('excelFile', uploadFile);

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/shift/import?ShiftDate=${selectedDate}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `تم استيراد ${result.successCount} وردية بنجاح. أخطاء: ${result.errorCount}` 
        });
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
      const response = await fetch(`${API_BASE}/shift/date?shiftDate=${selectedDate}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'تم حذف الورديات بنجاح' });
        loadShifts();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل حذف الورديات' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 " dir="rtl">
      {/* Header */}
        <PageHeader
      title="إدارة الورديات"
      subtitle="استيراد وإدارة ورديات المناديب"
      icon={Calendar}
    />
      {/* Message Alert */}
      {message.text && (
      <div className={`m-6 p-4 rounded-lg flex items-center gap-3 ${
        message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
        'bg-red-50 text-red-800 border border-red-200'
      }`}>
        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span>{message.text}</span>
        <button onClick={() => setMessage({ type: '', text: '' })} className="mr-auto">✕</button>
      </div>
    )}

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
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
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              استيراد
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ساعات العمل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shifts.map((shift, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{shift.workingId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{shift.riderName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{shift.companyName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                      {shift.acceptedDailyOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
                      {shift.rejectedDailyOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{shift.workingHours.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        shift.shiftStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                        shift.shiftStatus === 'Incomplete' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {shift.shiftStatus}
                      </span>
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