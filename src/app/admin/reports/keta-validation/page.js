"use client";

import { useState, useEffect } from "react";
import { ApiService } from "@/lib/api/apiService";
import PageHeader from "@/components/layout/pageheader";
import {
    FileCheck,
    Calendar,
    Filter,
    Users,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    LayoutList,
    LayoutGrid,
    Search,
    FileSpreadsheet
} from "lucide-react";
import * as XLSX from "xlsx";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function KetaValidationPage() {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    // Date State
    const currentDate = new Date();
    const [year, setYear] = useState(currentDate.getFullYear());
    const [month, setMonth] = useState(currentDate.getMonth() + 1);

    // View State
    const [viewMode, setViewMode] = useState("details"); // 'details' | 'summary'
    const [expandedRiders, setExpandedRiders] = useState({});

    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchReport();
    }, [year, month]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get(
                `/api/Report/keta/validation?year=${year}&month=${month}`
            );
            setData(response);
        } catch (error) {
            console.error("Failed to fetch keta validation report:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRiderExpand = (riderId) => {
        setExpandedRiders(prev => ({
            ...prev,
            [riderId]: !prev[riderId]
        }));
    };

    // Filter Logic
    const filteredRiderValidations = data?.riderValidations?.filter(rider => {
        const query = searchQuery.toLowerCase().trim();

        // Check for Status Match explicitly (Partial Match on Keywords)
        if (query.length > 0) {
            const matchesValid = 'صالح'.startsWith(query) || 'valid'.startsWith(query);
            const matchesInvalid = 'غير صالح'.startsWith(query) || 'invalid'.startsWith(query);

            if (matchesValid && rider.isValidForMonth) return true;
            if (matchesInvalid && !rider.isValidForMonth) return true;
        }

        return (
            rider.riderNameAR?.toLowerCase().includes(query) ||
            rider.riderNameEN?.toLowerCase().includes(query) ||
            rider.workingId?.toString().includes(query) ||
            rider.iqamaNo?.toString().includes(query) ||
            rider.housingName?.toLowerCase().includes(query)
        );
    }) || [];

    const handleExportSummary = () => {
        if (filteredRiderValidations.length === 0) return;

        const exportData = filteredRiderValidations.map(rider => ({
            [t('employees.nameArabic')]: rider.riderNameAR,
            [t('employees.nameEnglish')]: rider.riderNameEN,
            [t('employees.rider')]: rider.workingId,
            [t('employees.iqamaNumber')]: rider.iqamaNo,
            [t('common.housingGroup')]: rider.housingName || "-",
            [t('keta.validation.orders')]: rider.totalOrders,
            [t('keta.validation.targetOrders')]: rider.targetOrders,
            [t('keta.validation.workingDays')]: rider.totalWorkingDays,
            [t('keta.cumulative.expectedDays')]: rider.totalExpectedDays,
            [t('keta.validation.avgHours')]: rider.averageHoursPerDay?.toFixed(2),
            [t('common.status')]: rider.isValidForMonth ? t('keta.validation.valid') : t('keta.validation.invalid'),
            [t('keta.validation.validationErrors')]: rider.validationErrors?.join(", ") || "-"
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");
        XLSX.writeFile(workbook, `Keta_Validation_Summary_${month}_${year}.xlsx`);
    };

    const handleExportDetails = () => {
        if (filteredRiderValidations.length === 0) return;

        const exportData = [];

        filteredRiderValidations.forEach(rider => {
            // Add summary row for the rider
            exportData.push({
                [t('employees.nameArabic')]: rider.riderNameAR,
                [t('employees.nameEnglish')]: rider.riderNameEN,
                [t('employees.rider')]: rider.workingId,
                [t('employees.iqamaNumber')]: rider.iqamaNo,
                [t('common.housingGroup')]: rider.housingName || "-",
                [t('keta.validation.orders')]: rider.totalOrders,
                [t('keta.validation.targetOrders')]: rider.targetOrders,
                [t('keta.validation.workingDays')]: rider.totalWorkingDays,
                [t('keta.cumulative.expectedDays')]: rider.totalExpectedDays,
                [t('keta.validation.avgHours')]: rider.averageHoursPerDay?.toFixed(2),
                [t('common.status')]: rider.isValidForMonth ? t('keta.validation.valid') : t('keta.validation.invalid'),
                [t('keta.validation.validationErrors')]: rider.validationErrors?.join(", ") || "-",
                [t('common.day')]: t('keta.validation.summary'),
                [t('common.date')]: "",
                [t('keta.validation.hasShift')]: "",
                [t('keta.validation.dailyHours')]: "",
                [t('keta.validation.dailyOrders')]: "",
                [t('keta.validation.dailyStats')]: "",
                [t('common.notes')]: ""
            });

            // Add daily detail rows for the rider
            if (rider.dailyDetails && rider.dailyDetails.length > 0) {
                rider.dailyDetails.forEach(day => {
                    exportData.push({
                        [t('employees.nameArabic')]: "",
                        [t('employees.nameEnglish')]: "",
                        [t('employees.rider')]: "",
                        [t('employees.iqamaNumber')]: "",
                        [t('common.housingGroup')]: "",
                        [t('keta.validation.orders')]: "",
                        [t('keta.validation.targetOrders')]: "",
                        [t('keta.validation.workingDays')]: "",
                        [t('keta.cumulative.expectedDays')]: "",
                        [t('keta.validation.avgHours')]: "",
                        [t('common.status')]: "",
                        [t('keta.validation.validationErrors')]: "",
                        [t('common.day')]: day.day,
                        [t('common.date')]: day.date,
                        [t('keta.validation.hasShift')]: day.hasShift ? t('common.yes') : t('common.no'),
                        [t('keta.validation.dailyHours')]: day.workingHours ? Number(day.workingHours).toFixed(2) : "0.00",
                        [t('keta.validation.dailyOrders')]: day.acceptedOrders,
                        [t('keta.validation.dailyStats')]: day.isValid ? t('keta.validation.valid') : t('keta.validation.invalid'),
                        [t('common.notes')]: day.reason || "-"
                    });
                });
            }
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Details");
        XLSX.writeFile(workbook, `Keta_Validation_Details_${month}_${year}.xlsx`);
    };

    // Generate Year Options (Current - 1 to Current + 1)
    const years = [currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1];

    // Generate Month Options
    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'long' }).format(new Date(2000, i, 1))
    }));

    const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                </div>
                <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-12" >
            <PageHeader
                title={t('keta.validation.title')}
                subtitle={t('keta.validation.subtitle')}
                icon={FileCheck}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
                {/* Filters & Controls */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
                            <Calendar className="text-gray-400 w-5 h-5 mx-2" />
                            <select
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 cursor-pointer"
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <div className="w-px h-6 bg-gray-300"></div>
                            <select
                                value={month}
                                onChange={(e) => setMonth(Number(e.target.value))}
                                className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 cursor-pointer"
                            >
                                {months.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={fetchReport}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                            title={t('common.refresh')}
                        >
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2 items-center">

                        <div className="flex gap-2">
                            <button
                                onClick={handleExportSummary}
                                disabled={loading || filteredRiderValidations.length === 0}
                                className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                title={t('keta.validation.exportSummary')}
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('keta.validation.exportSummary')}</span>
                            </button>
                            <button
                                onClick={handleExportDetails}
                                disabled={loading || filteredRiderValidations.length === 0}
                                className="flex items-center gap-2 px-3 py-2 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                title={t('keta.validation.exportDetails')}
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('keta.validation.exportDetails')}</span>
                            </button>
                        </div>

                        <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode("details")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "details"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <LayoutList className="w-4 h-4" />
                                <span>{t('keta.validation.details')}</span>
                            </button>
                            <button
                                onClick={() => setViewMode("summary")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === "summary"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                                <span>{t('keta.validation.summary')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                        <p>{t('keta.validation.loading')}</p>
                    </div>
                )}

                {!loading && data && (
                    <>
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title={t('keta.validation.totalRiders')}
                                value={data.totalRiders}
                                icon={Users}
                                colorClass="bg-blue-50 text-blue-600"
                            />
                            <StatCard
                                title={t('keta.validation.targetOrders')}
                                value={data.targetOrders}
                                subtitle={t('keta.validation.targetSubtitle', { days: data.totalExpectedDays })}
                                icon={CheckCircle}
                                colorClass="bg-purple-50 text-purple-600"
                            />
                            <StatCard
                                title={t('keta.validation.validRiders')}
                                value={data.validRiders}
                                icon={CheckCircle}
                                colorClass="bg-green-50 text-green-600"
                            />
                            <StatCard
                                title={t('keta.validation.invalidRiders')}
                                value={data.invalidRiders}
                                icon={XCircle}
                                colorClass="bg-red-50 text-red-600"
                            />
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('keta.validation.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                            />
                            <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-3.5 text-gray-400 w-5 h-5 pointer-events-none`} />
                        </div>

                        {/* Riders List */}
                        <div className="space-y-4">
                            {filteredRiderValidations.map((rider) => (
                                <div key={rider.riderId} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">

                                    {/* Rider Summary Header */}
                                    <div
                                        className="p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => viewMode === 'details' && toggleRiderExpand(rider.riderId)}
                                    >
                                        {/* Rider Info */}
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${rider.isValidForMonth
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}>
                                                {rider.isValidForMonth ? "✓" : "✕"}
                                            </div>
                                            <div>
                                                <h3 className="text-gray-900 font-bold text-lg">{rider.riderNameAR}</h3>
                                                <p className="text-gray-500 text-sm font-mono">{rider.riderNameEN}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono">
                                                        {t('employees.rider')}: {rider.workingId}
                                                    </span>
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono">
                                                        {t('employees.iqamaNumber')}: {rider.iqamaNo}
                                                    </span>
                                                    {rider.housingName && (
                                                        <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-xs font-medium">
                                                            {rider.housingName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Rider Stats Grid */}
                                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto mt-4 lg:mt-0">
                                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">{t('keta.validation.orders')}</p>
                                                <p className={`font-bold ${rider.totalOrders >= rider.targetOrders ? 'text-green-600' : 'text-red-500'}`}>
                                                    {rider.totalOrders} <span className="text-gray-400 text-xs">/ {rider.targetOrders}</span>
                                                </p>
                                            </div>
                                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">{t('keta.validation.workingDays')}</p>
                                                <p className="font-bold text-gray-800">
                                                    {rider.totalWorkingDays} <span className="text-gray-400 text-xs">/ {rider.totalExpectedDays}</span>
                                                </p>
                                            </div>
                                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">{t('keta.validation.avgHours')}</p>
                                                <p className="font-bold text-gray-800">{rider.averageHoursPerDay?.toFixed(2)}</p>
                                            </div>
                                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">{t('common.status')}</p>
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${rider.isValidForMonth
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}>
                                                    {rider.isValidForMonth ? t('keta.validation.valid') : t('keta.validation.invalid')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Expand Icon (Details View Only) */}
                                        {viewMode === 'details' && (
                                            <div className="hidden lg:block text-gray-400">
                                                {expandedRiders[rider.riderId] ? <ChevronUp /> : <ChevronDown />}
                                            </div>
                                        )}
                                    </div>

                                    {/* Validation Errors (if any) */}
                                    {rider.validationErrors && rider.validationErrors.length > 0 && (
                                        <div className="px-4 pb-4">
                                            {rider.validationErrors.map((err, idx) => {
                                                const isSuccess = err === "✅ جميع شروط التحقق مستوفاة"; // TODO: This might need backend change or we handle it by value
                                                // Assuming backend returns Arabic string, we might need a better way to check success if strings change.
                                                // For now, I'll keep it as is, but this is a potential issue if backend strings don't match exactly or we want to translate them.
                                                // Ideally backend sends error codes.

                                                return (
                                                    <div key={idx} className={`flex items-center gap-2 text-sm p-2 rounded-lg mb-1 last:mb-0 ${isSuccess ? "text-green-700 bg-green-50 border border-green-100" : "text-red-600 bg-red-50"}`}>
                                                        {isSuccess ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                                        <span>{err}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {/* Daily Details Table (Collapsible) */}
                                    {viewMode === 'details' && (expandedRiders[rider.riderId]) && rider.dailyDetails && (
                                        <div className="border-t border-gray-100 bg-gray-50 p-4 animate-fadeIn">
                                            <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
                                                <table className="w-full text-sm text-right">
                                                    <thead className="bg-gray-100 text-gray-600 font-medium">
                                                        <tr>
                                                            <th className="px-4 py-3 text-start">{t('common.day')}</th>
                                                            <th className="px-4 py-3 text-start">{t('common.date')}</th>
                                                            <th className="px-4 py-3 text-start">{t('common.shift')}</th>
                                                            <th className="px-4 py-3 text-start">{t('common.workingHours')}</th>
                                                            <th className="px-4 py-3 text-start">{t('common.orders')}</th>
                                                            <th className="px-4 py-3 text-start">{t('keta.validation.dailyStats')}</th>
                                                            <th className="px-4 py-3 text-start">{t('common.notes')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {rider.dailyDetails.map((day, idx) => (
                                                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                                                                <td className="px-4 py-3 font-bold text-gray-700 text-start">{day.day}</td>
                                                                <td className="px-4 py-3 font-mono text-gray-600 text-start">{day.date}</td>
                                                                <td className="px-4 py-3 text-start">
                                                                    {day.hasShift ? (
                                                                        <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">{t('common.yes')}</span>
                                                                    ) : (
                                                                        <span className="text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded">{t('common.no')}</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 font-bold text-start">{day.workingHours ? Number(day.workingHours).toFixed(2) : "0.00"}</td>
                                                                <td className="px-4 py-3 font-bold text-start">{day.acceptedOrders}</td>
                                                                <td className="px-4 py-3 text-start">
                                                                    {day.isValid ? (
                                                                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
                                                                            <CheckCircle className="w-3 h-3" /> {t('keta.validation.valid')}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded-full text-xs font-bold">
                                                                            <XCircle className="w-3 h-3" /> {t('keta.validation.invalid')}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-500 text-xs text-start">{day.reason}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {filteredRiderValidations.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                                    <p className="text-gray-500">
                                        {data.riderValidations?.length > 0
                                            ? t('keta.validation.noResults')
                                            : t('keta.validation.noData')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
