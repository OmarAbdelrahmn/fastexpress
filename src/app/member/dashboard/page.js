"use client";

import { useEffect, useState } from "react";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
    Users,
    Car,
    Home,
    Clock,
    Activity,
    AlertTriangle,
    ArrowUp,
    Building2,
    CheckCircle,
    XCircle,
    ShoppingBag,
    Calendar
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function MemberDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await ApiService.get(API_ENDPOINTS.MEMBER.DASHBOARD);
                setData(response);
            } catch (err) {
                setError(err.message || t("common.loadError"));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [t]);

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

    const { housing, stats, recentActivities, summary } = data || {};
    const totalVehicles = (stats?.vehiclesAvailable || 0) + (stats?.vehiclesInUse || 0) + (stats?.problemVehicles || 0);
    const totalPeople = (stats?.totalEmployees || 0) + (stats?.activeRiders || 0) + (stats?.inactiveRiders || 0);

    return (
        <div className="min-h-screen bg-gradient-to-br p-6 md:p-14 space-y-8 animate-fade-in" dir="rtl">
            {/* Header Info */}
            <div>
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.member.title")}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm border border-blue-100">
                        <Clock size={16} color={COLORS.blue} />
                        <span>{new Date().toLocaleDateString('ar-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>
                <p className="text-gray-500 mt-1">{t("dashboard.member.subtitle")}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                {/* Row 1: Employee/Rider Stats */}
                <StatCard
                    title={t("dashboard.member.totalEmployees")}
                    value={stats?.totalEmployees || 0}
                    icon={Users}
                    color="#ffffffff"
                    link="#"
                    background="bg-gradient-to-r from-[#144CD5] to-[#00288A]"
                />
                <StatCard
                    title={t("dashboard.member.activeRiders")}
                    value={stats?.activeRiders || 0}
                    icon={CheckCircle}
                    color="#ffffffff"
                    link="#"
                    background="bg-gradient-to-r from-[#FFC52A] to-[#FF8A3D]"
                />
                <StatCard
                    title={t("dashboard.member.inactiveRiders")}
                    value={stats?.inactiveRiders || 0}
                    icon={XCircle}
                    color="#ffffffff"
                    link="#"
                    background="bg-gradient-to-r from-[#144CD5] to-[#00288A]"
                />

                {/* Row 2: Operational Stats */}
                <StatCard
                    title={t("dashboard.member.hungerAccepted")}
                    value={summary?.hunger?.acceptedOrders || 0}
                    icon={Activity}
                    color="#ffffffff"
                    link="#"
                    background="bg-gradient-to-r from-[#FFC52A] to-[#FF8A3D]"
                />
                <StatCard
                    title={t("dashboard.member.ketaAccepted")}
                    value={summary?.keta?.acceptedOrders || 0}
                    icon={Clock}
                    color="#ffffffff"
                    link="#"
                    background="bg-gradient-to-r from-[#144CD5] to-[#00288A]"
                />
                <StatCard
                    title={t("dashboard.member.totalDayOrders")}
                    value={summary?.totalDayOrders || 0}
                    icon={Clock}
                    color="#ffffffff"
                    link="#"
                    background="bg-gradient-to-r from-[#FFC52A] to-[#FF8A3D]"
                />

                {/* Row 3: Order Stats */}
                <StatCard
                    title={t("dashboard.member.hungerAcceptedMonth")}
                    value={summary?.hungerMonthToDate?.acceptedOrders || 0}
                    icon={ShoppingBag}
                    color="#ffffffff"
                    link="#"
                    background="bg-gradient-to-r from-[#144CD5] to-[#00288A]"
                />
                <StatCard
                    title={t("dashboard.member.ketaAcceptedMonth")}
                    value={summary?.ketaMonthToDate?.acceptedOrders || 0}
                    icon={ShoppingBag}
                    color="#ffffffff"
                    link="#"
                    background="bg-gradient-to-r from-[#FFC52A] to-[#FF8A3D]"
                />
                <StatCard
                    title={t("dashboard.member.totalMonthOrders")}
                    value={summary?.totalMonthOrders || 0}
                    icon={Calendar}
                    color="#ffffffff"
                    link="#"
                    background="bg-gradient-to-r from-[#144CD5] to-[#00288A]"
                />
            </div>

            {/* Housing Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Home className="text-blue-600" size={20} />
                        {t("dashboard.member.housingStatus")}
                    </h2>
                    {housing && (
                        <span className="text-sm font-medium px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                            {housing.name}
                        </span>
                    )}
                </div>

                {housing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-gray-500 mb-1">{t("dashboard.member.capacity")}</p>
                            <p className="text-2xl font-bold text-gray-900">{housing.capacity}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl">
                            <p className="text-sm text-blue-600 mb-1">{t("dashboard.member.currentOccupancy")}</p>
                            <p className="text-2xl font-bold text-blue-700">{housing.currentOccupancy}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl">
                            <p className="text-sm text-green-600 mb-1">{t("dashboard.member.availableSpace")}</p>
                            <p className="text-2xl font-bold text-green-700">{housing.availableSpace}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">{t("dashboard.member.noHousingInfo")}</p>
                )}
            </div>

            {/* Vehicles & Requests Section */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicles Breakdown */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Car size={20} color={COLORS.blue} />
                        {t("dashboard.member.vehiclesBreakdown")}
                    </h3>
                    <div className="space-y-2">
                        <MiniStatRow
                            label={t("vehicles.total")}
                            value={totalVehicles}
                            icon={Car}
                            color={COLORS.blue}
                        />
                        <MiniStatRow
                            label={t("dashboard.member.readyForDelivery")}
                            value={stats?.vehiclesAvailable || 0}
                            icon={CheckCircle}
                            color={COLORS.blue}
                        />
                        <MiniStatRow
                            label={t("dashboard.member.inService")}
                            value={stats?.vehiclesInUse || 0}
                            icon={Users}
                            color={COLORS.gray}
                        />
                        <MiniStatRow
                            label={t("dashboard.member.inMaintenance")}
                            value={stats?.problemVehicles || 0}
                            icon={AlertTriangle}
                            color={COLORS.orange}
                        />
                    </div>
                </div>

                {/* Employees & Riders Breakdown */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Users size={20} color={COLORS.blue} />
                        {t("navigation.employees")} & {t("navigation.riders")}
                    </h3>
                    <div className="space-y-6">
                        <MiniStatRow
                            label={t("dashboard.member.totalEmployees")}
                            value={stats?.totalEmployees || 0}
                            icon={Users}
                            color={COLORS.blue}
                        />
                        <MiniStatRow
                            label={t("dashboard.member.activeRiders")}
                            value={stats?.activeRiders || 0}
                            icon={CheckCircle}
                            color={COLORS.green}
                        />
                        <MiniStatRow
                            label={t("dashboard.member.inactive")}
                            value={stats?.inactiveRiders || 0}
                            icon={XCircle}
                            color={COLORS.red}
                        />
                    </div>
                </div>
            </div>
        </div>

    );
}

// Color Palette Constants
const COLORS = {
    blue: "#2563eb",   // blue-600
    orange: "#f97316", // orange-500
    gray: "#64748b",   // slate-500
    grayLight: "#94a3b8", // slate-400
    green: "#10b981",  // emerald-500
    red: "#ef4444",    // red-500
};

// Helper for background color with opacity (approx 10%)
const getBgStyle = (hex) => ({
    backgroundColor: `${hex}1A` // 1A is ~10% opacity in hex
});

const MiniStatRow = ({ label, value, icon: Icon, color }) => (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-100 transition-colors cursor-default group">
        <div className="flex items-center gap-2">
            <div className="p-2 rounded-md group-hover:bg-opacity-20 transition-all" style={getBgStyle(color)}>
                <Icon size={16} color={color} />
            </div>
            <span className="text-sm font-medium text-gray-600">{label}</span>
        </div>
        <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{value}</span>
    </div>
);

// Helper Components matching main dashboard style
const StatCard = ({ title, value, subtitle, icon: Icon, color, link, background, alert }) => {
    const iconColors = {
        blue: "text-blue-600 bg-blue-100",
        green: "text-green-600 bg-green-100",
        red: "text-red-600 bg-red-100",
        cyan: "text-cyan-600 bg-cyan-100",
        amber: "text-amber-600 bg-amber-100",
        teal: "text-teal-600 bg-teal-100",
        orange: "text-orange-600 bg-orange-100",
        purple: "text-purple-600 bg-purple-100",
        indigo: "text-indigo-600 bg-indigo-100",
        gray: "text-gray-600 bg-gray-100",
        white: "text-white bg-gray-100",
    };

    return (
        <Link href={link} className="block group">
            <div className={`rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden ${background} h-full`}>
                <div className="flex justify-between items-start mb-2">
                    <div className={`p-2 rounded-lg transition-colors ${iconColors[color] || iconColors.gray}`}>
                        <Icon size={20} />
                    </div>
                    {/* Subtle background decoration */}
                    <Icon className={`absolute -right-4 -bottom-4 opacity-5 transform rotate-12 transition-transform group-hover:scale-110`} size={80} />
                    {alert && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
                </div>

                <div className="relative z-10 ">
                    <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
                    <p className="font-medium text-white text-sm mb-1">{title}</p>
                    {subtitle && <p className="text-[10px] text-white">{subtitle}</p>}
                </div>
            </div>
        </Link>
    );
};

const QuickActionCard = ({ title, count, label, icon: Icon, href, color }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        orange: "bg-orange-50 text-orange-600"
    };

    return (
        <Link href={href} className="flex flex-col justify-between p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl transition-colors ${colorClasses[color]}`}>
                    <Icon size={24} className="text-current" />
                </div>
                <div className="text-right">
                    <span className="block text-2xl font-bold text-gray-900">{count}</span>
                    <span className="text-xs text-gray-500">{label || ''}</span>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="font-medium text-gray-700">{title}</span>
                <ArrowUp size={16} className="text-gray-300 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    )
}
