"use client";

import PageHeader from "@/components/layout/pageheader";
import Link from "next/link";
import {
    LayoutList,
    Users,
    BarChart3,
    ArrowRight,
    FileCheck,
    XCircle,
    AlertCircle
} from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function KetaReportsPage() {
    const { t, language } = useLanguage();

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100" >
            <PageHeader
                title={t('keta.reportsTitle')}
                subtitle={t('keta.reportsSubtitle')}
                icon={LayoutList}
            />

            <div className="max-w-7xl mx-auto px-6 p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

                    <Link
                        href="/admin/reports/keta-validation"
                        className="group block p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-indigo-50"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                <FileCheck className="text-indigo-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600">
                                {t('keta.validationReport')}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            {t('keta.validationReportDesc')}
                        </p>
                    </Link>

                    <Link
                        href="/admin/reports/keta/daily-summary"
                        className="group block p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-indigo-50"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                <LayoutList className="text-indigo-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600">
                                {t('keta.dailySummary')}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            {t('keta.dailySummaryDesc')}
                        </p>
                    </Link>

                    <Link
                        href="/admin/reports/keta/daily-rider-details"
                        className="group block p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-indigo-50"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                <Users className="text-indigo-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600">
                                {t('keta.riderDetails')}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            {t('keta.riderDetailsDesc')}
                        </p>
                    </Link>

                    <Link
                        href="/admin/reports/keta/cumulative-stats"
                        className="group block p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-indigo-50"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                <BarChart3 className="text-indigo-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600">
                                {t('keta.cumulativeStats')}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            {t('keta.cumulativeStatsDesc')}
                        </p>
                    </Link>

                    <Link
                        href="/admin/reports/keta/rejection"
                        className="group block p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-indigo-50"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                <XCircle className="text-indigo-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600">
                                {t('keta.rejectionReport')}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            {t('keta.rejectionReportDesc')}
                        </p>
                    </Link>

                    <Link
                        href="/admin/reports/keta/declined"
                        className="group block p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-indigo-50"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                <AlertCircle className="text-indigo-600" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600">
                                {t('keta.declinedOrdersReport')}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            {t('keta.declinedOrdersReportDesc')}
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
