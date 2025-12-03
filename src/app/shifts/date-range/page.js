'use client';

import { useState } from 'react';
import { Calendar, Search, Download, Trash2, TrendingUp, Award, AlertCircle, FileText } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
const API_BASE = 'https://fastexpress.tryasp.net/api';

export default function ShiftRangeViewerPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [workingId, setWorkingId] = useState('');
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState(null);

  const loadShifts = async () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: 'الرجاء اختيار تاريخ البداية والنهاية' });
      return;
    }

    setLoading(true);
    try {
      const endpoint = workingId 
        ? `${API_BASE}/shift/rider/${workingId}` 
        : `${API_BASE}/shift/range?startDate=${startDate}&endDate=${endDate}`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });

      const data = await response.json();

      if (response.ok) {
        const shiftsData = Array.isArray(data) ? data : [];
        
        // Filter by date range if querying specific rider
        const filteredShifts = workingId 
          ? shiftsData.filter(s => s.shiftDate >= startDate && s.shiftDate <= endDate)
          : shiftsData;

        setShifts(filteredShifts);
        calculateStats(filteredShifts);
        setMessage({ type: '', text: '' });
      } else {
        setMessage({ type: 'error', text: 'فشل تحميل الورديات' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال' });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (shiftsData) => {
    if (!shiftsData.length) {
      setStats(null);
      return;
    }

    const totalShifts = shiftsData.length;
    const totalAccepted = shiftsData.reduce((sum, s) => sum + s.acceptedDailyOrders, 0);
    const totalRejected = shiftsData.reduce((sum, s) => sum + s.rejectedDailyOrders, 0);
    const totalStacked = shiftsData.reduce((sum, s) => sum + (s.stackedDeliveries || 0), 0);
    const totalHours = shiftsData.reduce((sum, s) => sum + s.workingHours, 0);
    const totalPenalty = shiftsData.reduce((sum, s) => sum + (s.penaltyAmount || 0), 0);

    const statusCounts = {
      completed: shiftsData.filter(s => s.shiftStatus === 'Completed').length,
      incomplete: shiftsData.filter(s => s.shiftStatus === 'Incomplete').length,
      average: shiftsData.filter(s => s.shiftStatus === 'Average').length,
      failed: shiftsData.filter(s => s.shiftStatus === 'Failed').length
    };

    const companyCounts = {};
    shiftsData.forEach(s => {
      if (!companyCounts[s.companyName]) {
        companyCounts[s.companyName] = { count: 0, accepted: 0 };
      }
      companyCounts[s.companyName].count++;
      companyCounts[s.companyName].accepted += s.acceptedDailyOrders;
    });

    setStats({
      totalShifts,
      totalAccepted,
      totalRejected,
      totalStacked,
      totalHours: totalHours.toFixed(1),
      avgAccepted: (totalAccepted / totalShifts).toFixed(1),
      avgHours: (totalHours / totalShifts).toFixed(1),
      totalPenalty: totalPenalty.toFixed(2),
      statusCounts,
      companyCounts
    });
  };

  const handleDelete = async () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: 'الرجاء اختيار التاريخ' });
      return;
    }

    const confirmMsg = workingId 
      ? `حذف ورديات المندوب ${workingId} من ${startDate} إلى ${endDate}`
      : `حذف جميع الورديات من ${startDate} إلى ${endDate}`;

    if (!confirm(`هل أنت متأكد من ${confirmMsg}؟`)) return;

    setLoading(true);
    try {
      const endpoint = workingId
        ? `${API_BASE}/shift/rider/${workingId}/range?startDate=${startDate}&endDate=${endDate}`
        : `${API_BASE}/shift/range?startDate=${startDate}&endDate=${endDate}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `تم حذف ${result.totalDeleted} وردية بنجاح` 
        });
        loadShifts();
      } else {
        setMessage({ type: 'error', text: 'فشل الحذف' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الحذف' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Incomplete': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Average': 'bg-blue-100 text-blue-800 border-blue-200',
      'Failed': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">

      <PageHeader
              title="عرض الورديات حسب الفترة"
              subtitle="استعراض وتحليل الورديات لفترة زمنية محددة"
              icon={Calendar}
            />

      <div className="p-6 space-y-6">
        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-lg flex items-center gap-3 shadow-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? <Award size={20} /> : <AlertCircle size={20} />}
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })}>✕</button>
          </div>
        )}

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">معايير البحث</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ البداية</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ النهاية</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم العمل (اختياري)</label>
              <input
                type="number"
                value={workingId}
                onChange={(e) => setWorkingId(e.target.value)}
                placeholder="جميع المناديب"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={loadShifts}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
              >
                <Search size={18} />
                بحث
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || !shifts.length}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">الإحصائيات</h3>
            
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border-r-4 border-blue-500 p-5 rounded-lg shadow-md">
                <p className="text-sm text-blue-600 mb-1">إجمالي الورديات</p>
                <p className="text-3xl font-bold text-blue-700">{stats.totalShifts}</p>
              </div>
              <div className="bg-white border-r-4 border-green-500 p-5 rounded-lg shadow-md">
                <p className="text-sm text-green-600 mb-1">إجمالي الطلبات المقبولة</p>
                <p className="text-3xl font-bold text-green-700">{stats.totalAccepted}</p>
                <p className="text-xs text-green-600 mt-1">متوسط: {stats.avgAccepted}</p>
              </div>
              <div className="bg-white border-r-4 border-red-500 p-5 rounded-lg shadow-md">
                <p className="text-sm text-red-600 mb-1">إجمالي الطلبات المرفوضة</p>
                <p className="text-3xl font-bold text-red-700">{stats.totalRejected}</p>
              </div>
              <div className="bg-white border-r-4 border-purple-500 p-5 rounded-lg shadow-md">
                <p className="text-sm text-purple-600 mb-1">ساعات العمل</p>
                <p className="text-3xl font-bold text-purple-700">{stats.totalHours}</p>
                <p className="text-xs text-purple-600 mt-1">متوسط: {stats.avgHours}</p>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="font-bold text-gray-800 mb-4">توزيع الحالات</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-700">{stats.statusCounts.completed}</p>
                  <p className="text-sm text-green-600">مكتمل</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-2xl font-bold text-yellow-700">{stats.statusCounts.incomplete}</p>
                  <p className="text-sm text-yellow-600">غير مكتمل</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-700">{stats.statusCounts.average}</p>
                  <p className="text-sm text-blue-600">متوسط</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-2xl font-bold text-red-700">{stats.statusCounts.failed}</p>
                  <p className="text-sm text-red-600">فاشل</p>
                </div>
              </div>
            </div>

            {/* Company Distribution */}
            {Object.keys(stats.companyCounts).length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="font-bold text-gray-800 mb-4">توزيع الشركات</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(stats.companyCounts).map(([company, data]) => (
                    <div key={company} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="font-bold text-gray-800 mb-2">{company}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">الورديات:</span>
                        <span className="font-medium">{data.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">الطلبات:</span>
                        <span className="font-medium text-green-600">{data.accepted}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Penalties */}
            {parseFloat(stats.totalPenalty) > 0 && (
              <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-600" size={24} />
                  <div>
                    <p className="font-bold text-red-800">إجمالي الغرامات</p>
                    <p className="text-2xl font-bold text-red-600">{stats.totalPenalty} ر.س</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shifts Table */}
        {shifts.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                الورديات ({shifts.length})
              </h3>
              <span className="text-blue-100 text-sm">
                {startDate} إلى {endDate}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم العمل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المندوب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الشركة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المقبولة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المرفوضة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المكدسة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الساعات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shifts.map((shift, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(shift.shiftDate).toLocaleDateString('en-US')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                        {shift.workingId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{shift.riderName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{shift.companyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                        {shift.acceptedDailyOrders}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-red-600 font-semibold">{shift.rejectedDailyOrders}</div>
                        {shift.realRejectedDailyOrders > 0 && (
                          <div className="text-xs text-red-500">حقيقي: {shift.realRejectedDailyOrders}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-purple-600">
                        {shift.stackedDeliveries || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{shift.workingHours.toFixed(1)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(shift.shiftStatus)}`}>
                          {shift.shiftStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && shifts.length === 0 && (startDate || endDate) && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد ورديات</h3>
            <p className="text-gray-500">لا توجد ورديات للفترة المحددة</p>
          </div>
        )}
      </div>
    </div>
  );
}