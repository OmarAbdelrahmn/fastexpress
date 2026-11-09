"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { formatPlateNumber } from "@/lib/utils/formatters";
import VehicleInspectionUploader from "@/components/vehicles/VehicleInspectionUploader";
import {
    VehicleInspectionService,
    validateInspection
} from "@/lib/services/vehicleInspectionService";
import {
    Car,
    IdCard,
    AlertCircle,
    CheckCircle,
    MessageSquare,
    Send,
    Loader2,
    RefreshCw,
    Search
} from "lucide-react";

export default function VehicleSwitchRequestPage() {
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [loadingVehicles, setLoadingVehicles] = useState(true);

    const [formData, setFormData] = useState({
        riderIqamaNo: "",
        newVehiclePlate: "",
        reason: ""
    });

    // Inspection for replacement vehicle (Inspection.*)
    const [inspection, setInspection] = useState({
        frontImage: null,
        backImage: null,
        rightImage: null,
        leftImage: null,
        odometerImage: null,
        mileageKm: ""
    });
    const [inspectionErrors, setInspectionErrors] = useState({});

    // Inspection for returned vehicle (ReturnInspection.*)
    const [returnInspection, setReturnInspection] = useState({
        frontImage: null,
        backImage: null,
        rightImage: null,
        leftImage: null,
        odometerImage: null,
        mileageKm: ""
    });
    const [returnInspectionErrors, setReturnInspectionErrors] = useState({});

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
                v.location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredVehicles(filtered);
        }
    }, [searchTerm, vehicles]);

    const loadVehicles = async () => {
        setLoadingVehicles(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.VEHICLES.ALL_WITH_RIDERS);
            // Filter for available vehicles only
            const availableVehicles = Array.isArray(response)
                ? response.filter(v => v.currentStatus?.toLowerCase() === 'returned' || v.currentStatus?.toLowerCase() === 'متاح' || v.currentStatus?.toLowerCase() === 'available' || v.currentStatus?.toLowerCase() === 'متاحة')
                : [];
            setVehicles(availableVehicles);
            setFilteredVehicles(availableVehicles);
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
            newVehiclePlate: vehicle.plateNumberA || ""
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
        if (!formData.riderIqamaNo) {
            setMessage({ type: "error", text: "يرجى إدخال رقم إقامة المندوب" });
            return;
        }
        if (!formData.newVehiclePlate.trim()) {
            setMessage({ type: "error", text: "يرجى اختيار مركبة جديدة" });
            return;
        }
        if (!formData.reason.trim()) {
            setMessage({ type: "error", text: "يرجى إدخال سبب الطلب" });
            return;
        }

        // Validate BOTH inspection sets (replacement & return)
        const checkNew = validateInspection(inspection, 'Inspection');
        const checkReturn = validateInspection(returnInspection, 'ReturnInspection');

        if (!checkNew.valid || !checkReturn.valid) {
            setInspectionErrors(checkNew.errors);
            setReturnInspectionErrors(checkReturn.errors);
            setMessage({
                type: "error",
                text: "يرجى استكمال جميع صور فحص المركبتين الـ 10 وقراءة العداد لكل منهما (المركبة البديلة والمركبة المعادة)"
            });
            return;
        }
        setInspectionErrors({});
        setReturnInspectionErrors({});

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await VehicleInspectionService.submitMemberRequestSwitch({
                riderIqamaNo: formData.riderIqamaNo,
                newVehiclePlate: formData.newVehiclePlate,
                reason: formData.reason,
                inspection,
                returnInspection
            });

            setMessage({
                type: "success",
                text: "تم إرسال طلب استبدال المركبة ورفع فحوصات المركبتين بنجاح"
            });

            // Reset form
            setFormData({
                riderIqamaNo: "",
                newVehiclePlate: "",
                reason: ""
            });
            setInspection({
                frontImage: null,
                backImage: null,
                rightImage: null,
                leftImage: null,
                odometerImage: null,
                mileageKm: ""
            });
            setReturnInspection({
                frontImage: null,
                backImage: null,
                rightImage: null,
                leftImage: null,
                odometerImage: null,
                mileageKm: ""
            });
            setInspectionErrors({});
            setReturnInspectionErrors({});
            setSelectedVehicle(null);
            loadVehicles(); // Reload vehicles
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
                <h3 className="text-lg md:text-2xl font-bold text-gray-900">طلب استبدال مركبة</h3>
                <p className="text-gray-500">اختر مركبة جديدة، ارفع فحص المركبة البديلة وفحص المركبة المعادة، ثم أرسل الطلب</p>
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
                    <span>{message.text}</span>
                </div>
            )}

            {/* Main Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rider Iqama Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <IdCard size={16} />
                            رقم إقامة المندوب
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="riderIqamaNo"
                            value={formData.riderIqamaNo}
                            onChange={handleInputChange}
                            placeholder="أدخل رقم الإقامة (10 أرقام)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                            disabled={loading}
                        />
                    </div>

                    {/* New Vehicle Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Car size={16} />
                            اختيار المركبة البديلة (الجديدة)
                            <span className="text-red-500">*</span>
                        </label>

                        {/* Search Input */}
                        <div className="relative mb-3">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ابحث برقم اللوحة، رقم المركبة، أو الموقع..."
                                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={loading || loadingVehicles}
                            />
                            <Search size={18} className="absolute right-3 top-3 text-gray-400" />
                        </div>

                        {/* Vehicles List */}
                        {loadingVehicles ? (
                            <div className="text-center py-8 text-gray-500">
                                <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                                جاري تحميل المركبات المتاحة...
                            </div>
                        ) : filteredVehicles.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <Car size={32} className="mx-auto mb-2 text-gray-400" />
                                لا توجد مركبات متاحة حالياً
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1 border border-gray-200 rounded-lg">
                                {filteredVehicles.map((vehicle) => (
                                    <div
                                        key={vehicle.vehicleNumber || vehicle.plateNumberA}
                                        onClick={() => handleVehicleSelect(vehicle)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedVehicle?.plateNumberA === vehicle.plateNumberA
                                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-gray-900 font-mono">
                                                {formatPlateNumber(vehicle.plateNumberA)}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                                                متاح
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-0.5">
                                            {vehicle.vehicleNumber && (
                                                <p>رقم المركبة: {vehicle.vehicleNumber}</p>
                                            )}
                                            {vehicle.location && (
                                                <p>الموقع: {vehicle.location}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected Vehicle Display */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            المركبة البديلة المختارة
                        </label>
                        <input
                            type="text"
                            value={selectedVehicle ? formatPlateNumber(selectedVehicle.plateNumberA) : "لم يتم اختيار مركبة بعد"}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono font-bold"
                            disabled={loading}
                            readOnly
                        />
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <MessageSquare size={16} />
                            سبب الاستبدال
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleInputChange}
                            placeholder="اذكر سبب طلب استبدال المركبة (مثل: المركبة الحالية معطلة، تغيير موقع العمل، إلخ)"
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                            disabled={loading}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            عدد الأحرف: {formData.reason.length}
                        </p>
                    </div>

                    {/* Dual Inspection Uploads: Replacement Vehicle + Returned Vehicle */}
                    <div className="space-y-6 pt-2">
                        {/* 1. Replacement Vehicle Inspection (Inspection.*) */}
                        <VehicleInspectionUploader
                            value={inspection}
                            onChange={setInspection}
                            errors={inspectionErrors}
                            disabled={loading}
                            prefix="Inspection"
                            title="1. فحص المركبة البديلة (الجديدة المراد استلامها)"
                            subtitle="التقط 5 صور للمركبة البديلة وسجل قراءة عدادها الحالية"
                            isArabic={true}
                        />

                        {/* 2. Returned Vehicle Inspection (ReturnInspection.*) */}
                        <VehicleInspectionUploader
                            value={returnInspection}
                            onChange={setReturnInspection}
                            errors={returnInspectionErrors}
                            disabled={loading}
                            prefix="ReturnInspection"
                            title="2. فحص المركبة المعادة (الحالية المراد إرجاعها)"
                            subtitle="التقط 5 صور للمركبة التي بحوزة المندوب حالياً وسجل قراءة عدادها عند الإرجاع"
                            isArabic={true}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={loading || !selectedVehicle}
                            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    جاري الإرسال والرفع...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    إرسال طلب الاستبدال مع الفحوصات
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
