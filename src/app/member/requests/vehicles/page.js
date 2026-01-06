"use client";

import { useEffect, useState } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { formatPlateNumber } from "@/lib/utils/formatters";
import {
    Car,
    User,
    IdCard,
    Calendar,
    MessageSquare,
    AlertTriangle,
    CheckCircle,
    XCircle,
    FileText,
    Clock,
    Trash2
} from "lucide-react";

export default function VehicleRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await ApiService.get(API_ENDPOINTS.MEMBER.REQ_VEHICLE_OPERATIONS);
            setRequests(Array.isArray(response) ? response : []);
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء تحميل البيانات");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async (requestId) => {
        if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
            return;
        }

        try {
            await ApiService.delete(`/api/member/requests/vehicle-operation/${requestId}`);
            // Reload requests after successful cancellation
            await loadRequests();
        } catch (err) {
            alert(err.message || "حدث خطأ أثناء إلغاء الطلب");
        }
    };

    // Calculate statistics
    const stats = {
        total: requests?.length || 0,
        taken: requests?.filter(r => r.operationType?.toLowerCase() === 'taken')?.length || 0,
        returned: requests?.filter(r => r.operationType?.toLowerCase() === 'returned')?.length || 0,
    };

    const getOperationBadge = (operationType) => {
        switch (operationType?.toLowerCase()) {
            case 'taken':
            case 'أخذ':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <CheckCircle size={12} />
                        أخذ
                    </span>
                );
            case 'returned':
            case 'إرجاع':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <XCircle size={12} />
                        إرجاع
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {operationType || 'غير محدد'}
                    </span>
                );
        }
    };

    const getStatusBadge = () => {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Clock size={12} />
                معلق
            </span>
        );
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900">طلبات عمليات المركبات</h1>
                <p className="text-gray-500">قائمة طلبات عمليات المركبات المعلقة</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="إجمالي الطلبات"
                    value={stats.total}
                    icon={FileText}
                    color="#3B82F6"
                    background="bg-blue-200"
                />
                <StatCard
                    title="طلبات الأخذ"
                    value={stats.taken}
                    icon={CheckCircle}
                    color="#10B981"
                    background="bg-green-200"
                />
                <StatCard
                    title="طلبات الإرجاع"
                    value={stats.returned}
                    icon={XCircle}
                    color="#EF4444"
                    background="bg-red-200"
                />
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Car className="text-blue-600" size={20} />
                        قائمة الطلبات المعلقة
                        <span className="text-sm font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                            {requests?.length || 0}
                        </span>
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    #
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    رقم الإقامة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    اسم المندوب
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    رقم المركبة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    رقم اللوحة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    نوع العملية
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الحالة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    السبب
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    مقدم الطلب
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    تاريخ الطلب
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    إلغاء
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {requests?.length > 0 ? (
                                requests.map((request, index) => (
                                    <tr key={request.id || index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {request.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <IdCard size={14} className="text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">{request.riderIqamaNo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-900">{request.riderName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Car size={14} className="text-gray-400" />
                                                <span className="text-sm font-mono text-gray-700">{request.vehicleNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">{formatPlateNumber(request.vehiclePlate)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getOperationBadge(request.operationType)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge()}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="flex items-start gap-2">
                                                <MessageSquare size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-gray-700 truncate">{request.reason || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-700">{request.requestedBy}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} className="text-gray-400" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">
                                                        {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString('en-US') : 'غير محدد'}
                                                    </p>
                                                    <p className="text-gray-500 text-xs">
                                                        {request.requestedAt ? new Date(request.requestedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleCancelRequest(request.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                                title="إلغاء الطلب"
                                            >
                                                <Trash2 size={14} />
                                                إلغاء
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11" className="px-6 py-8 text-center text-gray-500">
                                        لا توجد طلبات معلقة
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">ملاحظة:</p>
                        <p>هذه الصفحة تعرض الطلبات المعلقة فقط. سيتم مراجعة جميع الطلبات من قبل الإدارة.</p>
                    </div>
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
