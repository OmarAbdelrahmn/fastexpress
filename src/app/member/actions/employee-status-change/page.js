"use client";

import { useState, useEffect } from "react";
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
    Loader2,
    Search
} from "lucide-react";

export default function EmployeeStatusChangePage() {
    const [employees, setEmployees] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [formData, setFormData] = useState({
        employeeIqamaNo: "",
        newStatus: "",
        reason: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch employees/riders data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Using MEMBER.RIDERS as it contains the rich data needed for the list
                const response = await ApiService.get(API_ENDPOINTS.MEMBER.RIDERS);
                setEmployees(Array.isArray(response) ? response : []);
            } catch (err) {
                console.error("Error fetching data:", err);
                setMessage({ type: "error", text: "حدث خطأ أثناء تحميل بيانات الموظفين" });
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

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

    const handleSelectEmployee = (iqamaNo) => {
        setFormData(prev => ({
            ...prev,
            employeeIqamaNo: iqamaNo
        }));
        // Scroll to form top smoothly or just focus
        // window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional
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

            // Reset form but keep the selected employee if needed? No, reset all.
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

    // Filter employees based on search term
    const filteredEmployees = employees.filter(employee => {
        if (!searchTerm) return true;

        const search = searchTerm.toLowerCase();
        return (
            employee.employeeIqamaNo?.toString().includes(search) ||
            employee.nameAR?.toLowerCase().includes(search) ||
            employee.nameEN?.toLowerCase().includes(search) ||
            employee.workingId?.toString().includes(search) ||
            employee.companyName?.toLowerCase().includes(search) ||
            employee.phone?.includes(search)
        );
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">طلب تغيير حالة موظف</h1>
                <p className="text-gray-500">إرسال طلب لتغيير حالة موظف في النظام</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Search & List Section */}
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="بحث عن موظف (الإقامة، الاسم، الجوال...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <Search size={20} />
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[400px] flex flex-col">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-xs md:text-sm font-bold text-gray-900 flex items-center justify-between">
                                <span>قائمة الموظفين</span>
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{filteredEmployees.length}</span>
                            </h2>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {loadingData ? (
                                <div className="p-8 text-center flex justify-center items-center h-full">
                                    <Loader2 size={24} className="animate-spin text-blue-600" />
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredEmployees.length > 0 ? (
                                        filteredEmployees.map((employee) => (
                                            <div
                                                key={employee.id || employee.employeeIqamaNo}
                                                onClick={() => handleSelectEmployee(employee.employeeIqamaNo)}
                                                className={`p-3 md:p-4 hover:bg-blue-50 cursor-pointer transition-colors ${formData.employeeIqamaNo == employee.employeeIqamaNo ? 'bg-blue-50 border-r-4 border-blue-500' : ''}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-sm md:text-base font-medium text-gray-900">{employee.nameAR || employee.nameEN || 'بدون اسم'}</p>
                                                        <p className="text-[10px] md:text-xs text-gray-500">{employee.nameEN}</p>
                                                        <div className="flex items-center gap-2 mt-1 text-[10px] md:text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <IdCard size={12} />
                                                                {employee.employeeIqamaNo}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{employee.companyName}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <StatusBadge status={employee.status} />
                                                        {formData.employeeIqamaNo == employee.employeeIqamaNo && (
                                                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                                <CheckCircle size={12} />
                                                                تم الاختيار
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500">
                                            لا توجد نتائج
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
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
                                    placeholder="أدخل رقم إقامة الموظف أو اختر من القائمة"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50"
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-1">يمكنك الكتابة مباشرة أو الاختيار من القائمة</p>
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
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center text-center"
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
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">ملاحظات هامة:</p>
                                <ul className="list-disc mr-5 space-y-1">
                                    <li>تأكد من صحة رقم إقامة الموظف قبل الإرسال</li>
                                    <li>اختر الحالة المناسبة من القائمة المتاحة</li>
                                    <li>اذكر سبب واضح ومفصل لطلب التغيير</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
