'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { User, Calendar, Activity, AlertCircle, RefreshCw, Car, Receipt, History } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://fastexpress.tryasp.net";

export default function RiderPetrolDetailsPage() {
  const { iqamaNo } = useParams();
  const searchParams = useSearchParams();
  const initialYear = searchParams.get('year') || new Date().getFullYear();
  const initialMonth = searchParams.get('month') || new Date().getMonth() + 1;

  const [year, setYear] = useState(Number(initialYear));
  const [month, setMonth] = useState(Number(initialMonth));
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Explicit day logs from /date endpoint modal
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayDetails, setDayDetails] = useState([]);
  const [dayLoading, setDayLoading] = useState(false);

  const fetchMonthlyDetails = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('auth_token');
      // Helper in endpoints: RIDER_MONTHLY: (iqamaNo, year, month)
      const apiPath = API_ENDPOINTS.PETROL.RIDER_MONTHLY(iqamaNo, year, month);
      const url = `${API_BASE}${apiPath}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setDetails(data);
      } else {
        const err = await response.json().catch(() => null);
        setMessage(err?.detail || 'فشل في جلب تفاصيل السائق.');
      }
    } catch (error) {
      setMessage('خطأ في الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDayDetails = async (dateStr) => {
    setSelectedDate(dateStr);
    setDayLoading(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      // Helper: RIDER_DATE: (iqamaNo, date)
      const apiPath = API_ENDPOINTS.PETROL.RIDER_DATE(iqamaNo, dateStr);

      const url = `${API_BASE}${apiPath}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setDayDetails(Array.isArray(data) ? data : []);
      } else {
        setDayDetails([]);
      }
    } catch (error) {
      console.error(error);
      setDayDetails([]);
    } finally {
      setDayLoading(false);
    }
  };

  useEffect(() => {
    if (iqamaNo) {
      fetchMonthlyDetails();
    }
  }, [iqamaNo, year, month]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
      <PageHeader
        title="تفاصيل بنزين السائق"
        subtitle={`استعراض تفاصيل الاستهلاك للمندوب ${iqamaNo}`}
        icon={Receipt}
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex gap-4 items-center w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-500" size={20} />
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>شهر {m}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => window.history.back()}
            className="mt-4 md:mt-0 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-all w-full md:w-auto text-center"
          >
            العودة للقائمة
          </button>
        </div>

        {message && (
          <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{message}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : details ? (
          <>
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border-r-4 border-blue-500 p-6 rounded-xl shadow-md">
                <p className="text-sm text-gray-500 font-bold mb-1">إجمالي التكلفة للشهر</p>
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-extrabold text-blue-700">{details.totalCost?.toFixed(2) || 0}</span>
                  <span className="text-gray-500 font-bold">ريال</span>
                </div>
              </div>

              <div className="bg-white border-r-4 border-purple-500 p-6 rounded-xl shadow-md">
                <p className="text-sm text-gray-500 font-bold mb-1">المركبات المستخدمة</p>
                <div className="flex items-center gap-3">
                  <Car className="text-purple-500" size={32} />
                  <span className="text-3xl font-bold text-gray-800">{details.uniqueVehiclesUsed || details.vehicleEntries?.length || 0} مركبات</span>
                </div>
              </div>

              <div className="bg-white border-r-4 border-green-500 p-6 rounded-xl shadow-md">
                 <p className="text-sm text-gray-500 font-bold mb-1">إجمالي أيام التعبئة</p>
                 <div className="flex items-center gap-3">
                  <Activity className="text-green-500" size={32} />
                  <span className="text-3xl font-bold text-gray-800">
                    {details.totalDaysWithCost || 0} أيام
                  </span>
                 </div>
              </div>
            </div>

            {/* Vehicles breakdown */}
            <div className="space-y-6 mt-8">
              {details.vehicleEntries?.length > 0 ? (
                details.vehicleEntries.map((vehicle, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Car size={20} />
                        مركبة {vehicle.plateNumberE ? `(${vehicle.plateNumberE})` : ''}
                      </h3>
                    </div>

                    <div className="p-0 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">التاريخ</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">التكلفة المخصصة (ريال)</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">الإجراء</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {vehicle.dailyEntries?.map((entry, eIdx) => {
                            // Support strings or date objects that APIs might return for dates
                            const dateOnly = entry.date ? entry.date.split('T')[0] : '';
                            return (
                              <tr key={eIdx} className="hover:bg-blue-50/50">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">
                                  {dateOnly}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                                    {entry.costShare?.toFixed(2) || entry.cost || 0} ريال
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <button
                                    onClick={() => fetchDayDetails(dateOnly)}
                                    className="text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1"
                                  >
                                    <History size={16} /> استعراض تفاصيل اليوم وملاحظات التوزيع
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-12 text-center rounded-xl shadow-md text-gray-500 font-bold text-lg">
                  لا توجد سجلات تعبئة بنزين لهذا السائق في الشهر المحدد.
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {/* Date Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Calendar size={24} />
                سجلات التعبئة ليوم ({selectedDate})
              </h3>
              <button 
                onClick={() => setSelectedDate(null)}
                className="text-white hover:text-red-200 bg-blue-700 hover:bg-blue-800 p-2 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              {dayLoading ? (
                <div className="flex justify-center py-12">
                  <RefreshCw className="animate-spin text-blue-600" size={32} />
                </div>
              ) : dayDetails.length > 0 ? (
                <div className="space-y-4">
                  {dayDetails.map((dayItem, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm">
                       <div className="flex justify-between items-start mb-3">
                         <div>
                           <p className="text-sm text-gray-500 font-semibold mb-1">مصدر التخصيص</p>
                           <span className="font-bold text-gray-800 bg-white px-2 py-1 rounded border shadow-sm">
                             {dayItem.attributionSource || 'مخصص من النظام'}
                           </span>
                         </div>
                         <div className="text-left">
                            <p className="text-sm text-gray-500 font-semibold mb-1">حصة التكلفة</p>
                            <span className="text-xl font-extrabold text-blue-700">{dayItem.costShare?.toFixed(2) || dayItem.cost} ريال</span>
                         </div>
                       </div>
                       
                       <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-2">
                         <AlertCircle className="text-blue-500 mt-0.5" size={18} />
                         <div>
                            <p className="text-sm text-blue-800 font-bold mb-1">طبيعة التوزيع والنظام</p>
                            <p className="text-sm text-blue-900 leading-relaxed font-medium">
                              {dayItem.notes || 'لا توجد ملاحظات إضافية حول التوزيع. التكلفة تم اعتمادها للمندوب مباشرة.'}
                            </p>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 font-bold">
                  لم يتم العثور على تفاصيل إضافية لهذا اليوم.
                </div>
              )}
            </div>
            
            <div className="bg-gray-100 px-6 py-4 text-left">
               <button 
                 onClick={() => setSelectedDate(null)}
                 className="px-6 py-2 bg-white text-gray-700 font-bold rounded-lg border border-gray-300 hover:bg-gray-50 shadow-sm"
               >
                 إغلاق النافذة
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
