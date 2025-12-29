"use client";

import { useState } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import StatusBadge from "@/components/Ui/StatusBadge";
import {
    UserCheck,
    IdCard,
    AlertCircle,
    CheckCircle,
    MessageSquare,
    Send,
    Loader2
} from "lucide-react";

export default function EmployeeStatusChangePage() {
    const [formData, setFormData] = useState({
        employeeIqamaNo: "",
        newStatus: "",
        reason: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Available status options from StatusBadge component
    const statusOptions = [
        { value: "enable", label: "تفعيل - نشط" },
        { value: "disable", label: "تعطيل - غير نشط" },
        { value: "fleeing", label: "هارب" },
        { value: "vacation", label: "إجازة" },
        { value: "accident", label: "حادث" },
        { value: "sick", label: "مريض" }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear message when user starts typing
        if (message.text) {
            setMessage({ type: "", text: "" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.employeeIqamaNo) {
            setMessage({ type: "error", text: "يرجى إدخال رقم الإقامة" });
            return;
        }
        if (!formData.newStatus) {
            setMessage({ type: "error", text: "يرجى اختيار الحالة الجديدة" });
            return;
        }
        if (!formData.reason.trim()) {
            setMessage({ type: "error", text: "يرجى إدخال سبب التغيير" });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const payload = {
                employeeIqamaNo: parseInt(formData.employeeIqamaNo),
                newStatus: formData.newStatus,
                reason: formData.reason
            };

            await ApiService.post(API_ENDPOINTS.MEMBER.REQUEST_STATUS_CHANGE, payload);

            setMessage({
                type: "success",
                text: "تم إرسال طلب تغيير الحالة بنجاح"
            });

            // Reset form
            setFormData({
                employeeIqamaNo: "",
                newStatus: "",
                reason: ""
            });
        } catch (error) {
            setMessage({
                type: "error",
                text: error.message || "حدث خطأ أثناء إرسال الطلب"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">طلب تغيير حالة موظف</h1>
                <p className="text-gray-500">إرسال طلب لتغيير حالة موظف في النظام</p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <UserCheck className="text-blue-600" size={20} />
                        نموذج طلب تغيير الحالة
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Message Alert */}
                    {message.text && (
                        <div
                            className={`p-4 rounded-lg flex items-start gap-3 ${message.type === "success"
                                    ? "bg-green-50 border border-green-200 text-green-800"
                                    : "bg-red-50 border border-red-200 text-red-800"
                                }`}
                        >
                            {message.type === "success" ? (
                                <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                            ) : (
                                <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                            )}
                            <span className="font-medium">{message.text}</span>
                        </div>
                    )}

                    {/* Employee Iqama Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <IdCard size={16} />
                            رقم إقامة الموظف
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="employeeIqamaNo"
                            value={formData.employeeIqamaNo}
                            onChange={handleInputChange}
                            placeholder="أدخل رقم إقامة الموظف"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            disabled={loading}
                        />
                    </div>

                    {/* New Status Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <UserCheck size={16} />
                            الحالة الجديدة
                            <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="newStatus"
                            value={formData.newStatus}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            disabled={loading}
                        >
                            <option value="">اختر الحالة الجديدة</option>
                            {statusOptions.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>

                        {/* Status Preview */}
                        {formData.newStatus && (
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-sm text-gray-600">معاينة الحالة:</span>
                                <StatusBadge status={formData.newStatus} />
                            </div>
                        )}
                    </div>

                    {/* Reason Textarea */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <MessageSquare size={16} />
                            سبب التغيير
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleInputChange}
                            placeholder="اذكر سبب طلب تغيير الحالة"
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                            disabled={loading}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            عدد الأحرف: {formData.reason.length}
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    جاري الإرسال...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    إرسال الطلب
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">ملاحظات هامة:</p>
                        <ul className="list-disc mr-5 space-y-1">
                            <li>تأكد من صحة رقم إقامة الموظف قبل الإرسال</li>
                            <li>اختر الحالة المناسبة من القائمة المتاحة</li>
                            <li>اذكر سبب واضح ومفصل لطلب التغيير</li>
                            <li>سيتم مراجعة الطلب من قبل الإدارة</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
