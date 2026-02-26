"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api/apiService";
import PageHeader from "@/components/layout/pageheader";
import {
    FileCheck,
    Users,
    CheckCircle,
    XCircle,
    Briefcase,
    HelpCircle,
    Calendar,
    Filter,
    Search,
    FileSpreadsheet
} from "lucide-react";
import * as XLSX from "xlsx";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function KetaYearlyValidationPage() {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const currentDate = new Date();
    const [year, setYear] = useState(currentDate.getFullYear());

    useEffect(() => {
        fetchReport();
    }, [year]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get(
                `/api/KetaValidation?year=${year}`
            );
            setData(response);
        } catch (error) {
            console.error("Failed to fetch keta yearly validation report:", error);
        } finally {
            setLoading(false);
        }
    };

    const availableYears = data?.availableYears || [currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1];

    const filteredRiders = data?.riders?.filter(rider => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase().trim();

        return (
            rider.nameAR?.toLowerCase().includes(query) ||
            rider.nameEN?.toLowerCase().includes(query) ||
            rider.workingId?.toString().includes(query) ||
            rider.iqamaNo?.toString().includes(query) ||
            rider.companyName?.toLowerCase().includes(query)
        );
    }) || [];

    const handleExport = () => {
        if (filteredRiders.length === 0) return;

        const exportData = filteredRiders.map(rider => {
            const rowData = {
                [t('employees.iqamaNumber')]: rider.iqamaNo,
                [t('employees.nameArabic')]: rider.nameAR,
                [t('employees.nameEnglish')]: rider.nameEN,
                [t('employees.rider')]: rider.workingId,
                [t('common.company')]: rider.companyName || "-",
            };

            rider.months?.forEach(m => {
                rowData[`${m.monthName} ${t('common.status')}`] = m.statusLabel;
                rowData[`${m.monthName} ${t('common.orders')}`] = m.recordedOrders;
            });

            return rowData;
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Yearly Validation");
        XLSX.writeFile(workbook, `Keta_Yearly_Validation_${year}.xlsx`);
    };

    const StatCard = ({ title, value, icon: Icon, colorClass }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value || 0}</h3>
                </div>
                <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );

    const getStatusColorClass = (label) => {
        if (!label) return "bg-gray-100 text-gray-600";

        switch (label) {
            case "صالح":
            case "Valid":
                return "bg-green-100 text-green-700";
            case "غير صالح":
            case "Invalid":
                return "bg-yellow-100 text-yellow-700";
            case "فري لانسر":
            case "Freelancer":
                return "bg-blue-100 text-blue-700";
            case "غير مصنف":
            case "Unclassified":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const getStatusIcon = (label) => {
        if (!label) return null;

        switch (label) {
            case "صالح":
            case "Valid":
                return <CheckCircle className="inline-block w-3 h-3 mr-1" />;
            case "غير صالح":
            case "Invalid":
                return <XCircle className="inline-block w-3 h-3 mr-1" />;
            case "فري لانسر":
            case "Freelancer":
                return <Briefcase className="inline-block w-3 h-3 mr-1" />;
            case "غير مصنف":
            case "Unclassified":
                return <HelpCircle className="inline-block w-3 h-3 mr-1" />;
            default:
                return null;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <PageHeader
                title={t('keta.yearlyValidation.title') || "Yearly Validation Report"}
                subtitle={t('keta.yearlyValidation.subtitle') || "Overview of yearly validation statuses for riders."}
                icon={FileCheck}
            />

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 space-y-6">
                {/* Filters & Controls */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-4 w-full md:w-auto flex-col md:flex-row">
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200 w-full md:w-auto justify-between md:justify-start">
                            <div className="flex items-center">
                                <Calendar className="text-gray-400 w-5 h-5 mx-2" />
                                <select
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 cursor-pointer pl-0"
                                >
                                    {availableYears.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={fetchReport}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors w-full md:w-auto flex justify-center"
                            title={t('common.refresh')}
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
                        <button
                            onClick={handleExport}
                            disabled={loading || filteredRiders.length === 0}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium w-full md:w-auto"
                            title={t('common.exportExcel')}
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>{t('common.exportExcel')}</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                        <p>{t('common.loading')}</p>
                    </div>
                ) : data ? (
                    <>
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <StatCard
                                title={t('keta.validation.totalRiders') || "Total Riders"}
                                value={data.totalRiders}
                                icon={Users}
                                colorClass="bg-blue-50 text-blue-600"
                            />
                            <StatCard
                                title={t('keta.validation.validRiders') || "Valid Accounts"}
                                value={data.totalValidRecords}
                                icon={CheckCircle}
                                colorClass="bg-green-50 text-green-600"
                            />
                            <StatCard
                                title={t('keta.validation.invalidRiders') || "Invalid Accounts"}
                                value={data.totalInvalidRecords}
                                icon={XCircle}
                                colorClass="bg-red-50 text-red-600"
                            />
                            <StatCard
                                title={t('keta.yearlyValidation.freelancers') || "Freelancers"}
                                value={data.totalFreelancerRecords}
                                icon={Briefcase}
                                colorClass="bg-purple-50 text-purple-600"
                            />
                            <StatCard
                                title={t('keta.yearlyValidation.unclassified') || "Unclassified"}
                                value={data.totalUnclassifiedRiders}
                                icon={HelpCircle}
                                colorClass="bg-orange-50 text-orange-600"
                            />
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('common.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                            />
                            <Search className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-3.5 text-gray-400 w-5 h-5 pointer-events-none`} />
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden lg:block bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right">
                                    <thead className="bg-gray-100 text-gray-600 font-medium whitespace-nowrap">
                                        <tr>
                                            <th className="px-4 py-4 text-start font-bold sticky right-0 bg-gray-100 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] border-l border-gray-200">
                                                {t('employees.riderDetails')}
                                            </th>
                                            {/* Generate column headers for up to 12 months based on first rider's data, or fallback */}
                                            {data.riders?.[0]?.months?.map((m, idx) => (
                                                <th key={idx} className="px-4 py-4 text-center border-l border-gray-200 min-w-[120px]">
                                                    {m.monthName}
                                                </th>
                                            )) || (
                                                    Array.from({ length: 12 }).map((_, i) => (
                                                        <th key={i} className="px-4 py-4 text-center border-l border-gray-200">Month {i + 1}</th>
                                                    ))
                                                )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredRiders.map((rider, index) => (
                                            <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-4 py-3 text-start bg-white sticky right-0 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] border-l border-gray-100">
                                                    <div>
                                                        <h3 className="text-gray-900 font-bold text-base">{rider.nameAR}</h3>
                                                        <p className="text-gray-500 text-sm font-mono">{rider.nameEN}</p>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono whitespace-nowrap">
                                                                ID: {rider.workingId}
                                                            </span>
                                                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-mono whitespace-nowrap">
                                                                IQ: {rider.iqamaNo}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                {rider.months?.map((month, mIdx) => (
                                                    <td key={mIdx} className="px-2 py-3 text-center border-l border-gray-50">
                                                        <div className="flex flex-col items-center justify-center gap-1">
                                                            <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${getStatusColorClass(month.statusLabel)}`}>
                                                                {getStatusIcon(month.statusLabel)}
                                                                {month.statusLabel}
                                                            </span>
                                                            {month.recordedOrders !== undefined && month.status !== null && (
                                                                <span className="text-xs font-bold text-gray-600">
                                                                    {month.recordedOrders} {t('common.orders')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4">
                            {filteredRiders.map((rider, index) => (
                                <div key={index} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col gap-2">
                                        <h3 className="text-gray-900 font-bold text-lg">{rider.nameAR}</h3>
                                        <p className="text-gray-500 text-sm font-mono">{rider.nameEN}</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <span className="bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-mono">
                                                ID: {rider.workingId}
                                            </span>
                                            <span className="bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-mono">
                                                IQ: {rider.iqamaNo}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 grid grid-cols-3 sm:grid-cols-3 gap-3">
                                        {rider.months?.map((month, mIdx) => (
                                            <div key={mIdx} className="bg-gray-50 p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 border border-gray-100">
                                                <span className="text-xs font-bold text-gray-600">{month.monthName}</span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColorClass(month.statusLabel)}`}>
                                                    {month.statusLabel}
                                                </span>
                                                {month.recordedOrders !== undefined && month.status !== null && (
                                                    <span className="text-[10px] font-bold text-gray-700">
                                                        {month.recordedOrders}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredRiders.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-500">{t('common.noResults')}</p>
                            </div>
                        )}
                    </>
                ) : null}
            </div>
        </div>
    );
}
