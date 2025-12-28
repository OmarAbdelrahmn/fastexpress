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
    Building2
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

    const { housing, stats, recentActivities } = data || {};

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Info */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.member.title")}</h1>
                <p className="text-gray-500">{t("dashboard.member.subtitle")}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={t("dashboard.member.totalEmployees")}
                    value={stats?.totalEmployees || 0}
                    icon={Users}
                    color="blue"
                    link="/member/employees"
                    background="bg-gray-300"
                />
                <StatCard
                    title={t("dashboard.member.activeRiders")}
                    value={stats?.activeRiders || 0}
                    subValue={(stats?.inactiveRiders || 0) + " " + t("dashboard.member.inactive")}
                    icon={Car}
                    color="gray"
                    link="/member/riders"
                    background="bg-blue-200"
                />
                <StatCard
                    title={t("dashboard.member.vehiclesInUse")}
                    value={stats?.vehiclesInUse || 0}
                    subValue={(stats?.totalVehicles || 0) + " " + t("dashboard.member.totalVehicles")}
                    icon={Activity}
                    color="blue"
                    link="/member/vehicles"
                    background="bg-gray-300"
                />
                <StatCard
                    title={t("dashboard.member.pendingRequests")}
                    value={stats?.pendingRequests || 0}
                    icon={Clock}
                    color="gray"
                    link="/member/requests"
                    background="bg-blue-200"
                    alert={stats?.pendingRequests > 0}
                />
            </div>

            {/* Housing and Quick Actions Section */}
            <div className="space-y-6">
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

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">

                    <QuickActionCard
                        title={t("dashboard.member.vehicles")}
                        count={stats?.vehiclesAvailable || 0}
                        label={t("dashboard.member.available")}
                        icon={Car}
                        href="/member/vehicles"
                        color="blue"
                    />
                    <QuickActionCard
                        title={t("dashboard.member.requests")}
                        count={stats?.pendingRequests || 0}
                        icon={Clock}
                        href="/member/requests"
                        color="orange"
                    />
                </div>
            </div>
        </div>
    );
}

// Helper Components matching main dashboard style
const StatCard = ({ title, value, subtitle, icon: Icon, color, link, background }) => (
    <Link href={link} className="block group">
        <div className={`rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden ${background} h-full`}>
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-lg transition-colors" style={getBgStyle(color)}>
                    <Icon size={20} color={color} />
                </div>
                {/* Subtle background decoration */}
                <Icon className="absolute -right-4 -bottom-4 opacity-5 transform rotate-12 transition-transform group-hover:scale-110" size={80} color={color} />
            </div>

            <div className="relative z-10 ">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
                <p className="font-medium text-gray-700 text-sm mb-1">{title}</p>
                <p className="text-[10px] text-gray-500">{subtitle}</p>
            </div>
        </div>
    </Link>
);

const getBgStyle = (hex) => ({
    backgroundColor: `${hex}1A` // 1A is ~10% opacity in hex
});

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
