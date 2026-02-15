"use client";

import { useEffect, useState } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { formatPlateNumber } from "@/lib/utils/formatters";
import * as XLSX from 'xlsx';
import {
    Users,
    Car,
    Phone,
    IdCard,
    Briefcase,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Building2,
    Search,
    Download,
    Edit,
    loading
} from "lucide-react";
import EditCompanyModal from "./EditCompanyModal";

export default function MemberRiders() {
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedRiderForEdit, setSelectedRiderForEdit] = useState(null);

    useEffect(() => {
        const fetchRiders = async () => {
            try {
                const response = await ApiService.get(API_ENDPOINTS.MEMBER.RIDERS);
                setRiders(response);
            } catch (err) {
                setError(err.message || "حدث خطأ أثناء تحميل البيانات");
            } finally {
                setLoading(false);
            }
        };

        fetchRiders();
    }, []);

    const refreshRiders = async () => {
        try {
            const response = await ApiService.get(API_ENDPOINTS.MEMBER.RIDERS);
            setRiders(response);
        } catch (err) {
            console.error("Failed to refresh riders:", err);
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

    // Filter riders based on search term and status
    const filteredRiders = riders.filter(rider => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || (
            rider.employeeIqamaNo?.toString().includes(search) ||
            rider.nameAR?.toLowerCase().includes(search) ||
            rider.nameEN?.toLowerCase().includes(search) ||
            rider.workingId?.toString().includes(search) ||
            rider.companyName?.toLowerCase().includes(search) ||
            rider.vehiclePlate?.toLowerCase().includes(search) ||
            rider.vehicleNumber?.toLowerCase().includes(search) ||
            rider.phone?.includes(search) ||
            rider.status?.toLowerCase().includes(search)
        );

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active' && rider.status?.toLowerCase() === 'enable') ||
            (statusFilter === 'inactive' && rider.status?.toLowerCase() === 'disable') ||
            (statusFilter === 'sick' && rider.status?.toLowerCase() === 'sick') ||
            (statusFilter === 'accident' && rider.status?.toLowerCase() === 'accident') ||
            (statusFilter === 'vacation' && rider.status?.toLowerCase() === 'vacation');

        return matchesSearch && matchesStatus;
    });

    // Calculate statistics based on full data
    const stats = {
        total: riders.length,
        active: riders.filter(r => r.status?.toLowerCase() === 'enable').length,
        other: riders.length - riders.filter(r => r.status?.toLowerCase() === 'enable').length,
        inactive: riders.filter(r => r.status?.toLowerCase() === 'disable').length,
        sick: riders.filter(r => r.status?.toLowerCase() === 'sick').length,
        accident: riders.filter(r => r.status?.toLowerCase() === 'accident').length,
        vacation: riders.filter(r => r.status?.toLowerCase() === 'vacation').length,
        companies: new Set(riders.map(r => r.companyName)).size,
        withHousing: riders.filter(r => r.housingAddress).length,
        hunger: riders.filter(r => r.companyName === 'Hunger').length,
        keta: riders.filter(r => r.companyName === 'Keta').length
    };

    const handleExportExcel = () => {
        // Prepare data for Excel
        const excelData = filteredRiders.map(rider => ({
            'رقم الإقامة': rider.employeeIqamaNo,
            'الاسم (عربي)': rider.nameAR,
            'الاسم (إنجليزي)': rider.nameEN,
            'رقم العمل': rider.workingId,
            'الشركة': rider.companyName,
            'المركبة': rider.vehiclePlate ? formatPlateNumber(rider.vehiclePlate) : '',
            'رقم اللوحة': rider.vehicleNumber || '',
            'الجوال': rider.phone,
            'الحالة': rider.status,
            'سبب تغيير الحالة': rider.statusChangeReason || ''
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'المناديب');

        // Generate Excel file and download
        XLSX.writeFile(workbook, `riders_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'enable':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} />
                        نشط
                    </span>
                );
            case 'disable':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle size={12} />
                        غير نشط
                    </span>
                );
            case 'fleeing':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                        <AlertTriangle size={12} />
                        هارب
                    </span>
                );
            case 'vacation':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        إجازة
                    </span>
                );
            case 'accident':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <AlertTriangle size={12} />
                        حادث
                    </span>
                );
            case 'sick':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <AlertTriangle size={12} />
                        مريض
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status || 'غير محدد'}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">المناديب</h1>
                <p className="text-gray-500">قائمة جميع المناديب والمعلومات المتعلقة بهم</p>
            </div>


            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="إجمالي المناديب"
                    value={stats.total}
                    icon={Users}
                    color="#3B82F6"
                    background="bg-blue-200"
                />
                <StatCard
                    title="المناديب النشطون"
                    value={stats.active}
                    icon={CheckCircle}
                    color="#10B981"
                    background="bg-green-200"
                />
                <StatCard
                    title="Hunger"
                    value={stats.hunger}
                    icon={Building2}
                    color="#F59E0B"
                    background="bg-orange-200"
                />
                <StatCard
                    title="Keta"
                    value={stats.keta}
                    icon={Building2}
                    color="#6B7280"
                    background="bg-gray-200"
                />
            </div>
            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="بحث في المناديب (الإقامة، الاسم، رقم العمل، الشركة، المركبة، الجوال...)"
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
                        label="نشط"
                        active={statusFilter === 'active'}
                        onClick={() => setStatusFilter('active')}
                        count={stats.active}
                        color="green"
                    />
                    <FilterButton
                        label="غير نشط"
                        active={statusFilter === 'inactive'}
                        onClick={() => setStatusFilter('inactive')}
                        count={stats.inactive}
                        color="red"
                    />
                    <FilterButton
                        label="مريض"
                        active={statusFilter === 'sick'}
                        onClick={() => setStatusFilter('sick')}
                        count={stats.sick}
                        color="yellow"
                    />
                    <FilterButton
                        label="حادث"
                        active={statusFilter === 'accident'}
                        onClick={() => setStatusFilter('accident')}
                        count={stats.accident}
                        color="orange"
                    />
                    <FilterButton
                        label="إجازة"
                        active={statusFilter === 'vacation'}
                        onClick={() => setStatusFilter('vacation')}
                        count={stats.vacation}
                        color="blue"
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

            {/* Riders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-blue-600" size={20} />
                        قائمة المناديب
                        <span className="text-sm font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                            {filteredRiders?.length || 0}
                        </span>
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    رقم الإقامة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الاسم
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    رقم العمل
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الشركة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    المركبة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الجوال
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الحالة
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    إجراءات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredRiders?.length > 0 ? (
                                filteredRiders.map((rider) => (
                                    <tr key={rider.riderId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {rider.employeeIqamaNo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-gray-900">
                                                {rider.nameAR}
                                            </p>
                                            <p className="text-xs text-gray-500">{rider.nameEN}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <IdCard size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-700">{rider.workingId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={14} className="text-gray-400" />
                                                <span className={`text-sm font-medium ${rider.companyName === 'Hunger' ? 'text-orange-600' : 'text-gray-600'}`}>
                                                    {rider.companyName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {rider.vehiclePlate ? (
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Car size={14} className="text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-900">{formatPlateNumber(rider.vehiclePlate)}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">{rider.vehicleNumber}</p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">لا يوجد</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-gray-400" />
                                                <a href={`tel:${rider.phone}`} className="text-sm text-blue-600 hover:underline">
                                                    {rider.phone}
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(rider.status)}
                                            {rider.status?.toLowerCase() !== 'enable' && rider.statusChangeReason && (
                                                <p className="text-xs text-gray-500 mt-1 max-w-[150px] truncate" title={rider.statusChangeReason}>
                                                    {rider.statusChangeReason}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => setSelectedRiderForEdit(rider)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                title="تعديل الشركة"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                        {searchTerm ? 'لا توجد نتائج تطابق البحث' : 'لا يوجد مناديب'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Company Modal */}
            <EditCompanyModal
                isOpen={!!selectedRiderForEdit}
                onClose={() => setSelectedRiderForEdit(null)}
                rider={selectedRiderForEdit}
                onSuccess={refreshRiders}
            />
        </div>
    );
}

// Reusable StatCard component
const StatCard = ({ title, value, subtitle, icon: Icon, color, background }) => {
    return (
        <div className={`rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 ${background} h-full`}>
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-lg transition-colors bg-white/50">
                    <Icon size={20} style={{ color: color }} />
                </div>
            </div>
            <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
                <p className="font-medium text-gray-700 text-sm mb-1">{title}</p>
                {subtitle && <p className="text-[10px] text-gray-500">{subtitle}</p>}
            </div>
        </div>
    );
}

const FilterButton = ({ label, active, onClick, count, color = 'blue' }) => {
    const activeClasses = {
        blue: "bg-blue-600 text-white border-blue-600",
        green: "bg-green-600 text-white border-green-600",
        red: "bg-red-600 text-white border-red-600",
        rose: "bg-rose-600 text-white border-rose-600",
        yellow: "bg-yellow-500 text-white border-yellow-500",
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
