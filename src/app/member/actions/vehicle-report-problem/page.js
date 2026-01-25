"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { formatPlateNumber } from "@/lib/utils/formatters";
import {
    Car,
    IdCard,
    AlertCircle,
    CheckCircle,
    MessageSquare,
    Send,
    Loader2,
    AlertTriangle,
    Search
} from "lucide-react";

export default function VehicleReportProblemPage() {
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [loadingVehicles, setLoadingVehicles] = useState(true);

    const [formData, setFormData] = useState({
        riderIqamaNo: "",
        vehiclePlate: "",
        reason: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        loadVehicles();
    }, []);

    useEffect(() => {
        // Filter vehicles based on search term
        if (searchTerm.trim() === "") {
            setFilteredVehicles(vehicles);
        } else {
            const filtered = vehicles.filter(v =>
                v.plateNumberA?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.vehicleNumber?.toString().includes(searchTerm) ||
                v.riderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.riderIqamaNo?.toString().includes(searchTerm)
            );
            setFilteredVehicles(filtered);
        }
    }, [searchTerm, vehicles]);

    const loadVehicles = async () => {
        setLoadingVehicles(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.MEMBER.VEHICLES);
            // Show all vehicles (both taken and returned)
            const allVehicles = Array.isArray(response) ? response : [];
            // Filter out vehicles that already have a problem
            const validVehicles = allVehicles.filter(v => v.currentStatus?.toLowerCase() !== 'problem');
            setVehicles(validVehicles);
            setFilteredVehicles(validVehicles);
        } catch (error) {
            console.error("Error loading vehicles:", error);
        } finally {
            setLoadingVehicles(false);
        }
    };

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        setFormData(prev => ({
            ...prev,
            vehiclePlate: vehicle.plateNumberA || "",
            riderIqamaNo: vehicle.assignedRiderIqamaNo || vehicle.riderIqamaNo || ""
        }));
        setMessage({ type: "", text: "" });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (message.text) {
            setMessage({ type: "", text: "" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.vehiclePlate.trim()) {
            setMessage({ type: "error", text: "يرجى اختيار مركبة" });
            return;
        }
        if (!formData.reason.trim()) {
            setMessage({ type: "error", text: "يرجى إدخال وصف المشكلة" });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const payload = {
                vehiclePlate: formData.vehiclePlate.replace(/\s/g, ''),
                reason: formData.reason
            };

            // Only include riderIqamaNo if it exists (nullable for returned vehicles)
            if (formData.riderIqamaNo) {
                payload.riderIqamaNo = parseInt(formData.riderIqamaNo);
            }

            await ApiService.post(API_ENDPOINTS.MEMBER.VEHICLE_REQUEST_REPORT_PROBLEM, payload);

            setMessage({
                type: "success",
                text: "تم إرسال تقرير المشكلة بنجاح"
            });

            // Reset form
            setFormData({
                riderIqamaNo: "",
                vehiclePlate: "",
                reason: ""
            });
            setSelectedVehicle(null);
            loadVehicles(); // Reload vehicles
        } catch (error) {
            setMessage({
                type: "error",
                text: error.message || "حدث خطأ أثناء إرسال التقرير"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">الإبلاغ عن مشكلة مركبة</h1>
                <p className="text-gray-500">اختر مركبة وأبلغ عن المشكلة (متاحة أو مستخدمة)</p>
            </div>

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

            {/* All Vehicles Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Car className="text-orange-600" size={20} />
                        جميع المركبات
                        <span className="text-sm font-medium px-2 py-1 bg-orange-50 text-orange-700 rounded-full">
                            {filteredVehicles.length}
                        </span>
                    </h2>
                </div>

                <div className="p-6">
                    {/* Search */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="البحث برقم اللوحة، رقم المركبة، اسم المندوب، أو رقم الإقامة..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            />
                        </div>
                    </div>

                    {loadingVehicles ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-orange-600" size={32} />
                        </div>
                    ) : filteredVehicles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                            {filteredVehicles.map((vehicle) => {
                                const status = vehicle.currentStatus?.toLowerCase();
                                const isTaken = status === 'taken' || status === 'مستخدمة';
                                const isReturned = status === 'returned' || status === 'متاحة' || status === 'available';

                                return (
                                    <div
                                        key={vehicle.plateNumberA || vehicle.vehicleNumber}
                                        onClick={() => handleVehicleSelect(vehicle)}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedVehicle?.plateNumberA === vehicle.plateNumberA
                                            ? "border-orange-500 bg-orange-50"
                                            : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Car className="text-orange-600" size={16} />
                                                <span className="font-bold text-gray-900">{formatPlateNumber(vehicle.plateNumberA)}</span>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${isTaken
                                                ? 'bg-red-100 text-red-700'
                                                : isReturned
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {(() => {
                                                    const statusMap = {
                                                        'taken': 'مستخدمة',
                                                        'returned': 'متاحة',
                                                        'problem': 'صيانة',
                                                    };
                                                    return statusMap[status] || vehicle.currentStatus || '-';
                                                })()}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>رقم المركبة: {vehicle.vehicleNumber || '-'}</p>
                                            {vehicle.riderName && <p>المندوب: {vehicle.riderName}</p>}
                                            {(vehicle.riderIqamaNo || vehicle.assignedRiderIqamaNo) && (
                                                <p>رقم الإقامة: {vehicle.riderIqamaNo || vehicle.assignedRiderIqamaNo}</p>
                                            )}
                                            {vehicle.vehicleType && <p>النوع: {vehicle.vehicleType}</p>}
                                            {!vehicle.riderName && !vehicle.riderIqamaNo && !vehicle.assignedRiderIqamaNo && (
                                                <p className="text-gray-400 italic">لا يوجد مندوب مسند</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <Car className="mx-auto mb-2 text-gray-300" size={48} />
                            <p>لا توجد مركبات</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Report Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Send className="text-orange-600" size={20} />
                        نموذج الإبلاغ عن المشكلة
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Rider Iqama Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <IdCard size={16} />
                            رقم إقامة المندوب
                            <span className="text-gray-400 text-xs">(اختياري للمركبات المرتجعة)</span>
                        </label>
                        <input
                            type="number"
                            name="riderIqamaNo"
                            value={formData.riderIqamaNo}
                            onChange={handleInputChange}
                            placeholder="أدخل رقم إقامة المندوب (اختياري)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            disabled={loading}
                        />
                    </div>

                    {/* Vehicle Plate (Auto-filled) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Car size={16} />
                            رقم لوحة المركبة المختارة
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="vehiclePlate"
                            value={formatPlateNumber(formData.vehiclePlate)}
                            onChange={handleInputChange}
                            placeholder="اختر مركبة من القائمة أعلاه"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            disabled={loading}
                            readOnly
                        />
                    </div>

                    {/* Problem Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <MessageSquare size={16} />
                            وصف المشكلة
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleInputChange}
                            placeholder="اشرح المشكلة بالتفصيل:&#10;- ما هي المشكلة؟&#10;- متى لاحظتها؟&#10;- هل تؤثر على السلامة؟&#10;- أي ملاحظات إضافية..."
                            rows="6"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
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
                            disabled={loading || !selectedVehicle}
                            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 focus:ring-4 focus:ring-orange-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    جاري الإرسال...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    إرسال التقرير
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Warning Card */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-orange-800">
                        <p className="font-medium mb-1">ملاحظات هامة:</p>
                        <ul className="list-disc mr-5 space-y-1">
                            <li>قدم وصفاً دقيقاً ومفصلاً للمشكلة</li>
                            <li>اذكر متى لاحظت المشكلة لأول مرة</li>
                            <li>حدد مدى خطورة المشكلة على السلامة</li>
                            <li>إذا كانت المشكلة خطيرة، توقف عن استخدام المركبة فوراً</li>
                            <li>سيتم مراجعة تقريرك من قبل فريق الصيانة</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
