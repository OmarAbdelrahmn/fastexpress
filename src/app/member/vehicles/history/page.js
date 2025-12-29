"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { formatPlateNumber } from "@/lib/utils/formatters";
import Link from "next/link";
import {
    ArrowLeft,
    Calendar,
    User,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    History as HistoryIcon
} from "lucide-react";

export default function VehicleHistoryPage() {
    const searchParams = useSearchParams();
    const vehicleNumber = searchParams.get('vehicleNumber');

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!vehicleNumber) {
            setError("رقم المركبة غير محدد");
            setLoading(false);
            return;
        }

        const fetchHistory = async () => {
            try {
                const response = await ApiService.get(
                    API_ENDPOINTS.MEMBER.VEHICLE_HISTORY(vehicleNumber)
                );
                setHistory(Array.isArray(response) ? response : []);
            } catch (err) {
                setError(err.message || "حدث خطأ أثناء تحميل التاريخ");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [vehicleNumber]);

    const getActionBadge = (statusType, isActive) => {
        // Add inactive indicator if applicable
        const inactiveIndicator = !isActive ? ' (منتهي)' : '';

        switch (statusType?.toLowerCase()) {
            case 'taken':
            case 'أخذ':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <CheckCircle size={12} />
                        أخذ{inactiveIndicator}
                    </span>
                );
            case 'returned':
            case 'إرجاع':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <XCircle size={12} />
                        إرجاع{inactiveIndicator}
                    </span>
                );
            case 'problem':
            case 'مشكلة':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle size={12} />
                        مشكلة{inactiveIndicator}
                    </span>
                );
            case 'fixed':
            case 'تم الإصلاح':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <CheckCircle size={12} />
                        تم الإصلاح{inactiveIndicator}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {statusType || 'غير محدد'}{inactiveIndicator}
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
        <div className="space-y-4">
            <Link
                href="/member/vehicles"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
                <ArrowLeft size={18} />
                العودة للمركبات
            </Link>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
                <AlertTriangle size={20} />
                <span>{error}</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/member/vehicles"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-2"
                    >
                        <ArrowLeft size={18} />
                        العودة للمركبات
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <HistoryIcon className="text-blue-600" size={24} />
                        تاريخ المركبة
                    </h1>
                    <p className="text-gray-500 font-mono mt-1">{vehicleNumber}</p>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="text-blue-600" size={20} />
                        سجل العمليات
                        <span className="text-sm font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                            {history?.length || 0}
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
                                    العملية
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الموظف
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    تاريخ بداية التصريح
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    تاريخ نهاية التصريح
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ملاحظات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {history?.length > 0 ? (
                                history.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} className="text-gray-400" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">
                                                        {item.timestamp ? new Date(item.timestamp).toLocaleDateString('ar-SA') : 'غير محدد'}
                                                    </p>
                                                    <p className="text-gray-500 text-xs">
                                                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getActionBadge(item.statusType, item.isActive)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.employeeName || item.employeeIqamaNo ? (
                                                <div className="flex items-center gap-1">
                                                    <User size={14} className="text-gray-400" />
                                                    <div className="text-sm">
                                                        <p className="font-medium text-gray-900">{item.employeeName || 'غير محدد'}</p>
                                                        {item.employeeIqamaNo && (
                                                            <p className="text-gray-500 text-xs">{item.employeeIqamaNo}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-700">
                                                    {item.permissionStartDate ? new Date(item.permissionStartDate).toLocaleDateString('ar-SA') : '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-700">
                                                    {item.permissionEndDate ? new Date(item.permissionEndDate).toLocaleDateString('ar-SA') : '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-700">
                                                {item.reason || '-'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        لا يوجد سجل تصاريح لهذه المركبة
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
