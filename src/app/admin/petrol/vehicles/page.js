'use client';

import { useState, useEffect } from 'react';
import { Calendar, FileText, Activity, AlertCircle, RefreshCw, Car, Users, HelpCircle, Search } from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/layout/pageheader';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ApiService } from '@/lib/api/apiService';

export default function PetrolVehiclesPage() {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const data = await ApiService.get(API_ENDPOINTS.PETROL.VEHICLES_SUMMARY(year, month));
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message || 'خطأ في الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [year, month]);

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const filteredVehicles = vehicles.filter(v =>
    (v.plateNumberE || v.plateNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="ملخص بنزين المركبات"
        subtitle="المتابعة الشاملة لتكلفة البنزين ومعدل الاستخدام لكل مركبة"
        icon={Car}
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
            onClick={fetchVehicles}
            disabled={loading}
            className="md:mr-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-medium flex items-center justify-center gap-2 transition-all w-full md:w-auto"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
            تحديث
          </button>
        </div>

        {message && (
          <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{message}</span>
          </div>
        )}

        {/* Info Note */}
        <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg shadow-sm flex items-start gap-3">
           <AlertCircle className="text-blue-500 mt-1" />
           <p className="text-blue-800 text-sm font-medium leading-relaxed">
             إجمالي التكلفة المعروض هنا يعكس التكلفة الأصلية الكلية للمركبة. 
             (مجموع كافة حصص السائقين الموزعة سيساوي دائماً هذا الإجمالي). استخدم هذه الشاشة للحصول على التكلفة الحقيقية للمركبة.
           </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-3">
          <Search className="text-gray-400 shrink-0" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث برقم اللوحة..."
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
              المركبات التي استهلكت البنزين ({filteredVehicles.length}{search ? ` من ${vehicles.length}` : ''})
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
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">رقم اللوحة</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">التكلفة الإجمالية الحقيقية</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">مرات الاستخدام الموزعة (أيام)</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">السائقين المستفيدين</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">سجلات غير مخصصة (تحتاج مراجعة)</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((row, idx) => (
                      <tr key={row.vehicleNumber || idx} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800">
                           {row.plateNumberE || row.plateNumber || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-bold text-green-700">{row.totalCost?.toFixed(2) || 0} ريال</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <Activity size={16} />
                            {row.totalDaysWithCost || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-lg w-max">
                            <Users size={16} />
                            {row.uniqueRidersCount || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {row.unattributedDays > 0 ? (
                            <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full border border-red-200 inline-flex gap-1 items-center">
                              <HelpCircle size={14} />
                              {row.unattributedDays} سجلات
                            </span>
                          ) : (
                            <span className="text-gray-400 font-medium">0</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/admin/petrol/vehicles/${row.vehicleNumber}?year=${year}&month=${month}`}
                            className="bg-blue-50 text-blue-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors border border-blue-200"
                          >
                            عرض التفاصيل
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <Car size={48} className="mx-auto mb-4 text-gray-300" />
                        لا توجد بيانات بنزين للمركبات في هذا الشهر.
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
