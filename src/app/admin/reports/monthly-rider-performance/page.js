"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import * as XLSX from "xlsx";
import { CalendarDays, Download, FileDown, Search, Users, CheckCircle2, XCircle, Clock3, AlertCircle } from "lucide-react";
import PageHeader from "@/components/layout/pageheader";
import { ApiService } from "@/lib/api/apiService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import MonthlyRiderPerformancePDF from "@/components/dashboard/MonthlyRiderPerformancePDF";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((module) => module.PDFDownloadLink),
  { ssr: false, loading: () => <span className="inline-flex h-11 items-center justify-center rounded-lg bg-red-700 px-4 font-semibold text-white">جارٍ تحميل PDF...</span> },
);

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const number = (value) => Number(value || 0).toLocaleString();

export default function MonthlyRiderPerformancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const now = new Date();
  const initialYear = Number(searchParams.get("year")) || now.getFullYear();
  const initialFromMonth = Number(searchParams.get("fromMonth")) || now.getMonth() + 1;
  const initialToMonth = Number(searchParams.get("toMonth")) || now.getMonth() + 1;

  const [year, setYear] = useState(initialYear);
  const [fromMonth, setFromMonth] = useState(initialFromMonth);
  const [toMonth, setToMonth] = useState(initialToMonth);
  const [report, setReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  // The visible table always follows the API response, not unsent filter edits.
  const appliedMonths = useMemo(() => {
    const appliedFrom = Number(report?.fromMonth);
    const appliedTo = Number(report?.toMonth);
    if (!Number.isInteger(appliedFrom) || !Number.isInteger(appliedTo) || appliedFrom < 1 || appliedTo > 12 || appliedFrom > appliedTo) return [];
    return Array.from({ length: appliedTo - appliedFrom + 1 }, (_, index) => appliedFrom + index);
  }, [report]);

  const filteredRiders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return (report?.riders || []).filter((rider) => {
      const matchesCompany = !companyFilter || String(rider.companyId) === companyFilter;
      const matchesSearch = !query || [
        rider.riderNameAR,
        rider.riderNameEN,
        rider.workingId,
        rider.iqamaNo,
      ].some((value) => String(value || "").toLowerCase().includes(query));
      return matchesCompany && matchesSearch;
    });
  }, [report, searchTerm, companyFilter]);

  const companies = useMemo(() => {
    const seen = new Map();
    (report?.riders || []).forEach((rider) => {
      if (rider.companyId != null) seen.set(String(rider.companyId), rider.companyName || `شركة ${rider.companyId}`);
    });
    return [...seen.entries()];
  }, [report]);

  const totals = useMemo(() => filteredRiders.reduce((summary, rider) => {
    (rider.months || []).forEach((month) => {
      summary.accepted += Number(month.totalAcceptedOrders || 0);
      summary.rejected += Number(month.totalRealRejectedOrders || 0);
    });
    return summary;
  }, { accepted: 0, rejected: 0 }), [filteredRiders]);

  const fetchReport = async () => {
    const parsedYear = Number(year);
    const parsedFrom = Number(fromMonth);
    const parsedTo = Number(toMonth);
    if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      setError("يرجى إدخال سنة صحيحة.");
      return;
    }
    if (!Number.isInteger(parsedFrom) || !Number.isInteger(parsedTo) || parsedFrom < 1 || parsedTo > 12 || parsedFrom > parsedTo) {
      setError("يجب أن يكون نطاق الأشهر من 1 إلى 12، ويبدأ قبل أو يساوي شهر النهاية.");
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError("");
    try {
      const response = await ApiService.get(API_ENDPOINTS.REPORTS.RIDERS_MONTHLY_PERFORMANCE, {
        year: parsedYear,
        fromMonth: parsedFrom,
        toMonth: parsedTo,
      }, { cache: "no-store" });
      if (requestId !== requestIdRef.current) return;
      setReport(response);
      router.replace(`/admin/reports/monthly-rider-performance?year=${parsedYear}&fromMonth=${parsedFrom}&toMonth=${parsedTo}`, { scroll: false });
    } catch (requestError) {
      if (requestId !== requestIdRef.current) return;
      setError(requestError.message || "تعذر تحميل تقرير الأداء الشهري.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // Load the report for the URL/default period once on entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthFor = (rider, monthNumber) =>
    (rider.months || []).find((month) => Number(month.month) === monthNumber && Number(month.year) === Number(report?.year));

  const exportToExcel = () => {
    if (!filteredRiders.length) return;
    const rows = filteredRiders.map((rider) => {
      const row = {
        "الاسم العربي": rider.riderNameAR || "-",
        "الاسم الإنجليزي": rider.riderNameEN || "-",
        "رقم العمل": rider.workingId || "-",
        "رقم الإقامة": rider.iqamaNo || "-",
        "الشركة": rider.companyName || "-",
      };
      appliedMonths.forEach((monthNumber) => {
        const month = monthFor(rider, monthNumber);
        const label = `${MONTH_NAMES[monthNumber - 1]} ${report?.year || year}`;
        row[`${label} - الطلبات المقبولة`] = Number(month?.totalAcceptedOrders || 0);
        row[`${label} - الرفض الحقيقي`] = Number(month?.totalRealRejectedOrders || 0);
        row[`${label} - ساعات العمل`] = Number(month?.totalWorkingHours || 0);
      });
      return row;
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = Object.keys(rows[0]).map((key) => ({ wch: Math.max(14, key.length + 2) }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly performance");
    XLSX.writeFile(workbook, `riders_monthly_performance_${report?.year || year}_${fromMonth}-${toMonth}.xlsx`);
  };

  return (
    <main className="min-h-screen bg-gray-50" dir="rtl">
      <PageHeader
        title="الأداء الشهري للمناديب"
        subtitle="مقارنة الطلبات المقبولة والرفض الحقيقي مع هدف ساعات العمل الشهري"
        icon={CalendarDays}
      />

      <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6">
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm" aria-label="فلاتر التقرير">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <legend className="mb-2 text-sm font-semibold text-gray-700">فترة التقرير</legend>
              <label className="text-sm font-medium text-gray-700">
                السنة
                <input type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(event.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-gray-300 px-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label className="text-sm font-medium text-gray-700">
                من شهر
                <select value={fromMonth} onChange={(event) => setFromMonth(event.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                  {MONTH_NAMES.map((name, index) => <option key={name} value={index + 1}>{index + 1} — {name}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-gray-700">
                إلى شهر
                <select value={toMonth} onChange={(event) => setToMonth(event.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
                  {MONTH_NAMES.map((name, index) => <option key={name} value={index + 1}>{index + 1} — {name}</option>)}
                </select>
              </label>
            </fieldset>
            <button type="button" onClick={fetchReport} disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
              <Search size={18} />
              {loading ? "جارٍ التحميل..." : "عرض التقرير"}
            </button>
          </div>
        </section>

        {error && <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800"><AlertCircle size={20} /><span>{error}</span></div>}

        {report && <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="ملخص التقرير">
            <SummaryCard label="عدد المناديب" value={number(filteredRiders.length)} icon={Users} tone="blue" />
            <SummaryCard label="الطلبات المقبولة" value={number(totals.accepted)} icon={CheckCircle2} tone="green" />
            <SummaryCard label="الرفض الحقيقي" value={number(totals.rejected)} icon={XCircle} tone="red" />
            <SummaryCard label="هدف ساعات العمل" value={`Hunger: ${number(report.hungerMonthlyWorkingHoursTarget || 208)} | Keeta: ${number(report.keetaMonthlyWorkingHoursTarget || 234)}`} icon={Clock3} tone="violet" compact />
          </section>

          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-200 p-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-bold text-gray-900">تفاصيل المناديب</h2>
                <p className="mt-1 text-sm text-gray-500">الفترة: {MONTH_NAMES[Number(report.fromMonth) - 1]} إلى {MONTH_NAMES[Number(report.toMonth) - 1]} {report.year}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative block">
                  <span className="sr-only">بحث عن مندوب</span>
                  <Search className="pointer-events-none absolute right-3 top-3 text-gray-400" size={18} />
                  <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="الاسم، رقم العمل أو الإقامة" className="h-11 w-full rounded-lg border border-gray-300 py-2 pr-10 pl-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:w-64" />
                </label>
                <label>
                  <span className="sr-only">فلترة الشركة</span>
                  <select value={companyFilter} onChange={(event) => setCompanyFilter(event.target.value)} className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:w-44">
                    <option value="">كل الشركات</option>
                    {companies.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                  </select>
                </label>
                <button type="button" onClick={exportToExcel} disabled={!filteredRiders.length} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-green-700 px-4 font-semibold text-green-700 transition-colors hover:bg-green-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:opacity-50">
                  <Download size={18} /> تصدير Excel
                </button>
                {filteredRiders.length > 0 && (
                  <PDFDownloadLink
                    document={<MonthlyRiderPerformancePDF report={report} riders={filteredRiders} months={appliedMonths} />}
                    fileName={`riders_monthly_performance_${report.year}_${report.fromMonth}-${report.toMonth}.pdf`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 font-semibold text-white transition-colors hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                  >
                    {({ loading: pdfLoading }) => <>{pdfLoading ? <span>جارٍ تجهيز PDF...</span> : <><FileDown size={18} /> تصدير PDF</>}</>}
                  </PDFDownloadLink>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-right text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-700">
                  <tr>
                    <th rowSpan="2" className="sticky right-0 z-10 min-w-56 border-b border-l border-gray-200 bg-gray-50 px-4 py-3">المندوب</th>
                    <th rowSpan="2" className="min-w-28 border-b border-l border-gray-200 px-3 py-3">الشركة</th>
                    {appliedMonths.map((monthNumber) => <th key={monthNumber} colSpan="3" className="border-b border-l border-gray-200 px-3 py-3 text-center">{MONTH_NAMES[monthNumber - 1]}</th>)}
                  </tr>
                  <tr>
                    {appliedMonths.flatMap((monthNumber) => [
                      <th key={`${monthNumber}-accepted`} className="min-w-24 border-b border-l border-gray-200 px-3 py-2 text-center">مقبولة</th>,
                      <th key={`${monthNumber}-rejected`} className="min-w-24 border-b border-l border-gray-200 px-3 py-2 text-center">رفض حقيقي</th>,
                      <th key={`${monthNumber}-hours`} className="min-w-24 border-b border-l border-gray-200 px-3 py-2 text-center">ساعات العمل</th>,
                    ])}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRiders.map((rider, index) => <tr key={`${rider.riderId ?? "no-id"}-${rider.companyId ?? "no-company"}-${rider.workingId ?? "no-working-id"}-${rider.iqamaNo ?? "no-iqama"}-${index}`} className="hover:bg-blue-50/50">
                    <td className="sticky right-0 z-[1] border-l border-gray-100 bg-white px-4 py-3 align-top group-hover:bg-blue-50/50">
                      <p className="font-semibold text-gray-900">{rider.riderNameAR || rider.riderNameEN || "-"}</p>
                      {rider.riderNameEN && <p dir="ltr" className="mt-0.5 text-xs text-gray-500">{rider.riderNameEN}</p>}
                      <div className="mt-1 flex flex-wrap gap-1 text-xs text-gray-500"><span>#{rider.workingId || "-"}</span><span>•</span><span>{rider.iqamaNo || "-"}</span></div>
                    </td>
                    <td className="border-l border-gray-100 px-3 py-3 align-top text-gray-700">{rider.companyName || "-"}</td>
                    {appliedMonths.flatMap((monthNumber) => {
                      const month = monthFor(rider, monthNumber);
                      return [
                        <td key={`${monthNumber}-accepted`} className="border-l border-gray-100 px-3 py-3 text-center font-medium text-green-700">{number(month?.totalAcceptedOrders)}</td>,
                        <td key={`${monthNumber}-rejected`} className="border-l border-gray-100 px-3 py-3 text-center font-medium text-red-700">{number(month?.totalRealRejectedOrders)}</td>,
                        <td key={`${monthNumber}-hours`} className="border-l border-gray-100 px-3 py-3 text-center text-gray-700">{number(month?.totalWorkingHours)}</td>,
                      ];
                    })}
                  </tr>)}
                  {!filteredRiders.length && <tr><td colSpan={2 + appliedMonths.length * 3} className="px-4 py-14 text-center text-gray-500">لا توجد بيانات مطابقة للفلاتر المحددة.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </>}
      </div>
    </main>
  );
}

function SummaryCard({ label, value, icon: Icon, tone, compact = false }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className={`rounded-lg p-3 ${colors[tone]}`}><Icon size={22} /></div>
    <div className="min-w-0"><p className="text-sm text-gray-500">{label}</p><p className={`${compact ? "text-sm" : "text-2xl"} mt-1 font-bold text-gray-900 tabular-nums`}>{value}</p></div>
  </div>;
}
