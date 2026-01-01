"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { formatPlateNumber } from "@/lib/utils/formatters";
import {
    Car,
    AlertCircle,
    CheckCircle,
    Wrench,
    Send,
    Loader2,
    Search,
    ClipboardCheck
} from "lucide-react";

export default function VehicleFixProblemPage() {
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [loadingVehicles, setLoadingVehicles] = useState(true);

    const [formData, setFormData] = useState({
        vehiclePlate: "",
        fixDescription: ""
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
                v.assignedRiderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.assignedRiderIqamaNo?.toString().includes(searchTerm)
            );
            setFilteredVehicles(filtered);
        }
    }, [searchTerm, vehicles]);

    const loadVehicles = async () => {
        setLoadingVehicles(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.MEMBER.VEHICLE_PROBLEMS);
            const allVehicles = Array.isArray(response) ? response : [];
            setVehicles(allVehicles);
            setFilteredVehicles(allVehicles);
        } catch (error) {
            console.error("Error loading vehicles:", error);
            setMessage({ type: "error", text: "فشل تحميل قائمة المركبات" });
        } finally {
            setLoadingVehicles(false);
        }
    };

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        setFormData(prev => ({
            ...prev,
            vehiclePlate: vehicle.plateNumberA || ""
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

        if (!formData.vehiclePlate.trim()) {
            setMessage({ type: "error", text: "يرجى اختيار مركبة" });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const payload = {
                vehiclePlate: formData.vehiclePlate,
                fixDescription: formData.fixDescription
            };

            await ApiService.post(API_ENDPOINTS.MEMBER.VEHICLE_REQUEST_FIX_PROBLEM, payload);

            setMessage({
                type: "success",
                text: "تم إرسال طلب الإصلاح بنجاح"
            });

            // Reset form
            setFormData({
                vehiclePlate: "",
                fixDescription: ""
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
                <h1 className="text-2xl font-bold text-gray-900">إصلاح مشكلة حقيقية</h1>
                <p className="text-gray-500">اختر مركبة ذات مشكلة وقدم طلب إصلاحها</p>
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

            {/* Vehicles List Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Wrench className="text-orange-600" size={20} />
                        المركبات التي تحتاج إلى إصلاح
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
                                placeholder="البحث برقم اللوحة، رقم المركبة، اسم المندوب..."
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
                            {filteredVehicles.map((vehicle) => (
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
                                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700">
                                            {vehicle.currentStatus || 'مشكلة'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p>رقم المركبة: {vehicle.vehicleNumber || '-'}</p>
                                        <p>الموديل: {vehicle.manufacturer} {vehicle.manufactureYear}</p>
                                        {vehicle.assignedRiderName && <p>المندوب: {vehicle.assignedRiderName}</p>}
                                        {vehicle.location && <p>الموقع: {vehicle.location}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <CheckCircle className="mx-auto mb-2 text-green-500" size={48} />
                            <p>لا توجد مركبات تحتاج إلى إصلاح حالياً</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Fix Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <ClipboardCheck className="text-orange-600" size={20} />
                        نموذج الإصلاح
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Vehicle Plate (Auto-filled) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Car size={16} />
                            رقم لوحة المركبة
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="vehiclePlate"
                            value={formatPlateNumber(formData.vehiclePlate)}
                            readOnly
                            placeholder="اختر مركبة من القائمة أعلاه"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all cursor-not-allowed"
                        />
                    </div>

                    {/* Fix Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <ClipboardCheck size={16} />
                            وصف الإصلاح
                            <span className="text-gray-400 text-xs">(اختياري)</span>
                        </label>
                        <textarea
                            name="fixDescription"
                            value={formData.fixDescription}
                            onChange={handleInputChange}
                            placeholder="أدخل تفاصيل الإصلاح الذي تم (اختياري)..."
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                            disabled={loading}
                        />
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
                                    جاري المعالجة...
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
        </div>
    );
}
