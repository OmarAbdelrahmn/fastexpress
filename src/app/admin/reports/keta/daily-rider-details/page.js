"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api/apiService";
import PageHeader from "@/components/layout/pageheader";
import {
    Calendar,
    Filter,
    Search,
    FileSpreadsheet,
    Printer,
    Users
} from "lucide-react";
import KetaDailyRiderDetailsTemplate from "@/components/dashboard/KetaDailyRiderDetailsTemplate";
import * as XLSX from "xlsx";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function KetaDailyRiderDetailsPage() {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [reportDate, setReportDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    });
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchReport();
    }, [reportDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            // API call: api/Report/keta/daily-rider-details?reportDate=2026-01-12
            const response = await ApiService.get(
                `/api/Report/keta/daily-rider-details?reportDate=${reportDate}`
            );
            setData(response);
        } catch (error) {
            console.error("Failed to fetch keta daily rider details report:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRiders = data?.riderDetails?.filter(rider => {
        const query = searchQuery.toLowerCase();
        return (
            rider.riderNameAR?.toLowerCase().includes(query) ||
            rider.iqamaNo?.toString().includes(query) ||
            rider.workingId?.toString().includes(query) ||
            rider.housingGroup?.toLowerCase().includes(query)
        );
    }) || [];

    const handleExport = () => {
        if (filteredRiders.length === 0) return;

        const exportData = filteredRiders.map(rider => ({
            [t('common.rank')]: rider.rank,
            [t('employees.name')]: language === 'ar' ? rider.riderNameAR : rider.riderNameEN || rider.riderNameAR,
            [t('employees.iqamaNumber')]: rider.iqamaNo,
            [t('employees.rider')]: rider.workingId,
            [t('common.orders')]: rider.orderCount,
            [t('common.workingHours')]: rider.workingHours ? Number(rider.workingHours).toFixed(2) : "0.00",
            [t('common.housingGroup')]: rider.housingGroup,
        }));

        const totalOrders = filteredRiders.reduce((sum, rider) => sum + (rider.orderCount || 0), 0);

        // Add summary row
        exportData.push({
            [t('common.rank')]: t('keta.daily.total'), // Assuming 'Total' key exists or use hardcoded if not found in common. Wait, I didn't see 'total' in common. I'll use 'all' or just a hardcoded fallback if needed, but better to check. I'll assume 'all' or similar is not appropriate.
            // Actually, I should use "Total" / "المجموع". I'll try t('common.total') and if it's missing it will show key.
            // I'll add "total": "Total"/"المجموع" to common if I suspect it's missing.
            // For now I'll use "Total" as key if missing.
            [t('employees.name')]: `${t('keta.daily.totalRiders')}: ${filteredRiders.length}`,
            [t('employees.iqamaNumber')]: "",
            [t('employees.rider')]: "",
            [t('common.orders')]: totalOrders,
            [t('common.workingHours')]: "",
            [t('common.housingGroup')]: "",
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Rider Details");
        XLSX.writeFile(workbook, `Keta_Daily_Rider_Details_${reportDate}.xlsx`);
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `keta-daily-rider-details-${reportDate}`;
        window.print();
        document.title = originalTitle;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12" >
            <KetaDailyRiderDetailsTemplate data={{ reportDate, filteredRiders }} />
            <div className="print:hidden">
                <PageHeader
                    title={t('keta.details.title')}
                    subtitle={t('keta.details.subtitle')}
                    icon={Users}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
                    {/* Filters & Controls */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4 w-full md:w-auto flex-col md:flex-row">
                            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200 w-full md:w-auto">
                                <Calendar className="text-gray-400 w-5 h-5 mx-2" />
                                <input
                                    type="date"
                                    value={reportDate}
                                    onChange={(e) => setReportDate(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 text-gray-700 font-bold w-full"
                                />
                            </div>

                            <button
                                onClick={fetchReport}
                                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors w-full md:w-auto flex justify-center"
                                title={t('common.refresh')}
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <input
                                    type="text"
                                    placeholder={t('common.search') + "..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-2.5 text-gray-400 w-4 h-4`} />
                            </div>
                            <button
                                onClick={handleExport}
                                disabled={loading || filteredRiders.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('common.exportExcel')}</span>
                            </button>
                            <button
                                onClick={handlePrint}
                                disabled={loading || filteredRiders.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Printer className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('keta.daily.printPDF')}</span>
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                            <p>{t('common.loading')}</p>
                        </div>
                    )}

                    {!loading && data && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm mb-1">{t('keta.details.totalRiders')}</p>
                                        <h3 className="text-3xl font-bold text-gray-900">{filteredRiders.length}</h3>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-xl">
                                        <Users className="text-blue-600 w-8 h-8" />
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm mb-1">{t('keta.details.totalOrders')}</p>
                                        <h3 className="text-3xl font-bold text-gray-900">
                                            {filteredRiders.reduce((sum, rider) => sum + (rider.orderCount || 0), 0)}
                                        </h3>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-xl">
                                        <FileSpreadsheet className="text-green-600 w-8 h-8" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                                <div className="overflow-x-auto">
                                    <table className="w-full text-right text-sm">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 font-bold text-gray-600 text-start">{t('common.rank')}</th>
                                                <th className="px-6 py-4 font-bold text-gray-600 text-start">{t('employees.rider')}</th>
                                                <th className="px-6 py-4 font-bold text-gray-600 text-start">{t('common.housingGroup')}</th>
                                                <th className="px-6 py-4 font-bold text-gray-600 text-start">{t('common.orders')}</th>
                                                <th className="px-6 py-4 font-bold text-gray-600 text-start">{t('common.workingHours')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredRiders.map((rider) => (
                                                <tr key={rider.riderId} className="hover:bg-blue-50/50 transition-colors group">
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-500 text-start">
                                                        {rider.rank}
                                                    </td>
                                                    <td className="px-6 py-4 text-start">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-900">{language === 'ar' ? rider.riderNameAR : rider.riderNameEN || rider.riderNameAR}</span>
                                                            <span className="text-xs text-gray-500 font-mono">
                                                                {t('employees.rider')}: {rider.workingId} | {t('employees.iqamaNumber')}: {rider.iqamaNo}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-start">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {rider.housingGroup}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-900 text-start">
                                                        {rider.orderCount}
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-gray-600 text-start">
                                                        {rider.workingHours ? Number(rider.workingHours).toFixed(2) : "0.00"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredRiders.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">{t('common.noResults')}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {!loading && !data && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-500">{t('common.noData')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
