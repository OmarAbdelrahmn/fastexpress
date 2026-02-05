"use client";

import { useEffect, useState } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { formatPlateNumber } from "@/lib/utils/formatters";
import * as XLSX from 'xlsx';
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
    Search,
    Download,
    Wrench
} from "lucide-react";

export default function MemberVehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

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

    // Filter vehicles based on search term and status
    const filteredVehicles = vehicles.filter(vehicle => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || (
            vehicle.vehicleNumber?.toLowerCase().includes(search) ||
            vehicle.vehicleType?.toLowerCase().includes(search) ||
            vehicle.plateNumberA?.toLowerCase().includes(search) ||
            vehicle.plateNumberE?.toLowerCase().includes(search) ||
            vehicle.manufacturer?.toLowerCase().includes(search) ||
            vehicle.manufactureYear?.toString().includes(search) ||
            vehicle.location?.toLowerCase().includes(search) ||
            vehicle.assignedRiderName?.toLowerCase().includes(search) ||
            vehicle.assignedRiderNameE?.toLowerCase().includes(search) ||
            vehicle.assignedRiderIqamaNo?.toString().includes(search) ||
            vehicle.currentStatus?.toLowerCase().includes(search)
        );

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'returned' && vehicle.currentStatus?.toLowerCase() === 'returned') ||
            (statusFilter === 'taken' && vehicle.currentStatus?.toLowerCase() === 'taken') ||
            (statusFilter === 'problem' && vehicle.currentStatus?.toLowerCase() === 'problem');

        return matchesSearch && matchesStatus;
    });

    // Calculate statistics based on full data
    const stats = {
        total: vehicles.length,
        returned: vehicles.filter(v => v.currentStatus?.toLowerCase() === 'returned').length,
        taken: vehicles.filter(v => v.currentStatus?.toLowerCase() === 'taken').length,
        problem: vehicles.filter(v => v.currentStatus?.toLowerCase() === 'problem').length
    };

    const handleExportExcel = () => {
        // Prepare data for Excel
        const excelData = filteredVehicles.map(vehicle => ({
            'رقم اللوحة': formatPlateNumber(vehicle.plateNumberA),
            'الشركة المصنعة': vehicle.manufacturer,
            'سنة الصنع': vehicle.manufactureYear,
            'انتهاء الرخصة': vehicle.licenseExpiryDate || 'غير محدد',
            'المندوب (عربي)': vehicle.assignedRiderName || 'غير مخصص',
            'المندوب (إنجليزي)': vehicle.assignedRiderNameE || 'غير مخصص',
            'رقم الإقامة': vehicle.assignedRiderIqamaNo || '',
            'الحالة': vehicle.currentStatus || 'غير محدد'
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'المركبات');

        // Generate Excel file and download
        XLSX.writeFile(workbook, `vehicles_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const getStatusBadge = (currentStatus) => {
        if (!currentStatus) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
                    value={stats.total}
                    icon={Bike}
                    color="#3B82F6"
                    background="bg-blue-200"
                />
                <StatCard
                    title="متاحة"
                    value={stats.returned}
                    icon={CheckCircle}
                    color="#10B981"
                    background="bg-green-200"
                />
                <StatCard
                    title="قيد الاستخدام"
                    value={stats.taken}
                    icon={User}
                    color="#525252ff"
                    background="bg-gray-200"
                />
                <StatCard
                    title="صيانة"
                    value={stats.problem}
                    icon={Wrench}
                    color="#F59E0B"
                    background="bg-orange-200"
                />
            </div>

            {/* Search Bar */}
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

            {/* Filters and Export */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    <FilterButton
                        label="الكل"
                        active={statusFilter === 'all'}
                        onClick={() => setStatusFilter('all')}
                        count={stats.total}
                    />
                    <FilterButton
                        label="متاح"
                        active={statusFilter === 'returned'}
                        onClick={() => setStatusFilter('returned')}
                        count={stats.returned}
                        color="green"
                    />
                    <FilterButton
                        label="قيد الاستخدام"
                        active={statusFilter === 'taken'}
                        onClick={() => setStatusFilter('taken')}
                        count={stats.taken}
                        color="blue"
                    />
                    <FilterButton
                        label="مشكلة"
                        active={statusFilter === 'problem'}
                        onClick={() => setStatusFilter('problem')}
                        count={stats.problem}
                        color="red"
                    />
                </div>

                <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Download size={20} />
                    <span>تصدير Excel</span>
                </button>
            </div>

            {/* Vehicles Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Bike className="text-blue-600" size={20} />
                        قائمة المركبات
                        <span className="text-sm font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                            {filteredVehicles?.length || 0}
                        </span>
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
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
                                    المندوب
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الحالة
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
                                            {vehicle.assignedRiderName ? (
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">{vehicle.assignedRiderName}</p>
                                                    <p className="text-gray-500 text-xs">{vehicle.assignedRiderNameE}</p>
                                                    <p className="text-gray-500 text-xs">{vehicle.assignedRiderIqamaNo}</p>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">غير مخصص</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(vehicle.currentStatus)}
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
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
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

const FilterButton = ({ label, active, onClick, count, color = 'blue' }) => {
    const activeClasses = {
        blue: "bg-blue-600 text-white border-blue-600",
        green: "bg-green-600 text-white border-green-600",
        red: "bg-red-600 text-white border-red-600",
        orange: "bg-orange-500 text-white border-orange-500",
    };

    return (
        <button
            onClick={onClick}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium
                ${active
                    ? activeClasses[color] || activeClasses.blue
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }
            `}
        >
            <span>{label}</span>
            {count !== undefined && (
                <span className={`
                    px-2 py-0.5 rounded-full text-xs
                    ${active ? "bg-white/20" : "bg-gray-100 text-gray-600"}
                `}>
                    {count}
                </span>
            )}
        </button>
    );
};

