"use client";

import { useEffect, useState } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
    Users,
    Home,
    User,
    AlertTriangle,
    Building2,
    MapPin,
    IdCard,
    Briefcase,
    CheckCircle,
    XCircle
} from "lucide-react";

export default function MemberProfile() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await ApiService.get(API_ENDPOINTS.MEMBER.DETAILS);
                setData(response);
            } catch (err) {
                setError(err.message || "حدث خطأ أثناء تحميل البيانات");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

    const { name, address, capacity, currentOccupancy, managerIqamaNo, managerName, employees } = data || {};
    const availableSpace = capacity - currentOccupancy;
    const occupancyPercentage = capacity ? Math.round((currentOccupancy / capacity) * 100) : 0;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">بياناتي</h1>
                <p className="text-gray-500">معلومات السكن والموظفين</p>
            </div>

            {/* Housing Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="السعة"
                    value={capacity || 0}
                    icon={Building2}
                    color="#6B7280"
                    background="bg-gray-200"
                />
                <StatCard
                    title="الإشغال الحالي"
                    value={currentOccupancy || 0}
                    subtitle={`${occupancyPercentage}%`}
                    icon={Users}
                    color="#3B82F6"
                    background="bg-blue-200"
                />
                <StatCard
                    title="المساحة المتاحة"
                    value={availableSpace || 0}
                    icon={Home}
                    color="#10B981"
                    background="bg-green-200"
                />
                <StatCard
                    title="إجمالي الموظفين"
                    value={employees?.length || 0}
                    icon={Users}
                    color="#F59E0B"
                    background="bg-orange-200"
                />
            </div>

            {/* Housing Details Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-blue-50">
                        <Home className="text-blue-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{name}</h2>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin size={14} />
                            {address}
                        </p>
                    </div>
                </div>

                {/* Manager Info */}
                {managerName && (
                    <div className="bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <User className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">مدير السكن</p>
                                <p className="font-bold text-gray-900">{managerName}</p>
                                <p className="text-xs text-gray-600 flex items-center gap-1">
                                    <IdCard size={12} />
                                    {managerIqamaNo}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Employees Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-blue-600" size={20} />
                        قائمة الموظفين
                        <span className="text-sm font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                            {employees?.length || 0}
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
                                    المسمى الوظيفي
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    رقم العمل
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الحالة
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {employees?.length > 0 ? (
                                employees.map((employee, index) => (
                                    <tr key={employee.iqamaNo} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {employee.iqamaNo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {employee.nameAR}
                                                </p>
                                                {employee.isRider && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                        مندوب
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Briefcase size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-700">{employee.jobTitle}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {employee.workingId || <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {employee.status === 'enable' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle size={12} />
                                                    نشط
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <XCircle size={12} />
                                                    غير نشط
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        لا يوجد موظفين
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
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
