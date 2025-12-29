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
    Shield,
    Eye
} from "lucide-react";

export default function VehicleRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resolving, setResolving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [note, setNote] = useState('');
    const [permission, setPermission] = useState('');
    const [permissionEndDate, setPermissionEndDate] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

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

    const handleResolve = async (request, isApproved) => {
        setResolving(true);
        setError(null);
        setSuccessMessage('');
        setFieldErrors({});

        const errors = {};
        if (isApproved && request.operationType?.toLowerCase() === 'taken') {
            if (!permission) {
                errors.permission = 'التصريح مطلوب';
            }
            if (!permissionEndDate) {
                errors.permissionEndDate = 'تاريخ انتهاء التصريح مطلوب';
            } else {
                const selectedDate = new Date(permissionEndDate);
                const now = new Date();
                selectedDate.setHours(23, 59, 59, 999);

                if (selectedDate <= now) {
                    errors.permissionEndDate = 'يجب أن يكون تاريخ انتهاء التصريح في المستقبل';
                }
            }
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setResolving(false);
            return;
        }

        try {
            const resolutionValue = isApproved ? "Approved" : "Rejected";

            let permissionValue = "";
            let permissionEndDateValue = null;

            if (isApproved && selectedRequest?.operationType?.toLowerCase() === 'taken') {
                permissionValue = permission;
                permissionEndDateValue = new Date(`${permissionEndDate}T23:59:59.999`).toISOString();
            }

            const payload = {
                riderIqamaNo: Number(selectedRequest.riderIqamaNo),
                resolution: resolutionValue,
                resolvedBy: "Member",
                plate: selectedRequest?.vehiclePlate,
                note: note || "",
                permission: isApproved ? permissionValue : null,
                permissionEndDate: permissionEndDateValue ?? null
            };

            await ApiService.put('/api/temp/vehicle-resolve', payload);

            setSuccessMessage(`تم ${isApproved ? 'الموافقة على' : 'رفض'} الطلب بنجاح`);
            setShowResolveModal(false);
            setSelectedRequest(null);
            setNote('');
            setPermission('');
            setPermissionEndDate('');
            loadRequests();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error resolving request:', err);
            setError(err?.message || 'حدث خطأ أثناء معالجة الطلب');
        } finally {
            setResolving(false);
        }
    };

    const openResolveModal = (request) => {
        setSelectedRequest(request);
        setNote('');
        setPermission('');
        setPermissionEndDate('');
        setFieldErrors({});
        setShowResolveModal(true);
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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error && !showResolveModal) return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
            <AlertTriangle size={20} />
            <span>{error}</span>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Success Message */}
            {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
                    <CheckCircle size={20} />
                    <span>{successMessage}</span>
                    <button
                        onClick={() => setSuccessMessage('')}
                        className="mr-auto text-green-700 hover:text-green-900"
                    >
                        <XCircle size={18} />
                    </button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    <span>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="mr-auto text-red-600 hover:text-red-800"
                    >
                        <XCircle size={18} />
                    </button>
                </div>
            )}

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
                                    السبب
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    مقدم الطلب
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    تاريخ الطلب
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الإجراءات
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
                                                        {request.requestedAt ? new Date(request.requestedAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                                                    </p>
                                                    <p className="text-gray-500 text-xs">
                                                        {request.requestedAt ? new Date(request.requestedAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => openResolveModal(request)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                                            >
                                                <Eye size={14} />
                                                مراجعة
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                                        لا توجد طلبات معلقة
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Resolve Modal */}
            {showResolveModal && selectedRequest && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">مراجعة الطلب</h2>
                                <p className="text-gray-500 text-sm mt-1">راجع التفاصيل أدناه واتخذ الإجراء المناسب</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowResolveModal(false);
                                    setSelectedRequest(null);
                                    setNote('');
                                    setPermission('');
                                    setPermissionEndDate('');
                                }}
                                className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all shadow-sm border border-gray-100"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-8">
                            {/* Request Details */}
                            <div className="flex gap-6 mb-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">تفاصيل الطلب</p>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">رقم اللوحة</span>
                                            <span className="font-bold text-gray-800 font-mono text-lg bg-gray-50 px-2 py-1 rounded">
                                                {formatPlateNumber(selectedRequest.vehiclePlate)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">رقم إقامة المندوب</span>
                                            <span className="font-bold text-gray-800 font-mono">{selectedRequest.riderIqamaNo}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">اسم المندوب</span>
                                            <span className="font-bold text-gray-800">{selectedRequest.riderName}</span>
                                        </div>
                                        {selectedRequest.requestedBy && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">مقدم الطلب</span>
                                                <span className="font-bold text-gray-800 font-mono">{selectedRequest.requestedBy}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">نوع العملية</span>
                                            {getOperationBadge(selectedRequest.operationType)}
                                        </div>
                                    </div>
                                </div>

                                {/* Vertical Separator */}
                                <div className="w-px bg-gray-100"></div>

                                <div className="flex-1 flex flex-col justify-center items-center text-center">
                                    {selectedRequest.reason ? (
                                        <>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">السبب</p>
                                            <p className="text-gray-700 italic">"{selectedRequest.reason}"</p>
                                        </>
                                    ) : (
                                        <div className="text-gray-300 flex flex-col items-center justify-center h-full">
                                            <MessageSquare size={48} className="mb-2 opacity-20" />
                                            <span className="text-sm">لا توجد ملاحظات إضافية</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Permission Fields (for Take requests) */}
                            {selectedRequest.operationType?.toLowerCase() === 'taken' && (
                                <div className="bg-purple-50/50 border border-purple-100 p-6 rounded-2xl mb-6">
                                    <h3 className="text-purple-800 font-bold mb-4 flex items-center gap-2">
                                        <Shield size={18} /> متطلبات الموافقة
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                                                التصريح <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={permission}
                                                onChange={(e) => {
                                                    setPermission(e.target.value);
                                                    if (fieldErrors.permission) setFieldErrors({ ...fieldErrors, permission: null });
                                                }}
                                                className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none ${fieldErrors.permission ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                                                    }`}
                                                placeholder="مثال: تصريح التوصيل الشهري"
                                            />
                                            {fieldErrors.permission && (
                                                <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{fieldErrors.permission}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                                                تاريخ انتهاء التصريح <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={permissionEndDate}
                                                onChange={(e) => {
                                                    setPermissionEndDate(e.target.value);
                                                    if (fieldErrors.permissionEndDate) setFieldErrors({ ...fieldErrors, permissionEndDate: null });
                                                }}
                                                className={`w-full px-4 py-3 border rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all outline-none ${fieldErrors.permissionEndDate ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                                                    }`}
                                            />
                                            {fieldErrors.permissionEndDate && (
                                                <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{fieldErrors.permissionEndDate}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                                    ملاحظات (اختياري)
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={3}
                                    placeholder="أضف أي ملاحظات إضافية..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-gray-100 focus:border-gray-400 transition-all outline-none resize-none"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 justify-end pt-6 mt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleResolve(selectedRequest, false)}
                                    disabled={resolving}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle size={20} />
                                    {resolving ? 'جاري المعالجة...' : 'رفض الطلب'}
                                </button>
                                <button
                                    onClick={() => handleResolve(selectedRequest, true)}
                                    disabled={resolving}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-lg shadow-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle size={20} />
                                    {resolving ? 'جاري المعالجة...' : 'الموافقة على الطلب'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
