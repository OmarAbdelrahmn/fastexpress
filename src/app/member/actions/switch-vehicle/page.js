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
            const response = await ApiService.get(API_ENDPOINTS.MEMBER.VEHICLES);
            // Filter for available vehicles only
            const availableVehicles = Array.isArray(response)
                ? response.filter(v => v.currentStatus?.toLowerCase() === 'returned' || v.currentStatus?.toLowerCase() === 'متاح')
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

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const payload = {
                riderIqamaNo: parseInt(formData.riderIqamaNo),
                newVehiclePlate: formData.newVehiclePlate,
                reason: formData.reason
            };

            await ApiService.post(API_ENDPOINTS.MEMBER.VEHICLE_REQUEST_SWITCH, payload);

            setMessage({
                type: "success",
                text: "تم إرسال طلب استبدال المركبة بنجاح"
            });

            // Reset form
            setFormData({
                riderIqamaNo: "",
                newVehiclePlate: "",
                reason: ""
            });
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
                <h1 className="text-2xl font-bold text-gray-900">طلب استبدال مركبة</h1>
                <p className="text-gray-500">اختر مركبة جديدة متاحة وأرسل طلب استبدال للمركبة الحالية</p>
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

            {/* Available Vehicles Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <RefreshCw className="text-blue-600" size={20} />
                        المركبات المتاحة للاستبدال
                        <span className="text-sm font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
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
                                placeholder="البحث برقم اللوحة، رقم المركبة، أو الموقع..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {loadingVehicles ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : filteredVehicles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                            {filteredVehicles.map((vehicle) => (
                                <div
                                    key={vehicle.plateNumberA || vehicle.vehicleNumber}
                                    onClick={() => handleVehicleSelect(vehicle)}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedVehicle?.plateNumberA === vehicle.plateNumberA
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Car className="text-blue-600" size={16} />
                                        <span className="font-bold text-gray-900">{formatPlateNumber(vehicle.plateNumberA)}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p>رقم المركبة: {vehicle.vehicleNumber || '-'}</p>
                                        <p>الموقع: {vehicle.location || '-'}</p>
                                        {vehicle.vehicleType && <p>النوع: {vehicle.vehicleType}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <Car className="mx-auto mb-2 text-gray-300" size={48} />
                            <p>لا توجد مركبات متاحة</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Request Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Send className="text-blue-600" size={20} />
                        نموذج طلب الاستبدال
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                            placeholder="أدخل رقم إقامة المندوب"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            disabled={loading}
                        />
                    </div>

                    {/* New Vehicle Plate (Auto-filled) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Car size={16} />
                            رقم لوحة المركبة الجديدة المختارة
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="newVehiclePlate"
                            value={formatPlateNumber(formData.newVehiclePlate)}
                            onChange={handleInputChange}
                            placeholder="اختر مركبة من القائمة أعلاه"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                            disabled={loading || !selectedVehicle}
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
                                    إرسال طلب الاستبدال
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
