"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import Link from "next/link";
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Users,
    Building2,
    AlertTriangle,
    ArrowRight,
    TrendingUp
} from "lucide-react";

export default function ShiftsSummary() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState("");
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const dateParam = searchParams.get('date');
        const initialDate = dateParam || new Date().toISOString().split('T')[0];
        setSelectedDate(initialDate);
        fetchSummary(initialDate);
    }, [searchParams]);

    const fetchSummary = async (date) => {
        setLoading(true);
        setError(null);
        try {
            const url = `${API_ENDPOINTS.MEMBER.SHIFTS_SUMMARY}?date=${date}`;
            const response = await ApiService.get(url);
            setSummaryData(response);
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء تحميل البيانات");
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
        fetchSummary(newDate);
        router.push(`/member/shifts/summary?date=${newDate}`);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
            <AlertTriangle size={20} />
            <span>{error}</span>
        </div>
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} />
                        مكتمل
                    </span>
                );
            case 'Failed':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle size={12} />
                        فاشل
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/member/shifts"
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowRight size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">ملخص الاداء اليومي</h1>
                        <p className="text-gray-500">{new Date(selectedDate).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
                <div>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard
                    title="إجمالي المناديب"
                    value={summaryData?.totalRiders || 0}
                    icon={Users}
                    color="#3B82F6"
                    background="bg-blue-200"
                />
                <StatCard
                    title="المناديب النشطون"
                    value={summaryData?.activeRiders || 0}
                    icon={CheckCircle}
                    color="#525252ff"
                    background="bg-gray-200"
                />
                <StatCard
                    title="الطلبات المقبولة"
                    value={summaryData?.totalAcceptedOrders || 0}
                    icon={TrendingUp}
                    color="#3552d3ff"
                    background="bg-blue-200"
                />
                <StatCard
                    title="الطلبات المرفوضة"
                    value={summaryData?.totalRejectedOrders || 0}
                    icon={XCircle}
                    color="#4e4b45ff"
                    background="bg-gray-200"
                />
                <StatCard
                    title="ساعات العمل"
                    value={summaryData?.totalWorkingHours?.toFixed(2) || 0}
                    icon={Clock}
                    color="#355dccff"
                    background="bg-blue-200"
                />
            </div>

            {/* Rider Shifts Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-blue-600" size={20} />
                        مناوبات المناديب
                        <span className="text-sm font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                            {summaryData?.riderShifts?.length || 0}
                        </span>
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    المندوب
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    رقم العمل
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الطلبات المقبولة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الطلبات المرفوضة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ساعات العمل
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الحالة
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {summaryData?.riderShifts?.length > 0 ? (
                                summaryData.riderShifts.map((rider) => (
                                    <tr key={rider.riderId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-gray-900">{rider.riderName}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {rider.workingId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <CheckCircle size={14} className="text-green-600" />
                                                <span className="text-sm font-bold text-green-700">{rider.acceptedOrders}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <XCircle size={14} className="text-red-600" />
                                                <span className="text-sm font-bold text-red-700">{rider.rejectedOrders}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-700">{rider.workingHours.toFixed(2)} س</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(rider.status)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        لا توجد مناوبات في هذا التاريخ
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Reusable StatCard component
const StatCard = ({ title, value, icon: Icon, color, background }) => {
    return (
        <div className={`rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 ${background} h-full`}>
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-lg transition-colors bg-white/50">
                    <Icon size={18} style={{ color: color }} />
                </div>
            </div>
            <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{value}</h3>
                <p className="font-medium text-gray-700 text-xs">{title}</p>
            </div>
        </div>
    );
}
