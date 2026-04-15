'use client';

import { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, CheckCircle, RefreshCw, Car, XCircle } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://fastexpress.tryasp.net";

export default function PetrolUnattributedPage() {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUnattributed = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('auth_token');
      const apiPath = API_ENDPOINTS.PETROL.UNATTRIBUTED(year, month);
      const url = `${API_BASE}${apiPath}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setRows(Array.isArray(data) ? data : []);
      } else {
        const err = await response.json().catch(() => null);
        setMessage(err?.detail || 'فشل في جلب السجلات غير المخصصة.');
      }
    } catch (error) {
      setMessage('خطأ في الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnattributed();
  }, [year, month]);

  const handleAttributeId = async (id) => {
    setActionLoadingId(id);
    try {
      const token = localStorage.getItem('auth_token');
      const apiPath = API_ENDPOINTS.PETROL.ATTRIBUTE_ID(id);
      const url = `${API_BASE}${apiPath}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        // Remove from list or refresh
        setRows(prev => prev.filter(r => r.id !== id && r.Id !== id));
      } else {
        alert(data?.detail || data?.message || 'فشلت عملية التخصيص للسجل المعين.');
      }
    } catch (error) {
      alert('خطأ في الانصال بالخادم.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="السجلات غير المخصصة"
        subtitle="سجلات البنزين التي لم يتمكن النظام من ربطها بسائق والتي تتطلب مراجعة أو تخصيص"
        icon={AlertTriangle}
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Calendar className="text-gray-500" size={20} />
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="flex items-center w-full md:w-auto mt-2 md:mt-0">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {months.map(m => (
                <option key={m} value={m}>شهر {m}</option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchUnattributed}
            disabled={loading}
            className="md:mr-auto px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2 transition-all w-full md:w-auto"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            تحديث القائمة
          </button>
        </div>

        {message && (
          <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-lg flex items-center gap-3">
            <XCircle size={20} />
            <span>{message}</span>
          </div>
        )}

        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3 shadow-sm">
          <AlertTriangle className="text-red-500 mt-0.5" />
          <div>
            <p className="text-red-800 font-bold mb-1">ملاحظة بشأن السجلات غير المخصصة</p>
            <p className="text-red-900 text-sm leading-relaxed">
              هذه السجلات تخص مركبات تم تعبئتها بالبنزين، ولكن النظام لم يجد أي سائق نشط أو مربوط بتلك المركبات في ذلك اليوم بناءً على سجلات الشفتات.
              قم بتصحيح بيانات الشفتات أو تحديث المركبة المستلمة للسائق ثم انقر على "محاولة ربط مجدداً".
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-red-100">
          <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle size={20} />
              سجلات تتطلب تدخل ({rows.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">التاريخ</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">المركبة</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">التكلفة (ريال)</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.length > 0 ? (
                    rows.map((row, index) => {
                      const recordId = row.id || row.Id;
                      const isProcessing = actionLoadingId === recordId;
                      return (
                        <tr key={recordId || index} className="hover:bg-red-50/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">
                            {row.date ? row.date.split('T')[0] : row.Date?.split('T')[0] || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-bold text-red-700 bg-red-100 px-3 py-1 rounded border border-red-200 flex items-center gap-2 w-max">
                              <Car size={16} />
                              {row.plateNumberE || row.vehicle || row.Vehicle || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-bold text-gray-800">{row.costAmount || row.CostAmount || row.cost || row.Cost || 0}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleAttributeId(recordId)}
                              disabled={isProcessing}
                              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-red-600 hover:text-white font-bold rounded-lg transition-colors border border-gray-200 hover:border-red-600 disabled:opacity-50 inline-flex items-center gap-2"
                            >
                              {isProcessing ? (
                                <RefreshCw className="animate-spin text-gray-500" size={18} />
                              ) : (
                                <CheckCircle size={18} />
                              )}
                              محاولة ربط مجدداً
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-16 text-center text-gray-500">
                        <AlertTriangle size={48} className="mx-auto mb-4 text-gray-300" />
                        الوضع ممتاز! لا توجد سجلات غير مخصصة في هذا الشهر.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
