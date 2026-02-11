'use client';

import { useState } from 'react';
import { Calendar, Search, Trash2, Award, AlertCircle, FileText } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function ShiftRangeViewerPage() {
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [workingId, setWorkingId] = useState('');
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState(null);

  const loadShifts = async () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: t('shifts.selectStartEndDate') });
      return;
    }

    setLoading(true);
    try {
      let data;

      if (workingId) {
        // Get shifts for specific rider
        data = await ApiService.get(API_ENDPOINTS.SHIFT.BY_RIDER(workingId));

        // Filter by date range client-side
        data = Array.isArray(data)
          ? data.filter(s => s.shiftDate >= startDate && s.shiftDate <= endDate)
          : [];
      } else {
        // Get shifts for date range
        data = await ApiService.get(API_ENDPOINTS.SHIFT.DATE_RANGE, {
          startDate: startDate,
          endDate: endDate
        });

        data = Array.isArray(data) ? data : [];
      }

      setShifts(data);
      calculateStats(data);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || t('shifts.connectionError') });
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
      setMessage({ type: 'error', text: t('shifts.selectStartEndDate') });
      return;
    }

    const confirmMsg = workingId
      ? `${t('common.confirm')} ${t('common.delete')} ${workingId} ${startDate} ${t('shifts.to')} ${endDate}?`
      : `${t('common.confirm')} ${t('common.delete')} ${startDate} ${t('shifts.to')} ${endDate}?`;

    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      let result;

      if (workingId) {
        result = await ApiService.delete(
          API_ENDPOINTS.SHIFT.DELETE_RIDER_DATE_RANGE(workingId),
          {
            startDate: startDate,
            endDate: endDate
          }
        );
      } else {
        result = await ApiService.delete(API_ENDPOINTS.SHIFT.DELETE_DATE_RANGE, {
          startDate: startDate,
          endDate: endDate
        });
      }

      setMessage({
        type: 'success',
        text: `${t('shifts.deletedSuccessfully')}: ${result.totalDeleted}`
      });
      loadShifts();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || t('shifts.errorDuringDelete') });
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
        title={t('shifts.viewShiftsByPeriod')}
        subtitle={t('shifts.viewShiftsByPeriodSubtitle')}
        icon={Calendar}
      />

      <div className="p-6 space-y-6">
        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-lg flex items-center gap-3 shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            {message.type === 'success' ? <Award size={20} /> : <AlertCircle size={20} />}
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })}>✕</button>
          </div>
        )}

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t('shifts.searchCriteria')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('shifts.startDate')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('shifts.endDate')}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('shifts.workingIdOptional')}</label>
              <input
                type="text"
                value={workingId}
                onChange={(e) => setWorkingId(e.target.value)}
                placeholder={t('shifts.allRiders')}
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
                {t('shifts.search')}
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
            <h3 className="text-xl font-bold text-gray-800">{t('shifts.statistics')}</h3>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border-r-4 border-blue-500 p-5 rounded-lg shadow-md">
                <p className="text-sm text-blue-600 mb-1">{t('shifts.totalShifts')}</p>
                <p className="text-3xl font-bold text-blue-700">{stats.totalShifts}</p>
              </div>
              <div className="bg-white border-r-4 border-green-500 p-5 rounded-lg shadow-md">
                <p className="text-sm text-green-600 mb-1">{t('shifts.totalAcceptedOrders')}</p>
                <p className="text-3xl font-bold text-green-700">{stats.totalAccepted}</p>
                <p className="text-xs text-green-600 mt-1">{t('shifts.averageLabel')} {stats.avgAccepted}</p>
              </div>
              <div className="bg-white border-r-4 border-red-500 p-5 rounded-lg shadow-md">
                <p className="text-sm text-red-600 mb-1">{t('shifts.totalRejectedOrders')}</p>
                <p className="text-3xl font-bold text-red-700">{stats.totalRejected}</p>
              </div>
              <div className="bg-white border-r-4 border-purple-500 p-5 rounded-lg shadow-md">
                <p className="text-sm text-purple-600 mb-1">{t('shifts.workingHours')}</p>
                <p className="text-3xl font-bold text-purple-700">{stats.totalHours}</p>
                <p className="text-xs text-purple-600 mt-1">{t('shifts.averageLabel')} {stats.avgHours}</p>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="font-bold text-gray-800 mb-4">{t('shifts.statusDistribution')}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-700">{stats.statusCounts.completed}</p>
                  <p className="text-sm text-green-600">{t('shifts.completed')}</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-2xl font-bold text-yellow-700">{stats.statusCounts.incomplete}</p>
                  <p className="text-sm text-yellow-600">{t('shifts.incomplete')}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-700">{stats.statusCounts.average}</p>
                  <p className="text-sm text-blue-600">{t('shifts.averageStatus')}</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-2xl font-bold text-red-700">{stats.statusCounts.failed}</p>
                  <p className="text-sm text-red-600">{t('shifts.failed')}</p>
                </div>
              </div>
            </div>

            {/* Company Distribution */}
            {Object.keys(stats.companyCounts).length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="font-bold text-gray-800 mb-4">{t('shifts.companyDistribution')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(stats.companyCounts).map(([company, data]) => (
                    <div key={company} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="font-bold text-gray-800 mb-2">{company}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('shifts.shiftsLabel')}</span>
                        <span className="font-medium">{data.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('shifts.ordersLabel')}</span>
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
                    <p className="font-bold text-red-800">{t('shifts.totalPenalties')}</p>
                    <p className="text-2xl font-bold text-red-600">{stats.totalPenalty} SAR</p>
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
                {t('shifts.title')} ({shifts.length})
              </h3>
              <span className="text-blue-100 text-sm">
                {startDate} {t('shifts.to')} {endDate}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.date')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('riders.workingId')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.rider')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.company')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.acceptedOrders')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.rejectedOrders')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.stackedDeliveries')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('shifts.workingHours')}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('common.status')}</th>
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
                          <div className="text-xs text-red-500">{t('shifts.actual')}: {shift.realRejectedDailyOrders}</div>
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
            <h3 className="text-xl font-bold text-gray-600 mb-2">{t('shifts.noShifts')}</h3>
            <p className="text-gray-500">{t('shifts.noShiftsForPeriod')}</p>
          </div>
        )}
      </div>
    </div>
  );
}