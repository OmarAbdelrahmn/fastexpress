"use client";

import { useEffect, useState } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { formatPlateNumber } from "@/lib/utils/formatters";
import Link from "next/link";
import {
    Bike,
    Calendar,
    MapPin,
    User,
    CheckCircle,
    AlertTriangle,
    Package,
    History,
    Search
} from "lucide-react";

export default function MemberVehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await ApiService.get(API_ENDPOINTS.MEMBER.VEHICLES);
                setVehicles(Array.isArray(response) ? response : []);
            } catch (err) {
                setError(err.message || "حدث خطأ أثناء تحميل البيانات");
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, []);

    // Filter vehicles based on search term
    const filteredVehicles = vehicles.filter(vehicle => {
        if (!searchTerm) return true;

        const search = searchTerm.toLowerCase();
        return (
            vehicle.vehicleNumber?.toLowerCase().includes(search) ||
            vehicle.vehicleType?.toLowerCase().includes(search) ||
            vehicle.plateNumberA?.toLowerCase().includes(search) ||
            vehicle.plateNumberE?.toLowerCase().includes(search) ||
            vehicle.manufacturer?.toLowerCase().includes(search) ||
            vehicle.manufactureYear?.toString().includes(search) ||
            vehicle.location?.toLowerCase().includes(search) ||
            vehicle.assignedRiderName?.toLowerCase().includes(search) ||
            vehicle.assignedRiderIqamaNo?.toString().includes(search)
        );
    });

    // Calculate statistics based on filtered data
    const stats = {
        totalVehicles: filteredVehicles?.length || 0,
        assigned: filteredVehicles?.filter(v => v.assignedRiderIqamaNo)?.length || 0,
        available: filteredVehicles?.filter(v => !v.assignedRiderIqamaNo)?.length || 0,
        withStatus: filteredVehicles?.length - (filteredVehicles?.filter(v => v.assignedRiderIqamaNo)?.length + filteredVehicles?.filter(v => !v.assignedRiderIqamaNo)?.length)
    };

    const getStatusBadge = (currentStatus) => {
        if (!currentStatus) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Clock size={12} />
                    غير محدد
                </span>
            );
        }

        switch (currentStatus.toLowerCase()) {
            case 'returned':
            case 'متاح':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} />
                        متاح
                    </span>
                );
            case 'taken':
            case 'مستخدمة':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <User size={12} />
                        قيد الاستخدام
                    </span>
                );
            case 'maintenance':
            case 'صيانة':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <Wrench size={12} />
                        صيانة
                    </span>
                );
            case 'problem':
            case 'مشكلة':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle size={12} />
                        مشكلة
                    </span> 
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {currentStatus}
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
            <AlertTriangle size={20} />
            <span>{error}</span>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">المركبات</h1>
                    <p className="text-gray-500">عرض وإدارة المركبات المخصصة</p>
                </div>
            </div>            

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="إجمالي المركبات"
                    value={stats.totalVehicles}
                    icon={Bike}
                    color="#3B82F6"
                    background="bg-blue-200"
                />
                <StatCard
                    title="مخصصة"
                    value={stats.assigned}
                    icon={User}
                    color="#10B981"
                    background="bg-green-200"
                />
                <StatCard
                    title="متاحة"
                    value={stats.available}
                    icon={CheckCircle}
                    color="#525252ff"
                    background="bg-gray-200"
                />
                <StatCard
                    title="بحالة خاصة"
                    value={stats.withStatus}
                    icon={Package}
                    color="#F59E0B"
                    background="bg-orange-200"
                />
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="بحث في المركبات (رقم المركبة، اللوحة، الشركة المصنعة، الموقع، المندوب...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
            {/* Vehicles Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Bike className="text-blue-600" size={20} />
                        قائمة المركبات
                        <span className="text-sm font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                            {vehicles?.length || 0}
                        </span>
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    رقم المركبة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    النوع
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    رقم اللوحة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الشركة المصنعة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    سنة الصنع
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    انتهاء الرخصة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الموقع
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    المندوب
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الإجراءات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredVehicles?.length > 0 ? (
                                filteredVehicles.map((vehicle, index) => (
                                    <tr key={`${vehicle.vehicleNumber}-${index}`} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                            {vehicle.vehicleNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Bike size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-700">{vehicle.vehicleType}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900">{formatPlateNumber(vehicle.plateNumberA)}</p>
                                                <p className="text-gray-500 text-xs">{vehicle.plateNumberE}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {vehicle.manufacturer}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {vehicle.manufactureYear}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-700">{vehicle.licenseExpiryDate || 'غير محدد'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-700">{vehicle.location || 'غير محدد'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {vehicle.assignedRiderName ? (
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">{vehicle.assignedRiderName}</p>
                                                    <p className="text-gray-500 text-xs">{vehicle.assignedRiderIqamaNo}</p>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">غير مخصص</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/member/vehicles/history?vehicleNumber=${encodeURIComponent(vehicle.vehicleNumber)}`}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                                            >
                                                <History size={14} />
                                                تاريخ المركبة
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        {searchTerm ? 'لا توجد نتائج تطابق البحث' : 'لا توجد مركبات متاحة'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
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
