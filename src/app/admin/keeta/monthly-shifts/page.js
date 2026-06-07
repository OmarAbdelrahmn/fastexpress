'use client';

import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import {
    Calendar, Search, Download, ChevronDown, ChevronUp,
    Users, Clock, Package, BarChart3, Filter, RefreshCcw,
    AlertCircle, Upload, FileSpreadsheet, CheckCircle, XCircle, Eye, Printer, X, MapPin
} from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { TokenManager } from '@/lib/auth/tokenManager';
import { useLanguage } from '@/lib/context/LanguageContext';
import * as XLSX from 'xlsx';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues with @react-pdf/renderer
const KeetaShiftReportPDF = dynamic(
    () => import('@/components/keeta/KeetaShiftReportPDF'),
    { ssr: false }
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fastexpress.tryasp.net';

// Maps API result keys to translation keys
const RESULT_KEY_MAP = {
    earliestDate: 'keta.ms.resultEarliestDate',
    totalRowsInExcel: 'keta.ms.resultTotalRowsInExcel',
    driversFound: 'keta.ms.resultDriversFound',
    latestDate: 'keta.ms.resultLatestDate',
    shiftsCreated: 'keta.ms.resultShiftsCreated',
    driversNotFound: 'keta.ms.resultDriversNotFound',
    notInShift: 'keta.ms.resultNotInShift',
    shiftsUpdated: 'keta.ms.resultShiftsUpdated',
    errorRows: 'keta.ms.resultErrorRows',
    noQualifiedSlots: 'keta.ms.resultNoQualifiedSlots',
    processedAt: 'keta.ms.resultProcessedAt',
};

export default function KeetaMonthlyShiftsPage() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('view');

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <PageHeader
                title={t('keta.ms.pageTitle')}
                subtitle={t('keta.ms.pageSubtitle')}
                icon={Calendar}
            />

            {/* Tab Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
                <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
                    <TabButton
                        active={activeTab === 'view'}
                        onClick={() => setActiveTab('view')}
                        icon={Eye}
                        label={t('keta.ms.tabView')}
                    />
                    <TabButton
                        active={activeTab === 'import'}
                        onClick={() => setActiveTab('import')}
                        icon={Upload}
                        label={t('keta.ms.tabImport')}
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 space-y-5">
                {activeTab === 'view' ? <ViewTab /> : <ImportTab />}
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────
   VIEW TAB
────────────────────────────────────────── */
function ViewTab() {
    const { t } = useLanguage();
    const now = new Date();
    const defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [from, setFrom] = useState(defaultFrom);
    const [to, setTo] = useState(defaultTo);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRiders, setExpandedRiders] = useState({});
    const [printRider, setPrintRider] = useState(null);

    const fetchData = async () => {
        if (!from || !to) return;
        setLoading(true);
        setError(null);
        try {
            const response = await ApiService.get(
                API_ENDPOINTS.REPORTS.KETA_VALIDATION_SHIFTS(from, to)
            );
            setData(response);
        } catch (err) {
            setError(err.message || t('common.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const toggleRider = (key) =>
        setExpandedRiders(prev => ({ ...prev, [key]: !prev[key] }));

    const filteredRiders = (data?.riders || []).filter(rider => {
        const q = searchTerm.toLowerCase().trim();
        if (!q) return true;
        return (
            rider.riderNameAR?.toLowerCase().includes(q) ||
            rider.riderNameEN?.toLowerCase().includes(q) ||
            rider.workingId?.toString().includes(q) ||
            rider.supervisor?.toLowerCase().includes(q)
        );
    });

    const formatMinutes = (m) => {
        if (!m && m !== 0) return '-';
        return `${Math.floor(m / 60)}${t('keta.ms.connection').charAt(0)} ${m % 60}د`;
    };

    const handleExport = () => {
        if (!data?.riders?.length) return;
        const rows = [];
        data.riders.forEach(rider => {
            rider.days?.forEach(day => {
                rows.push({
                    [t('employees.nameArabic')]: rider.riderNameAR,
                    [t('employees.nameEnglish')]: rider.riderNameEN,
                    [t('employees.rider')]: rider.workingId,
                    [t('keta.ms.fromDate')]: rider.supervisor,
                    [t('common.date')]: day.reportDate,
                    [t('keta.ms.inShift')]: day.isInShift ? t('common.yes') : t('common.no'),
                    [t('keta.ms.orders')]: day.tasksDelivered,
                    [t('keta.ms.connection')]: day.connectionMinutes,
                    [t('common.workingHours')]: day.connectionTimeRaw,
                });
            });
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Monthly Shifts');
        XLSX.writeFile(wb, `keta_monthly_shifts_${from}_${to}.xlsx`);
    };

    return (
        <>
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium">{t('keta.ms.fromDate')}</label>
                    <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium">{t('keta.ms.toDate')}</label>
                    <input type="date" value={to} onChange={e => setTo(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none" />
                </div>
                <button onClick={fetchData} disabled={loading}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-60">
                    <Filter size={15} />{t('keta.ms.show')}
                </button>
                <button onClick={fetchData} disabled={loading}
                    className="p-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-100 transition-colors" title={t('common.refresh')}>
                    <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
                <div className="flex-1" />
                <button onClick={handleExport} disabled={!data?.riders?.length}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors text-sm font-medium disabled:opacity-40">
                    <Download size={15} />{t('common.exportExcel')}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4">
                    <AlertCircle size={18} /><span className="text-sm">{error}</span>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="py-20 flex flex-col items-center gap-4 text-gray-400">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm">{t('keta.ms.loading')}</p>
                </div>
            )}

            {/* Stats + Riders */}
            {!loading && data && (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard icon={Users} label={t('keta.ms.totalRiders')} value={data.totalRiders} color="bg-indigo-500" />
                        <StatCard icon={BarChart3} label={t('keta.ms.totalShiftRecords')} value={data.totalShiftRecords} color="bg-violet-500" />
                        <StatCard icon={Calendar} label={t('keta.ms.earliestDate')} value={data.earliestDate} color="bg-blue-500" />
                        <StatCard icon={Calendar} label={t('keta.ms.latestDate')} value={data.latestDate} color="bg-sky-500" />
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <input type="text" placeholder={t('keta.ms.searchPlaceholder')}
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm outline-none text-sm" />
                        <Search className="absolute right-4 top-3.5 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div>

                    {/* Work-location modal */}
                    <WorkLocationModal
                        rider={printRider}
                        onClose={() => setPrintRider(null)}
                    />

                    {/* Riders List */}
                    <div className="space-y-3">
                        {filteredRiders.length === 0 && (
                            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-400 text-sm">{t('keta.ms.noResults')}</p>
                            </div>
                        )}
                        {filteredRiders.map((rider, riderIdx) => {
                            const riderKey = `${riderIdx}-${rider.riderId ?? rider.workingId}`;
                            const isOpen = expandedRiders[riderKey];
                            return (
                                <div key={riderKey} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                                        onClick={() => toggleRider(riderKey)}
                                        style={{ cursor: 'pointer' }}>
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {rider.riderNameAR?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-800 text-sm">{rider.riderNameAR}</p>
                                            <p className="text-gray-400 text-xs font-mono">{rider.riderNameEN}</p>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{rider.workingId}</span>
                                                {rider.supervisor && (
                                                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">{rider.supervisor}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-center">
                                            <div className="bg-gray-50 rounded-xl px-3 py-2">
                                                <p className="text-xs text-gray-400">{t('keta.ms.shiftDays')}</p>
                                                <p className="font-bold text-gray-800 text-sm">
                                                    {rider.totalInShiftDays}<span className="text-gray-400 text-xs">/{rider.totalDays}</span>
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl px-3 py-2">
                                                <p className="text-xs text-gray-400">{t('keta.ms.orders')}</p>
                                                <p className="font-bold text-green-600 text-sm">{rider.totalTasksDelivered}</p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl px-3 py-2">
                                                <p className="text-xs text-gray-400">{t('keta.ms.connection')}</p>
                                                <p className="font-bold text-indigo-600 text-sm">{rider.totalConnectionMinutes ? `${Math.floor(rider.totalConnectionMinutes / 60)}س ${rider.totalConnectionMinutes % 60}د` : '-'}</p>
                                            </div>
                                        </div>
                                        {/* Print button – after أيام الشفت stats */}
                                        <button
                                            onClick={e => { e.stopPropagation(); setPrintRider(rider); }}
                                            title="طباعة تقرير الحضور"
                                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors text-xs font-semibold"
                                        >
                                            <Printer size={14} />
                                            طباعة
                                        </button>
                                        <span className="text-gray-400 flex-shrink-0 hidden sm:block">
                                            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </span>
                                    </div>

                                    {isOpen && (
                                        <div className="border-t border-gray-100 bg-slate-50 p-4 space-y-3">
                                            {rider.days?.map((day) => (
                                                <div key={day.reportDate} className="bg-white rounded-xl border border-gray-100 p-4">
                                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-700">{day.reportDate}</span>
                                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${day.isInShift ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                                                {day.isInShift ? t('keta.ms.inShift') : t('keta.ms.absent')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm">
                                                            <span className="flex items-center gap-1 text-green-600 font-semibold">
                                                                <Package size={13} />{day.tasksDelivered} {t('keta.ms.orders')}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                                                                <Clock size={13} />{day.connectionTimeRaw}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {day.qualifiedSlotsCount} {t('keta.ms.qualifiedSlots')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {day.slots?.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {day.slots.map((slot, si) => (
                                                                <SlotBadge key={si} slot={slot} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </>
    );
}

/* ──────────────────────────────────────────
   IMPORT TAB
────────────────────────────────────────── */
function ImportTab() {
    const { t } = useLanguage();
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [uploadedBy, setUploadedBy] = useState('system');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (f) { setFile(f); setResult(null); setError(null); }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) { setFile(f); setResult(null); setError(null); }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const token = TokenManager.getToken();
            const formData = new FormData();
            formData.append('file', file);
            const url = `${API_BASE}${API_ENDPOINTS.REPORTS.KETA_VALIDATION_IMPORT(uploadedBy)}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const json = await res.json();
            if (res.ok) {
                setResult(json);
            } else {
                setError(json?.message || json?.title || t('common.saveError'));
            }
        } catch (err) {
            setError(err.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    // Map API result keys to translated labels
    const labelFor = (key) => {
        const tKey = RESULT_KEY_MAP[key];
        return tKey ? t(tKey) : key;
    };

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            {/* Upload Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                <div>
                    <h3 className="font-bold text-gray-800 text-base mb-1">{t('keta.ms.importTitle')}</h3>
                    <p className="text-sm text-gray-400">{t('keta.ms.importSubtitle')}</p>
                </div>

                {/* Drop Zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${file ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40'}`}
                >
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
                    {file ? (
                        <div className="flex flex-col items-center gap-2">
                            <FileSpreadsheet size={36} className="text-indigo-500" />
                            <p className="font-semibold text-indigo-700 text-sm">{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                            <button onClick={e => { e.stopPropagation(); setFile(null); }}
                                className="text-xs text-red-500 hover:underline mt-1">{t('keta.ms.removeFile')}</button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                            <Upload size={32} className="text-gray-300" />
                            <p className="text-sm font-medium">{t('keta.ms.dragDrop')}</p>
                            <p className="text-xs">{t('keta.ms.fileTypes')}</p>
                        </div>
                    )}
                </div>

                {/* uploadedBy field */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 font-medium">{t('keta.ms.uploadedBy')}</label>
                    <input
                        type="text"
                        value={uploadedBy}
                        onChange={e => setUploadedBy(e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
                        placeholder="system"
                    />
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('keta.ms.uploading')}</>
                    ) : (
                        <><Upload size={16} />{t('keta.ms.uploadFile')}</>
                    )}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4">
                    <XCircle size={18} /><span className="text-sm">{error}</span>
                </div>
            )}

            {/* Result */}
            {result && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <div className="flex items-center gap-2 text-green-600 font-bold text-base">
                        <CheckCircle size={20} />{t('keta.ms.uploadSuccess')}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(result).map(([k, v]) =>
                            typeof v !== 'object' ? (
                                <div key={k} className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-400 font-medium mb-1">{labelFor(k)}</p>
                                    <p className="font-bold text-gray-800 text-lg">{String(v)}</p>
                                </div>
                            ) : null
                        )}
                    </div>
                    {result.errors?.length > 0 && (
                        <div className="border border-red-100 rounded-xl overflow-hidden">
                            <div className="bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 flex items-center gap-2">
                                <XCircle size={14} />{t('keta.ms.errors')} ({result.errors.length})
                            </div>
                            <div className="max-h-52 overflow-y-auto divide-y divide-red-50">
                                {result.errors.map((err, i) => (
                                    <div key={i} className="px-4 py-2 text-xs text-red-600">
                                        {typeof err === 'string' ? err : JSON.stringify(err)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────
   SHARED COMPONENTS
────────────────────────────────────────── */
function TabButton({ active, onClick, icon: Icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${active
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
        >
            <Icon size={15} />{label}
        </button>
    );
}

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={22} className="text-white" />
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value ?? '-'}</p>
            </div>
        </div>
    );
}

function SlotBadge({ slot }) {
    return (
        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-100">
            <Clock size={10} />
            {slot.slotKey} · {slot.durationRaw}
        </span>
    );
}

/* ──────────────────────────────────────────
   WORK LOCATION MODAL + PDF TRIGGER
────────────────────────────────────────── */
function WorkLocationModal({ rider, onClose }) {
    const [workLocation, setWorkLocation] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [generatedAt, setGeneratedAt] = useState('');

    // Reset when rider changes
    useEffect(() => {
        if (rider) {
            setWorkLocation('');
            setConfirmed(false);
            setGeneratedAt('');
        }
    }, [rider]);

    if (!rider) return null;

    const handleConfirm = () => {
        if (!workLocation.trim()) return;
        const now = new Date();
        const formatted = now.toLocaleString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true,
            month: 'numeric', day: 'numeric', year: 'numeric',
        });
        setGeneratedAt(formatted);
        setConfirmed(true);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" dir="rtl">
                {/* Modal header */}
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-l from-amber-50 to-white border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                            <MapPin size={16} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-sm">طباعة تقرير الحضور</p>
                            <p className="text-xs text-gray-400">{rider.riderNameAR}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Modal body */}
                <div className="p-5 space-y-4">
                    {!confirmed ? (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">مكان العمل</label>
                                <div className="relative">
                                    <MapPin size={15} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={workLocation}
                                        onChange={e => setWorkLocation(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                                        placeholder="مثال: JEDDAH - Al-Mohammadiyyah-Al-Naeem"
                                        className="w-full pr-9 pl-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={handleConfirm}
                                    disabled={!workLocation.trim()}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <Printer size={15} />
                                    تأكيد وإنشاء PDF
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-green-800">جاهز للتحميل</p>
                                    <p className="text-xs text-green-600">{workLocation}</p>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-center">
                                <KeetaShiftReportPDF
                                    rider={rider}
                                    workLocation={workLocation}
                                    generatedAt={generatedAt}
                                    onClose={onClose}
                                />
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                                إغلاق
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
