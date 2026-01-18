"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import Link from "next/link";
import {
    ArrowRight,
    Search,
    User,
    Calendar,
    FileText,
    Clock,
    Activity,
    AlertCircle,
    ChevronDown,
    History,
    Printer
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import RiderHistoryReportPDF from "@/components/RiderHistoryReportPDF";
import PageHeader from "@/components/layout/pageheader";
import { useLanguage } from "@/lib/context/LanguageContext";

export default function AdminRiderHistoryPage() {
    const { t, language } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [iqamaNo, setIqamaNo] = useState(searchParams.get('iqamaNo') || "");
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Rider Search State
    const [riders, setRiders] = useState([]);
    const [filteredRiders, setFilteredRiders] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Initial Fetch Riders
    useEffect(() => {
        fetchRiders();
    }, []);

    const fetchRiders = async () => {
        try {
            const data = await ApiService.get(API_ENDPOINTS.RIDER.LIST2);
            setRiders(data || []);
            setFilteredRiders(data || []);

            // If iqamaNo exists, try to find the rider name to populate search query
            const urlIqamaNo = searchParams.get('iqamaNo');
            if (urlIqamaNo && data) {
                const rider = data.find(r => (r.employeeIqamaNo || r.iqamaNo) == urlIqamaNo);
                if (rider) {
                    setSearchQuery(language === 'ar' ? rider.nameAR : (rider.nameEN || rider.nameAR)); // Default to appropriate name
                } else {
                    setSearchQuery(urlIqamaNo);
                }
            }
        } catch (err) {
            console.error("Failed to fetch riders", err);
        }
    };

    // Filter riders when search query changes
    useEffect(() => {
        if (!riders.length) return;

        const lowerQuery = searchQuery.toLowerCase();
        const filtered = riders.filter(rider =>
            (rider.nameAR && rider.nameAR.toLowerCase().includes(lowerQuery)) ||
            (rider.nameEN && rider.nameEN.toLowerCase().includes(lowerQuery)) ||
            (rider.workingId && rider.workingId.toString().includes(lowerQuery)) ||
            ((rider.employeeIqamaNo || rider.iqamaNo) && (rider.employeeIqamaNo || rider.iqamaNo).toString().includes(lowerQuery))
        );
        setFilteredRiders(filtered.slice(0, 50)); // Limit results for performance
    }, [searchQuery, riders]);

    const handleRiderSelect = (rider) => {
        setIqamaNo(rider.employeeIqamaNo || rider.iqamaNo);
        setSearchQuery(language === 'ar' ? rider.nameAR : (rider.nameEN || rider.nameAR));
        setShowDropdown(false);
        setError(null);
    };

    const fetchReport = async () => {
        if (!iqamaNo) {
            setError(t('selectRiderError') || t('reports.riderHistory')); // Fallback if key missing
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await ApiService.get(API_ENDPOINTS.REPORTS.RIDER_HISTORY(iqamaNo));
            setReportData(data);

            // Update URL params
            router.push(`/admin/reports/history?iqamaNo=${iqamaNo}`, { scroll: false });
        } catch (err) {
            setError(err.message || t('common.errorLoad'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch if iqamaNo exists in URL and riders loaded
    useEffect(() => {
        const urlIqamaNo = searchParams.get('iqamaNo');
        if (urlIqamaNo && !reportData && riders.length > 0) {
            if (!iqamaNo) setIqamaNo(urlIqamaNo);
            fetchReport();
        }
    }, [riders]);

    return (
        <div >
            <PageHeader
                title={t('reports.riderHistory')}
                subtitle={t('reports.riderHistoryDesc')}
                icon={History}
            />

            {/* Search Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap w-full">
                    {/* Rider Search Dropdown */}
                    <div className="relative flex-1 min-w-[300px]" ref={dropdownRef}>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('searchRiderPlaceholder') || 'ابحث عن مندوب (الاسم أو الرقم)'}
                                value={searchQuery}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSearchQuery(val);
                                    setShowDropdown(true);
                                    if (!val) setIqamaNo("");
                                }}
                                onFocus={() => setShowDropdown(true)}
                                className={`w-full px-4 py-2 ${language === 'ar' ? 'pl-10' : 'pr-10'} border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 font-medium shadow-sm`}
                            />
                            <ChevronDown className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} size={16} />
                        </div>

                        {/* Dropdown Results */}
                        {showDropdown && filteredRiders.length > 0 && (
                            <div className="absolute top-full right-0 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                                {filteredRiders.map((rider, index) => (
                                    <button
                                        key={rider.riderId || rider.id || rider.iqamaNo || index}
                                        onClick={() => handleRiderSelect(rider)}
                                        className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex items-center justify-between group`}
                                    >
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">
                                                {language === 'ar' ? rider.nameAR : (rider.nameEN || rider.nameAR)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {language === 'ar' ? rider.nameEN : rider.nameAR}
                                            </p>
                                        </div>
                                        <div className="text-left">
                                            <span className="block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-mono mb-1">
                                                ID: {rider.workingId}
                                            </span>
                                            <span className="block text-xs text-gray-400 font-mono">
                                                {rider.employeeIqamaNo || rider.iqamaNo}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '...' : (
                            <>
                                <span>{t('common.search')}</span>
                                <Search size={18} />
                            </>
                        )}
                    </button>

                    {reportData && (
                        <PDFDownloadLink
                            key={reportData.workingId + (reportData.firstShiftDate || '')}
                            document={<RiderHistoryReportPDF data={reportData} language={language} t={t} />}
                            fileName={`Rider_History_${reportData.riderName || 'Report'}.pdf`}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {({ loading: pdfLoading }) => (
                                <>
                                    <span>{pdfLoading ? '...PDF' : t('keta.daily.printPDF')}</span>
                                    <Printer size={18} />
                                </>
                            )}
                        </PDFDownloadLink>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* Report Content */}
            {reportData && (
                <div className="space-y-6">
                    {/* Rider Info Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-center gap-4 col-span-1 md:col-span-2">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                <User size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{reportData.riderName}</h2>
                                <div className="flex gap-3 text-xs font-mono text-gray-600 mt-2">
                                    <span className="bg-gray-100 px-2 py-1 rounded">ID: {reportData.workingId}</span>
                                    <span className="bg-gray-100 px-2 py-1 rounded">Iqama: {reportData.iqamaNo}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-500 mb-1">{t('firstShiftDate') || 'تاريخ أول اداء'}</p>
                            <p className="font-bold text-gray-900">{reportData.firstShiftDate}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-500 mb-1">{t('lastShiftDate') || 'تاريخ آخر اداء'}</p>
                            <p className="font-bold text-gray-900">{reportData.lastShiftDate}</p>
                        </div>
                    </div>

                    {/* Monthly Details Columns by Year */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900">{t('monthlyHistory') || 'سجل الشهور (سنوي)'}</h2>
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                {t('totalMonths', { count: reportData.totalMonths }) || `إجمالي ${reportData.totalMonths} شهر`}
                            </span>
                        </div>

                        <div className="p-6 overflow-x-auto">
                            <div className="flex gap-6 min-w-full">
                                {Object.entries(
                                    reportData.monthlyData?.reduce((acc, month) => {
                                        const year = month.year;
                                        if (!acc[year]) acc[year] = [];
                                        acc[year].push(month);
                                        return acc;
                                    }, {}) || {}
                                )
                                    .sort(([yearA], [yearB]) => yearB - yearA) // Sort years descending (newest first)
                                    .map(([year, months]) => (
                                        <div key={year} className="flex-none w-full sm:w-1/2 lg:w-1/4 min-w-[280px] border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                                            {/* Year Header */}
                                            <div className="bg-blue-600 text-white py-3 text-center font-bold text-lg">
                                                {year}
                                            </div>

                                            {/* Months List */}
                                            <div className="divide-y divide-gray-100 bg-white">
                                                <div className="flex justify-between items-center px-4 py-2 bg-gray-100 text-xs font-bold text-gray-500">
                                                    <span>{t('month')}</span>
                                                    <span>{t('reports.totalOrders')}</span>
                                                </div>
                                                {months.map((month, idx) => (
                                                    <div key={idx} className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                                                        <span className="font-bold text-gray-800 text-sm">{month.monthName}</span>
                                                        <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">
                                                            {month.totalAcceptedOrders}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading && !reportData && (
                <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 animate-pulse font-medium">{t('common.loading')}</p>
                </div>
            )}
        </div>
    );
}
