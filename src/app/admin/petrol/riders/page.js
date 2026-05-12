'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, FileText, Activity, AlertCircle, RefreshCw, Car, Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import PageHeader from '@/components/layout/pageheader';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiService } from '@/lib/api/apiService';

export default function PetrolRidersPage() {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const exportToExcel = () => {
    const dataToExport = filteredRiders.map(r => ({
      'الرقم المدني (الإقامة)': r.riderIqamaNo,
      'اسم السائق': r.riderNameAR || r.riderNameEN || 'غير معروف',
      'مجموع التكلفة (ريال)': r.totalCost || 0,
      'عدد المركبات المستخدمة': r.uniqueVehiclesUsed || 0,
      'عدد المرات': r.totalDaysWithCost || 0,
      'إجمالي الطلبات': r.totalAcceptedOrders || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Petrol Riders Summary");
    XLSX.writeFile(workbook, `Petrol_Riders_Summary_${year}_${month}.xlsx`);
  };

  const fetchRiders = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const data = await ApiService.get(API_ENDPOINTS.PETROL.RIDERS_SUMMARY(year, month));
      setRiders(data || []);
    } catch (error) {
      setMessage(error.message || 'خطأ في الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, [year, month]);

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const filteredRiders = riders.filter(r => {
    const q = search.toLowerCase();
    return (
      (r.riderIqamaNo || '').toString().includes(q) ||
      (r.riderNameAR || '').toLowerCase().includes(q) ||
      (r.riderNameEN || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="ملخص بنزين السائقين"
        subtitle="تقرير شامل لتكاليف البنزين لكل سائق خلال الشهر المحدد"
        icon={User}
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
            onClick={fetchRiders}
            disabled={loading}
            className="md:mr-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-medium flex items-center justify-center gap-2 transition-all w-full md:w-auto"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            تحديث
          </button>

          <button
            onClick={exportToExcel}
            disabled={loading || filteredRiders.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2 transition-all w-full md:w-auto"
          >
            <Download size={18} />
            استخراج Excel
          </button>
        </div>

        {message && (
          <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{message}</span>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3">
          <Search className="text-gray-400 shrink-0" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث برقم الإقامة أو اسم السائق..."
            className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-gray-400 hover:text-gray-600 transition-colors text-xs shrink-0"
            >
              ✕ مسح
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText />
              السائقين الذين استهلكوا البنزين ({filteredRiders.length}{search ? ` من ${riders.length}` : ''})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الرقم المدني (الإقامة)</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">اسم السائق</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">مجموع التكلفة (ريال)</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">عدد المركبات المستخدمة</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">عدد المرات</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الإجراءات</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">إجمالي الطلبات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRiders.length > 0 ? (
                    filteredRiders.map((row, index) => (
                      <tr key={row.riderIqamaNo || index} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                            {row.riderIqamaNo}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 border-r-4 border-transparent hover:border-blue-500">
                          {row.riderNameAR || row.riderNameEN || 'غير معروف'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-bold text-blue-700">{row.totalCost?.toFixed(2) || 0}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <Car size={16} />
                            {row.uniqueVehiclesUsed || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <Activity size={16} />
                            {row.totalDaysWithCost || 0} مرة
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/admin/petrol/riders/${row.riderIqamaNo}?year=${year}&month=${month}`}
                            className="bg-blue-50 text-blue-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors border border-blue-200"
                          >
                            عرض التفاصيل
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                              {row.totalAcceptedOrders ?? 0}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        لا توجد بيانات بنزين للسائقين في هذا الشهر.
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
