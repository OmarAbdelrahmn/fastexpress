"use client";


import { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
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
    Target,
    Activity,
    AlertCircle,
    Download,
    CheckCircle,
    XCircle,
    ChevronDown,
    Printer // Added Printer icon
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import RiderDailyReportPDF from "@/components/RiderDailyReportPDF";
export default function RiderDailyDetailReportPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [workingId, setWorkingId] = useState(searchParams.get('workingId') || "");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
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

    // Initial Date Setup & Fetch Riders
    useEffect(() => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth(), 1);

        const toLocalISO = (date) => {
            const offset = date.getTimezoneOffset() * 60000;
            return new Date(date - offset).toISOString().split('T')[0];
        };

        const initialStart = searchParams.get('startDate') || toLocalISO(start);
        const initialEnd = searchParams.get('endDate') || toLocalISO(end);

        setStartDate(initialStart);
        setEndDate(initialEnd);

        // Fetch Riders List
        fetchRiders();
    }, []);

    const fetchRiders = async () => {
        try {
            const data = await ApiService.get(API_ENDPOINTS.MEMBER.RIDERS);
            setRiders(data || []);
            setFilteredRiders(data || []);

            // If workingId exists, try to find the rider name to populate search query
            const urlWorkingId = searchParams.get('workingId');
            if (urlWorkingId && data) {
                const rider = data.find(r => r.workingId === urlWorkingId);
                if (rider) {
                    setSearchQuery(rider.nameAR); // Default to Arabic name
                } else {
                    setSearchQuery(urlWorkingId);
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
            (rider.iqamaNo && rider.iqamaNo.toString().includes(lowerQuery))
        );
        setFilteredRiders(filtered.slice(0, 50)); // Limit results for performance
    }, [searchQuery, riders]);

    const handleRiderSelect = (rider) => {
        setWorkingId(rider.workingId);
        setSearchQuery(rider.nameAR || rider.nameEN);
        setShowDropdown(false);
    };

    const fetchReport = async () => {
        if (!workingId || !startDate || !endDate) {
            if (!workingId) setError("يرجى إدخال رقم العمل للمندوب أو اختيار مندوب");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const url = `${API_ENDPOINTS.MEMBER.REPORTS_RIDER_DAILY_DETAIL}?workingId=${workingId}&startDate=${startDate}&endDate=${endDate}`;
            const response = await ApiService.get(url);
            setReportData(response);

            // Update URL params
            router.push(`/member/reports/rider-daily?workingId=${workingId}&startDate=${startDate}&endDate=${endDate}`, { scroll: false });
        } catch (err) {
            setError(err.message || "حدث خطأ أثناء تحميل التقرير");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch ONLY if all params match when component loads or when workingId changes explicitly via selection
    // Note: We want to avoid aggressive auto-fetching on every keystroke of date. 
    // Let's keep it manual or on-load if URL params exist.
    useEffect(() => {
        const urlWorkingId = searchParams.get('workingId');
        if (urlWorkingId && startDate && endDate && !reportData && riders.length > 0) {
            // Check if we need to sync workingId state with URL if not already
            if (!workingId) setWorkingId(urlWorkingId);

            // We can trigger fetch here if we want auto-load on deep link
            // But let's respect the manual trigger mostly to avoid double-fetching if not careful.
            // Accessing the page with params should probably trigger it.
            fetchReport();
        }
    }, [riders]); // Run once when riders are loaded (and thus page is ready)

    const StatCard = ({ title, value, icon: Icon, color, suffix = "", subValue = null, subValueClass = "text-sm" }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color.bg}`}>
                <Icon className={color.text} size={24} />
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{value}</span>
                {suffix && <span className="text-gray-400 text-sm">{suffix}</span>}
            </div>
            {subValue && (
                <div className={`${subValueClass} font-medium text-gray-500 mt-2 border-t border-gray-50 pt-2`}>
                    {subValue}
                </div>
            )}
        </div>
    );



    const getShiftStatusConfig = (hasShift, status) => {
        if (!hasShift) return { text: 'لا يوجد  ', className: 'bg-gray-100 text-gray-600' };

        const s = status?.toLowerCase() || '';
        if (s === 'failed') return { text: 'فشل', className: 'bg-red-100 text-red-700' };
        if (s === 'incomplete') return { text: 'غير مكتمل', className: 'bg-orange-100 text-orange-700' };
        if (s === 'completed' || s === 'active') return { text: 'مكتمل', className: 'bg-green-100 text-green-700' };

        return { text: status || 'مجَدول', className: 'bg-blue-100 text-blue-700' };
    };

    const handleExportExcel = () => {
        if (!reportData?.dailyDetails) return;

        const data = reportData.dailyDetails.map(day => {
            const statusConfig = getShiftStatusConfig(day.hasShift, day.shiftStatus);
            return {
                "التاريخ": day.date,
                "الحالة": statusConfig.text,
                "الطلبات المقبولة": day.acceptedOrders,
                "الطلبات المرفوضة": day.rejectedOrders,
                "رفض حقيقي": day.realRejectedOrders || 0,
                "ساعات العمل": day.workingHours ? Number(day.workingHours.toFixed(2)) : 0,
                "هدف الساعات": day.targetHours,
                "الفرق": day.hoursDifference ? Number(day.hoursDifference.toFixed(2)) : 0
            };
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Adjust column widths
        const wscols = [
            { wch: 15 }, // Date
            { wch: 15 }, // Status
            { wch: 15 }, // Accepted
            { wch: 15 }, // Rejected
            { wch: 15 }, // Real Rejected
            { wch: 15 }, // Working Hours
            { wch: 15 }, // Target Hours
            { wch: 15 }  // Difference
        ];
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, "Rider Daily Details");
        XLSX.writeFile(wb, `Rider_Daily_${reportData.riderNameAR || 'Report'}_${startDate}_${endDate}.xlsx`);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in text-right" dir="rtl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <Link
                        href="/member/reports"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <ArrowRight size={24} className="rotate-180" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="text-blue-600" />
                            تفاصيل المندوب اليومية
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            تحليل أداء مندوب محدد خلال فترة (Rider Details)
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap">
                    {/* Rider Search Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ابحث عن مندوب (الاسم أو الرقم)"
                                value={searchQuery}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSearchQuery(val);
                                    setShowDropdown(true);
                                    // If input is numeric, treat as working ID
                                    if (val && !isNaN(val) && val.trim() !== '') {
                                        setWorkingId(val);
                                    } else {
                                        // If typing text (name), clear workingId to force selection
                                        // Unless we want to keep previous ID? No, better to clear to avoid mismatch.
                                        setWorkingId("");
                                    }
                                }}
                                onFocus={() => setShowDropdown(true)}
                                className="px-4 py-2 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 font-medium shadow-sm w-64"
                            />
                            <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        </div>

                        {/* Dropdown Results */}
                        {showDropdown && filteredRiders.length > 0 && (
                            <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                                {filteredRiders.map((rider) => (
                                    <button
                                        key={rider.id || rider.workingId}
                                        onClick={() => handleRiderSelect(rider)}
                                        className="w-full text-right px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex items-center justify-between group"
                                    >
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{rider.nameAR}</p>
                                            <p className="text-xs text-gray-500">{rider.nameEN}</p>
                                        </div>
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-mono group-hover:bg-blue-50 group-hover:text-blue-600">
                                            {rider.workingId}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">من:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 font-medium shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">إلى:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 font-medium shadow-sm"
                        />
                    </div>
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '...' : (
                            <>
                                <span>بحث</span>
                                <Search size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* Rider Info & Stats */}
            {reportData && (
                <>
                    {/* Rider Info Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                <User size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{reportData.riderNameAR}</h2>
                                <p className="text-sm text-gray-500 font-mono mb-1">{reportData.riderNameEN}</p>
                                <div className="flex gap-3 text-xs font-mono text-gray-600">
                                    <span className="bg-gray-100 px-2 py-1 rounded">ID: {reportData.workingId}</span>
                                    <span className="bg-gray-100 px-2 py-1 rounded">Iqama: {reportData.iqamaNo}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            {reportData.isAboveTarget ? (
                                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                                    <CheckCircle size={20} />
                                    <span>فوق المستهدف</span>
                                </div>
                            ) : (
                                <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                                    <XCircle size={20} />
                                    <span>لم يحقق التارجت</span>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <button
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors "
                                    title="تصدير Excel"
                                    onClick={handleExportExcel}
                                >
                                    <Download size={20} />
                                    <span className="font-medium">Excel</span>
                                </button>

                                <PDFDownloadLink
                                    key={reportData.workingId + startDate + endDate}
                                    document={<RiderDailyReportPDF data={reportData} startDate={startDate} endDate={endDate} />}
                                    fileName={`Rider_Daily_${reportData.riderNameAR || 'Report'}_${startDate}_${endDate}.pdf`}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {({ loading: pdfLoading }) => (
                                        <>
                                            <Printer size={20} />
                                            <span className="font-medium">{pdfLoading ? '...PDF' : 'PDF'}</span>
                                        </>
                                    )}
                                </PDFDownloadLink>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="أيام العمل"
                            value={reportData.totalWorkingDays}
                            subValue={`أيام الغياب: ${reportData.missingDays}`}
                            subValueClass={`text-base font-bold ${reportData.missingDays > 3 ? 'text-red-600' : 'text-green-600'}`}
                            icon={Calendar}
                            color={{ bg: "bg-indigo-50", text: "text-indigo-600" }}
                        />
                        <StatCard
                            title="إجمالي الطلبات"
                            value={reportData.totalOrders}
                            subValue={`التارجت: ${reportData.totalWorkingDays * 14} (الفرق: ${reportData.totalOrders - (reportData.totalWorkingDays * 14)})`}
                            subValueClass={`text-base font-bold ${reportData.totalOrders - (reportData.totalWorkingDays * 14) > 1 ? 'text-green-600' : 'text-red-600'}`}
                            icon={FileText}
                            color={{ bg: "bg-green-50", text: "text-green-600" }}
                        />
                        <StatCard
                            title="إجمالي الساعات"
                            value={reportData.totalWorkingHours?.toFixed(2)}
                            subValue={`التارجت: ${reportData.targetWorkingHours} (الفرق: ${reportData.hoursDifference?.toFixed(2)})`}
                            subValueClass={`text-base font-bold ${reportData.hoursDifference?.toFixed(2) > 1 ? 'text-green-600' : 'text-red-600'}`}
                            icon={Clock}
                            color={{ bg: "bg-orange-50", text: "text-orange-600" }}
                            suffix="ساعة"
                        />
                        <StatCard
                            title="طلبات مرفوضة"
                            value={reportData.totalRejections}
                            subValue={`رفض حقيقي: ${reportData.totalRealRejections}`}
                            subValueClass={`text-base font-bold ${reportData.totalRealRejections > 0 ? 'text-red-600' : 'text-green-600'}`}
                            icon={AlertCircle}
                            color={{ bg: "bg-red-50", text: "text-red-600" }}
                        />
                    </div>
                </>
            )}

            {/* Daily Details Table */}
            {reportData?.dailyDetails && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-900">سجل الأيام</h2>
                        <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                            {reportData.dailyDetails.length} يوم
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-gray-500 text-sm">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">التاريخ</th>
                                    <th className="px-6 py-3 font-semibold">الحالة</th>
                                    <th className="px-6 py-3 font-semibold">الطلبات</th>
                                    <th className="px-6 py-3 font-semibold text-red-600">مرفوضة</th>
                                    <th className="px-6 py-3 font-semibold">ساعات العمل</th>
                                    <th className="px-6 py-3 font-semibold text-gray-400">هدف الساعات</th>
                                    <th className="px-6 py-3 font-semibold">الفرق</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {reportData.dailyDetails.map((day, index) => {
                                    const statusConfig = getShiftStatusConfig(day.hasShift, day.shiftStatus);
                                    return (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-gray-600">{day.date}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusConfig.className}`}>
                                                    {statusConfig.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800">{day.acceptedOrders}</td>
                                            <td className="px-6 py-4 text-red-600">
                                                {day.rejectedOrders > 0 ? (
                                                    <span className="flex items-center gap-1">
                                                        {day.rejectedOrders}
                                                        {day.realRejectedOrders > 0 && <span className="text-xs bg-red-100 px-1 rounded">({day.realRejectedOrders} ح)</span>}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800">{day.workingHours?.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-gray-500">{day.targetHours}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${day.hoursDifference >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {day.hoursDifference?.toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {loading && !reportData && (
                <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-gray-500 animate-pulse font-medium">جاري تحميل البيانات...</p>
                </div>
            )}
        </div>
    );

}