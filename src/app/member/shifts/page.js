"use client";

import { useEffect, useState } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import Link from "next/link";
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    Users,
    Building2,
    AlertTriangle,
    Download
} from "lucide-react";

export default function MemberShifts() {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Initialize dates to previous month
    useEffect(() => {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        const start = lastMonth.toISOString().split('T')[0];
        const end = lastMonthEnd.toISOString().split('T')[0];

        setStartDate(start);
        setEndDate(end);

        // Fetch data on initial load with default dates
        fetchShiftsWithDates(start, end);
    }, []);

    const fetchShiftsWithDates = async (start, end) => {
        setLoading(true);
        try {
            const url = `${API_ENDPOINTS.MEMBER.SHIFTS}?startDate=${start}&endDate=${end}`;
            const response = await ApiService.get(url);
            setShifts(response);
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء تحميل البيانات");
        } finally {
            setLoading(false);
        }
    };

    const fetchShifts = () => {
        fetchShiftsWithDates(startDate, endDate);
    };

    // Calculate statistics
    const stats = {
        totalShifts: shifts?.length || 0,
        completed: shifts?.filter(s => s.shiftStatus === 'Completed')?.length || 0,
        failed: shifts?.filter(s => s.shiftStatus === 'Failed')?.length || 0,
        totalOrders: shifts?.reduce((sum, s) => sum + (s.acceptedDailyOrders || 0), 0) || 0,
        totalHours: shifts?.reduce((sum, s) => sum + (s.workingHours || 0), 0).toFixed(2) || 0,
        hunger: shifts?.filter(s => s.companyName === 'Hunger')?.length || 0,
        keta: shifts?.filter(s => s.companyName === 'Keta')?.length || 0,
    };

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
            case 'Pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock size={12} />
                        قيد الانتظار
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status || 'غير محدد'}
                    </span>
                );
        }
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

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">المناوبات</h1>
                    <p className="text-gray-500">عرض وإدارة المناوبات اليومية للمناديب</p>
                </div>
            </div>

            {/* Date Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            من تاريخ
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            إلى تاريخ
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={fetchShifts}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Calendar size={18} />
                        تحديث
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <StatCard
                    title="إجمالي المناوبات"
                    value={stats.totalShifts}
                    icon={Calendar}
                    color="#3B82F6"
                    background="bg-blue-200"
                />
                <StatCard
                    title="مكتملة"
                    value={stats.completed}
                    icon={CheckCircle}
                    color="#525252ff"
                    background="bg-gray-200"
                />
                <StatCard
                    title="فاشلة"
                    value={stats.failed}
                    icon={XCircle}
                    color="#3552d3ff"
                    background="bg-blue-200"
                />
                <StatCard
                    title="إجمالي الطلبات"
                    value={stats.totalOrders}
                    icon={TrendingUp}
                    color="#4e4b45ff"
                    background="bg-gray-200"
                />
                <StatCard
                    title="ساعات العمل"
                    value={stats.totalHours}
                    icon={Clock}
                    color="#355dccff"
                    background="bg-blue-200"
                />
                <StatCard
                    title="Hunger"
                    value={stats.hunger}
                    icon={Building2}
                    color="#4e4b45ff"
                    background="bg-gray-200"
                />
                <StatCard
                    title="Keta"
                    value={stats.keta}
                    icon={Building2}
                    color="#385eaaff"
                    background="bg-blue-200"
                />
            </div>

            {/* Shifts Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-blue-600" size={20} />
                        قائمة المناوبات
                        <span className="text-sm font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                            {shifts?.length || 0}
                        </span>
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    التاريخ
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    المندوب
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    رقم العمل
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الشركة
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
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الإجراءات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {shifts?.length > 0 ? (
                                shifts.map((shift, index) => (
                                    <tr key={`${shift.riderId}-${shift.shiftDate}-${index}`} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {new Date(shift.shiftDate).toLocaleDateString('ar-SA')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-gray-900">{shift.riderName}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {shift.workingId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={14} className="text-gray-400" />
                                                <span className={`text-sm font-medium ${shift.companyName === 'Hunger' ? 'text-orange-600' : 'text-gray-600'}`}>
                                                    {shift.companyName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <CheckCircle size={14} className="text-green-600" />
                                                <span className="text-sm font-bold text-green-700">{shift.acceptedDailyOrders}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <XCircle size={14} className="text-red-600" />
                                                <span className="text-sm font-bold text-red-700">{shift.rejectedDailyOrders}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-700">{shift.workingHours.toFixed(2)} س</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(shift.shiftStatus)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/member/shifts/summary?date=${shift.shiftDate}`}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                                            >
                                                <Calendar size={14} />
                                                ملخص اليوم
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                                        لا توجد مناوبات في الفترة المحددة
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
