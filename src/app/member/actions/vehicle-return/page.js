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
    RotateCcw,
    Search
} from "lucide-react";

export default function VehicleReturnRequestPage() {
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

    const [inspection, setInspection] = useState({
        frontImage: null,
        backImage: null,
        rightImage: null,
        leftImage: null,
        odometerImage: null,
        mileageKm: ""
    });
    const [inspectionErrors, setInspectionErrors] = useState({});

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
            const filtered = vehicles.filter(v => {
                const search = searchTerm.toLowerCase();
                const riderName = v.riderName || v.assignedRiderName || v.currentRider?.riderName || v.currentRider?.riderNameE || "";
                const iqama = v.riderIqamaNo || v.assignedRiderIqamaNo || v.currentRider?.employeeIqamaNo || "";
                return (
                    v.plateNumberA?.toLowerCase().includes(search) ||
                    v.vehicleNumber?.toString().includes(search) ||
                    riderName.toLowerCase().includes(search) ||
                    iqama.toString().includes(search)
                );
            });
            setFilteredVehicles(filtered);
        }
    }, [searchTerm, vehicles]);

    const loadVehicles = async () => {
        setLoadingVehicles(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.VEHICLES.ALL_WITH_RIDERS);
            // Filter for taken/used vehicles only
            const usedVehicles = Array.isArray(response)
                ? response.filter(v => v.currentStatus?.toLowerCase() === 'taken' || v.currentStatus?.toLowerCase() === 'مستخدمة')
                : [];
            setVehicles(usedVehicles);
            setFilteredVehicles(usedVehicles);
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
            riderIqamaNo: vehicle.assignedRiderIqamaNo || vehicle.riderIqamaNo || vehicle.currentRider?.employeeIqamaNo || ""
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
        if (!formData.vehiclePlate.trim()) {
            setMessage({ type: "error", text: "يرجى اختيار مركبة" });
            return;
        }

        // Validate inspection fields
        const inspectionValidation = validateInspection(inspection, 'Inspection');
        if (!inspectionValidation.valid) {
            setInspectionErrors(inspectionValidation.errors);
            setMessage({
                type: "error",
                text: "يرجى استكمال جميع صور فحص المركبة الـ 5 وقراءة العداد بالكيلومترات قبل الإرسال"
            });
            return;
        }
        setInspectionErrors({});

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await VehicleInspectionService.submitMemberRequestReturn({
                riderIqamaNo: formData.riderIqamaNo,
                vehiclePlate: formData.vehiclePlate.replace(/\s/g, ''),
                reason: formData.reason,
                inspection
            });

            setMessage({
                type: "success",
                text: "تم إرسال طلب إرجاع المركبة ورفع صور الفحص بنجاح"
            });

            // Reset form
            setFormData({
                riderIqamaNo: "",
                vehiclePlate: "",
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
            setInspectionErrors({});
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
                <h3 className="text-lg md:text-2xl font-bold text-gray-900">طلب إرجاع مركبة</h3>
                <p className="text-gray-500">اختر المركبة المراد إرجاعها، ارفع صور الفحص، وأرسل طلب الإرجاع</p>
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
                    {/* Vehicle Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Car size={16} />
                            اختيار المركبة المراد إرجاعها
                            <span className="text-red-500">*</span>
                        </label>

                        {/* Search Input */}
                        <div className="relative mb-3">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ابحث برقم اللوحة، رقم المركبة، اسم السائق، أو رقم الإقامة..."
                                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                disabled={loading || loadingVehicles}
                            />
                            <Search size={18} className="absolute right-3 top-3 text-gray-400" />
                        </div>

                        {/* Vehicles List */}
                        {loadingVehicles ? (
                            <div className="text-center py-8 text-gray-500">
                                <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                                جاري تحميل المركبات قيد الاستخدام...
                            </div>
                        ) : filteredVehicles.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <Car size={32} className="mx-auto mb-2 text-gray-400" />
                                لا توجد مركبات مستخدمة حالياً
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-1 border border-gray-200 rounded-lg">
                                {filteredVehicles.map((vehicle) => {
                                    const riderName = vehicle.riderName || vehicle.assignedRiderName || vehicle.currentRider?.riderName || vehicle.currentRider?.riderNameE || "غير محدد";
                                    const iqama = vehicle.riderIqamaNo || vehicle.assignedRiderIqamaNo || vehicle.currentRider?.employeeIqamaNo || "غير محدد";

                                    return (
                                        <div
                                            key={vehicle.vehicleNumber || vehicle.plateNumberA}
                                            onClick={() => handleVehicleSelect(vehicle)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedVehicle?.plateNumberA === vehicle.plateNumberA
                                                ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-gray-900 font-mono">
                                                    {formatPlateNumber(vehicle.plateNumberA)}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                                    في الخدمة
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 space-y-0.5">
                                                <p className="text-gray-700 font-medium">{riderName}</p>
                                                <p>الإقامة: {iqama}</p>
                                                {vehicle.vehicleNumber && (
                                                    <p>رقم المركبة: {vehicle.vehicleNumber}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-mono"
                            disabled={loading}
                        />
                    </div>

                    {/* Selected Vehicle Display */}
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-mono font-bold"
                            disabled={loading}
                            readOnly
                        />
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <MessageSquare size={16} />
                            سبب الإرجاع (اختياري)
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleInputChange}
                            placeholder="اذكر سبب إرجاع المركبة (اختياري)"
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                            disabled={loading}
                        />
                    </div>

                    {/* Handover Inspection Uploads */}
                    <VehicleInspectionUploader
                        value={inspection}
                        onChange={setInspection}
                        errors={inspectionErrors}
                        disabled={loading}
                        prefix="Inspection"
                        title="صور فحص إرجاع المركبة"
                        subtitle="يرجى التقاط ورفع 5 صور للمركبة من جميع الجهات وقراءة العداد بالكيلومترات عند الإرجاع (الحد الأقصى 5 ميجابايت لكل صورة)"
                        isArabic={true}
                    />

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={loading || !selectedVehicle}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    جاري الإرسال والرفع...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    إرسال الطلب مع الفحص
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
