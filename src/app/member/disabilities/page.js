'use client';

import { useEffect, useState } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { useLanguage } from "@/lib/context/LanguageContext";
import {
    Users,
    Clock,
    XCircle,
    History,
    Search
} from "lucide-react";

export default function MemberDisabilitiesPage() {
    const { t, locale } = useLanguage();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ total: 0 });

    // Date filter state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            // Build query string
            let url = API_ENDPOINTS.MEMBER.DISABILITIES;
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }

            // Fetching from the disabilities endpoint
            const response = await ApiService.get(url);
            let data = Array.isArray(response) ? response : [];

            // Sort by acceptedDailyOrders ascending (less orders first) as requested
            data.sort((a, b) => (a.acceptedDailyOrders || 0) - (b.acceptedDailyOrders || 0));

            setRecords(data);
            setStats({ total: data.length });
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Initial load

    const handleFilter = (e) => {
        e.preventDefault();
        fetchData();
    };

    const formatDate = (dateString) => {
        if (!dateString) return t('common.notAvailable') || "غير متاح";
        return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">
            <div className="p-6 space-y-6">
                {/* Stats and Filter Container */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Stats Card */}
                    <div className="bg-white border-r-4 border-blue-500 p-5 rounded-lg shadow-md md:col-span-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 mb-1">
                                    {t('common.disabilities') || 'تقرير العجوزات هنقر'}
                                </p>
                                <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
                            </div>
                            <Users className="text-blue-500" size={40} />
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="bg-white p-5 rounded-lg shadow-md md:col-span-2 flex items-end gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('common.from') || 'من'}
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('common.to') || 'إلى'}
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={handleFilter}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors h-[42px] font-medium shadow-sm active:scale-95"
                        >
                            <Search size={18} />
                            {t('common.search') || 'بحث'}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 rounded-lg flex items-center gap-3 shadow-sm bg-red-50 text-red-800 border border-red-200">
                        <XCircle size={20} />
                        <span className="flex-1">{error}</span>
                    </div>
                )}

                {/* Records Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white">
                            {t('common.disabilities') || 'تقرير العجوزات هنقر'} ({records.length})
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
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                                            {t('substitution.originalRider') || 'السائق'}
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                                            {t('substitution.originalWorkingId') || 'رقم العمل'}
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                                            {t('companies.company') || 'الشركة'}
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                                            {t('substitution.substituteRider') || 'البديل'}
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                                            {t('common.orders') || 'الطلبات'}
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                                            {t('common.date') || 'التاريخ'}
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                                            {t('substitution.days') || 'الأيام'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {records.length > 0 ? (
                                        records.map((record) => (
                                            <tr key={record.id} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">
                                                        {record.actualRiderName || t('common.notAvailable') || 'غير متاح'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                        {record.actualWorkingId || record.actualRiderWorkingId}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-gray-700 font-medium">
                                                        {record.companyName || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {record.substituteRiderName ? (
                                                        <div>
                                                            <div className="font-medium text-gray-900">{record.substituteRiderName}</div>
                                                            {record.substituteWorkingId && (
                                                                <span className="text-xs text-gray-500">#{record.substituteWorkingId}</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${(record.acceptedDailyOrders || 0) < 10
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-green-100 text-green-700'
                                                            }`}>
                                                            {record.acceptedDailyOrders || 0}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} />
                                                        {formatDate(record.shiftDate || record.startDate)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <span className="font-medium">
                                                        {record.days || 0} {t('substitution.days') || 'يوم'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                <History size={48} className="mx-auto mb-4 text-gray-300" />
                                                {t('common.noData') || 'لا توجد بيانات'}
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
