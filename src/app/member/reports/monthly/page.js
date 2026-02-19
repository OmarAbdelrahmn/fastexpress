"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/context/LanguageContext";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiService } from '@/lib/api/apiService';
import Table from "@/components/Ui/Table";
import Card from "@/components/Ui/Card";
import Breadcrumbs from "@/components/Ui/Breadcrumbs";
import {
    BarChart2,
    Calendar,
    Clock,
    FileText,
    Users,
    AlertCircle,
    TrendingUp,
    UserCheck
} from "lucide-react";

export default function MemberMonthlyReportPage() {
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!year || !month) return;

            try {
                setLoading(true);
                const response = await ApiService.get(
                    `${API_ENDPOINTS.MEMBER.REPORTS_MONTHLY}?year=${year}&month=${month}`
                );
                setData(response);
            } catch (err) {
                console.error("Error fetching monthly report:", err);
                setError(err.message || t("common.loadError"));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [year, month, t]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e08911]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {t("common.error")}: {error}
                </div>
            </div>
        );
    }

    if (!data) return null;

    const breadcrumbs = [
        { label: t("navigation.dashboard"), path: "/member/dashboard" },
        { label: t("navigation.reports"), path: "/member/reports" },
        { label: t("navigation.monthlyReports") }
    ];

    const columns = [
        {
            header: "#",
            accessor: "riderId",
        },
        {
            header: t("vehicles.riderInfo"),
            accessor: "riderName",
            render: (row) => (
                <div>
                    <div className="font-medium text-gray-900">{row.riderName}</div>
                    <div className="text-sm text-gray-500">{row.workingId}</div>
                </div>
            )
        },
        {
            header: t("navigation.shifts"),
            accessor: "shiftCount",
        },
        {
            header: t("dashboard.member.hungerAcceptedMonth"), // Or close existing key
            accessor: "totalAcceptedOrders",
            render: (row) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {row.totalAcceptedOrders}
                </span>
            )
        },
        {
            header: t("dashboard.totalMonthOrders"), // Using generic total/rejected
            accessor: "totalRejectedOrders",
            render: (row) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {row.totalRejectedOrders}
                </span>
            )
        },
        {
            header: t("dashboard.member.totalWorkingHours") || "Total Hours",
            accessor: "totalWorkingHours",
            render: (row) => row.totalWorkingHours?.toFixed(2)
        },
        {
            header: t("dashboard.performanceRate") || "Avg/Shift",
            accessor: "averageOrdersPerShift",
            render: (row) => row.averageOrdersPerShift?.toFixed(2)
        },
    ];

    const colorVariants = {
        blue: { bg: "bg-blue-50", text: "text-blue-600" },
        green: { bg: "bg-green-50", text: "text-green-600" },
        purple: { bg: "bg-purple-50", text: "text-purple-600" },
        red: { bg: "bg-red-50", text: "text-red-600" },
        indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
        orange: { bg: "bg-orange-50", text: "text-orange-600" },
    };

    const StatCard = ({ title, value, icon: Icon, color, subValue = null }) => {
        const variant = colorVariants[color] || colorVariants.blue;

        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${variant.bg}`}>
                        <Icon className={`w-6 h-6 ${variant.text}`} />
                    </div>
                    {subValue && (
                        <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                            {subValue}
                        </span>
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
                    <p className="text-sm text-gray-500">{title}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 space-y-4 bg-gray-50/50 min-h-screen">
            <Breadcrumbs items={breadcrumbs} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {data.housingName}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{data.month}/{data.year}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Export or other actions could go here */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={t("dashboard.member.totalDayOrders")} // Using 'Total Orders' semantics
                    value={data.statistics.totalAcceptedOrders}
                    icon={FileText}
                    color="blue"
                    subValue={`Rejected: ${data.statistics.totalRejectedOrders}`}
                />
                <StatCard
                    title={t("navigation.shifts")}
                    value={data.statistics.totalShifts}
                    icon={Clock}
                    color="green"
                />
                <StatCard
                    title={t("dashboard.member.activeRiders")} // Using 'Active Riders' semantics for now
                    value={data.statistics.averageRidersPerDay}
                    icon={Users}
                    color="purple"
                    subValue="Avg / Day"
                />
                <StatCard
                    title={t("common.disabilities")}
                    value={data.statistics.totalDisabilities}
                    icon={AlertCircle}
                    color="red"
                />
                <StatCard
                    title="Total Hours"
                    value={data.statistics.totalWorkingHours?.toFixed(1)}
                    icon={TrendingUp}
                    color="indigo"
                />
                <StatCard
                    title={t("navigation.substitution")}
                    value={data.statistics.totalSubstitutions}
                    icon={UserCheck}
                    color="orange"
                />
            </div>

            <Card title={t("navigation.ridersReports")}>
                <div className="hidden md:block overflow-x-auto">
                    <Table
                        columns={columns}
                        data={data.riderPerformances || []}
                        loading={loading}
                    />
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {data.riderPerformances?.map((row, index) => (
                        <div key={index} className="bg-white border border-gray-100 rounded-xl p-2 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <Users size={16} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{row.riderName}</h3>
                                        <p className="text-xs text-gray-500">{row.workingId}</p>
                                    </div>
                                </div>
                                <div className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">
                                    {row.shiftCount} {t("navigation.shifts")}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="bg-green-50 p-2 rounded-lg text-center">
                                    <span className="block text-xs text-green-600 mb-1">{t("dashboard.member.hungerAcceptedMonth")}</span>
                                    <span className="font-bold text-green-700">{row.totalAcceptedOrders}</span>
                                </div>
                                <div className="bg-red-50 p-2 rounded-lg text-center">
                                    <span className="block text-xs text-red-600 mb-1">{t("dashboard.totalMonthOrders")}</span>
                                    <span className="font-bold text-red-700">{row.totalRejectedOrders}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-3">
                                <div className="flex items-center gap-1 text-gray-600">
                                    <Clock size={14} />
                                    <span>{row.totalWorkingHours?.toFixed(2)} hrs</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <TrendingUp size={14} />
                                    <span>{row.averageOrdersPerShift?.toFixed(2)} avg</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!data.riderPerformances?.length && (
                        <div className="text-center py-8 text-gray-500">
                            No riders found for this month.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
