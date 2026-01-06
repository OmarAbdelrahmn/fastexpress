"use client";

import { useState, useEffect } from "react";
import {
    BarChart3,
    Users,
    Package,
    Home,
    Calendar,
} from "lucide-react";
import PageHeader from "@/components/layout/pageheader";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function OtherReportsPage() {
    const { t } = useLanguage();

    const reportCategories = [
        {
            title: t('reports.periodReports'),
            icon: Calendar,
            color: "from-blue-500 to-blue-600",
            reports: [
                {
                    name: t('reports.monthlyReports'),
                    path: "/admin/reports/monthly",
                    desc: t('reports.monthlyReportsDesc'),
                },
                {
                    name: t('reports.yearlyReports'),
                    path: "/admin/reports/yearly",
                    desc: t('reports.yearlyReportsDesc'),
                },
                {
                    name: t('reports.customReports'),
                    path: "/admin/reports/custom-range",
                    desc: t('reports.customReportsDesc'),
                },
            ],
        },
        {
            title: t('reports.companyReports'),
            icon: Package,
            color: "from-green-500 to-green-600",
            reports: [
                {
                    name: t('reports.companyPerformance'),
                    path: "/admin/reports/company-performance",
                    desc: t('reports.companyPerformanceDesc'),
                },
                {
                    name: t('reports.compareCompanies'),
                    path: "/admin/reports/compare-company",
                    desc: t('reports.compareCompaniesDesc'),
                },
            ],
        },
        {
            title: t('reports.riderReports'),
            icon: Users,
            color: "from-purple-500 to-purple-600",
            reports: [
                {
                    name: t('reports.ridersReports'),
                    path: "/admin/reports/riders",
                    desc: t('reports.ridersReportsDesc'),
                },
                {
                    name: t('reports.compareRider'),
                    path: "/admin/reports/top-riders",
                    desc: t('reports.compareRiderDesc'),
                },
                {
                    name: t('reports.compareRiders'),
                    path: "/admin/reports/compare-riders",
                    desc: t('reports.compareRidersDesc'),
                },
                {
                    name: t('reports.topRidersByCompany'),
                    path: "/admin/reports/top-riders-company",
                    desc: t('reports.topRidersByCompanyDesc'),
                },
                {
                    name: t('reports.topRidersYearly.pageTitle'),
                    path: "/admin/reports/top-riders-yearly",
                    desc: t('reports.topRidersYearlyDesc'),
                },
                {
                    name: t('reports.topRidersMonthly'),
                    path: "/admin/reports/top-riders-monthly",
                    desc: t('reports.topRidersMonthlyDesc'),
                },
            ],
        },
        {
            title: t('reports.housingReports'),
            icon: Home,
            color: "from-orange-500 to-orange-600",
            reports: [
                {
                    name: t('reports.housingReport'),
                    path: "/admin/reports/housing",
                    desc: t('reports.housingReportDesc'),
                },
                {
                    name: t('reports.housingCompare'),
                    path: "/admin/reports/housing-compare",
                    desc: t('reports.housingCompareDesc'),
                },
                {
                    name: t('reports.housingRiderCompare'),
                    path: "/admin/reports/housing-rider-compare",
                    desc: t('reports.housingRiderCompareDesc'),
                },
            ],
        },
        {
            title: t('reports.otherReports'),
            icon: BarChart3,
            color: "from-red-500 to-red-600",
            reports: [
                {
                    name: t('reports.problemsReports'),
                    path: "/admin/reports/problems",
                    desc: t('reports.problemsReportsDesc'),
                },
                {
                    name: t('reports.stackedDeliveries'),
                    path: "/admin/reports/stacked",
                    desc: t('reports.stackedDeliveriesDesc'),
                },
            ],
        },
    ];

    return (
        <div
            className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100"
        >
            <PageHeader
                title="تقارير أخرى"
                subtitle="جميع التقارير المتاحة في النظام"
                icon={BarChart3}
            />

            {/* Report Categories */}
            <div className="m-6 space-y-6">
                {reportCategories.map((category, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-xl shadow-md overflow-hidden"
                    >
                        <div
                            className={`bg-gradient-to-r ${category.color} px-6 py-4 flex items-center gap-3`}
                        >
                            <category.icon className="text-white" size={28} />
                            <h2 className="text-xl font-bold text-white">{category.title}</h2>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {category.reports.map((report, reportIdx) => (
                                <Link
                                    key={reportIdx}
                                    href={report.path}
                                    className="group block p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all duration-200"
                                >
                                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 mb-2">
                                        {report.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">{report.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
