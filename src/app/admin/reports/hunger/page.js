"use client";

import PageHeader from "@/components/layout/pageheader";
import Link from "next/link";
import {
    Target,
    History,
    XCircle,
    LayoutList
} from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function HungerReportsPage() {
    const { t, language } = useLanguage();

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" >
            <PageHeader
                title={t('hunger.reportsTitle') || "تقارير هنقرستيشن"}
                subtitle={t('hunger.reportsSubtitle') || "مركز تقارير هنقرستيشن"}
                icon={Target}
            />

            <div className="max-w-7xl mx-auto px-6 p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    <Link
                        href="/admin/reports/hunger/summary"
                        className="group block p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-indigo-50"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                <Target className="text-indigo-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600">
                                {t('hunger.summaryReport') || "تقرير الملخص"}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            {t('hunger.summaryReportDesc') || "عرض ملخص الطلبات المستهدفة للشركة والمجموعات"}
                        </p>
                    </Link>

                    <Link
                        href="/admin/reports/hunger/rejection"
                        className="group block p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-indigo-50"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                <XCircle className="text-indigo-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600">
                                {t('reports.rejectionReports') || "تقرير الرفض"}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            {t('reports.rejectionReportsDesc') || "تقرير يوضح الطلبات المرفوضة"}
                        </p>
                    </Link>

                    <Link
                        href="/admin/reports/hunger/history"
                        className="group block p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-indigo-50"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                <History className="text-indigo-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600">
                                {t('reports.riderHistory') || "سجل المندوب"}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            {t('reports.riderHistoryDesc') || "عرض سجل الأداء للمندوب"}
                        </p>
                    </Link>

                    <Link
                        href="/admin/reports/hunger/detailed-daily-performance"
                        className="group block p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-indigo-50"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                <LayoutList className="text-indigo-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600">
                                {t('reports.detailedDailyPerformance') || "الأداء اليومي التفصيلي"}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            {t('reports.detailedDailyPerformanceDesc') || "عرض تفاصيل الأداء اليومي للمناديب"}
                        </p>
                    </Link>

                </div>
            </div>
        </div>
    );
}