'use client';

import { useEffect, useState } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { useLanguage } from "@/lib/context/LanguageContext";
import {
    Users,
    Clock,
    CheckCircle,
    XCircle,
    History,
    ArrowRightLeft
} from "lucide-react";

export default function MemberSubstitutionsPage() {
    const { t, locale } = useLanguage();
    const [substitutions, setSubstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ active: 0, total: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await ApiService.get(API_ENDPOINTS.MEMBER.SUBSTITUTIONS_ACTIVE);
                const data = Array.isArray(response) ? response : [];
                setSubstitutions(data);

                // Calculate stats
                const active = data.filter(s => s.isActive).length;
                setStats({ active, total: data.length });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return t('common.notAvailable') || "غير متاح";
        return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date();
        const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
        return days;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" dir="rtl">


            <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border-r-4 border-blue-500 p-5 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 mb-1">
                                    {t('substitution.totalSubstitutes') || 'إجمالي الاستبدالات'}
                                </p>
                                <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
                            </div>
                            <Users className="text-blue-500" size={40} />
                        </div>
                    </div>
                    <div className="bg-white border-r-4 border-green-500 p-5 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 mb-1">
                                    {t('substitution.active') || 'النشط'}
                                </p>
                                <p className="text-3xl font-bold text-green-700">{stats.active}</p>
                            </div>
                            <CheckCircle className="text-green-500" size={40} />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 rounded-lg flex items-center gap-3 shadow-sm bg-red-50 text-red-800 border border-red-200">
                        <XCircle size={20} />
                        <span className="flex-1">{error}</span>
                    </div>
                )}

                {/* Substitutions Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-blue-600 px-6 py-4">
                        <h3 className="text-lg font-bold text-white">
                            {t('substitution.substitutes') || 'الاستبدالات'} ({substitutions.length})
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
                                            {t('substitution.originalRider') || 'السائق الأصلي'}
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                                            {t('substitution.originalWorkingId') || 'رقم العمل الأصلي'}
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                                            {t('substitution.substituteRider') || 'السائق البديل'}
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                                            {t('substitution.substituteWorkingId') || 'رقم العمل البديل'}
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                                            {t('common.reason') || 'السبب'}
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                                            {t('substitution.startDate') || 'تاريخ البداية'}
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                                            {t('substitution.duration') || 'المدة'}
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">
                                            {t('common.status') || 'الحالة'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {substitutions.length > 0 ? (
                                        substitutions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">
                                                        {sub.actualRiderName || t('common.notAvailable') || 'غير متاح'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                        {sub.actualRiderWorkingId}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{sub.substituteRiderName}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
                                                        {sub.substituteWorkingId}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="max-w-xs truncate text-gray-600" title={sub.reason}>
                                                        {sub.reason}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} />
                                                        {formatDate(sub.startDate)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <span className="font-medium">
                                                        {calculateDuration(sub.startDate, sub.endDate)} {t('substitution.days') || 'يوم'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${sub.isActive
                                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                                                        }`}>
                                                        <span className={`w-2 h-2 rounded-full ${sub.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                                        {sub.isActive ? (t('substitution.active') || 'نشط') : (t('substitution.stopped') || 'متوقف')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
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
