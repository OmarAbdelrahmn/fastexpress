'use client';
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/layout/pageheader';
import { walletService } from '@/lib/api/walletService';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
    Upload,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    Wallet,
    ArrowUpDown,
    User,
    Calendar,
    FileDown,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function WalletPage() {
    const { t, locale } = useLanguage();
    
    // ── Import state ──────────────────────────────────────────────────────────
    const [file, setFile] = useState(null);
    const [importDate, setImportDate] = useState(new Date().toISOString().split('T')[0]);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [importError, setImportError] = useState(null);

    // ── Records state ─────────────────────────────────────────────────────────
    const [records, setRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [recordsError, setRecordsError] = useState(null);

    // ── Search / filter ───────────────────────────────────────────────────────
    const [search, setSearch] = useState('');

    // ── Fetch records ─────────────────────────────────────────────────────────
    const fetchRecords = useCallback(async () => {
        setLoadingRecords(true);
        setRecordsError(null);
        try {
            const data = await walletService.getAllRecords();
            setRecords(Array.isArray(data) ? data : []);
        } catch (err) {
            setRecordsError(err.message || t('common.loadError'));
        } finally {
            setLoadingRecords(false);
        }
    }, [t]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    // ── Import handler ────────────────────────────────────────────────────────
    const handleFileChange = (e) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            setImportResult(null);
            setImportError(null);
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setImporting(true);
        setImportError(null);
        setImportResult(null);
        try {
            const result = await walletService.importWalletFile(file, importDate);
            setImportResult(result);
            setFile(null);
            // Refresh records after successful import
            await fetchRecords();
        } catch (err) {
            setImportError(err.message || t('common.error'));
        } finally {
            setImporting(false);
        }
    };

    // ── Filtered records ──────────────────────────────────────────────────────
    const filteredRecords = records.filter((r) => {
        const term = search.toLowerCase();
        return (
            r.workedRiderWorkingId?.toLowerCase().includes(term) ||
            r.workedRiderNameAR?.includes(term) ||
            r.workedRiderHousingName?.toLowerCase().includes(term) ||
            r.mainRiderWorkingId?.toLowerCase().includes(term) ||
            r.mainRiderNameAR?.includes(term) ||
            r.date?.includes(term)
        );
    });

    // ── Export to Excel ───────────────────────────────────────────────────────
    const handleExportExcel = () => {
        if (!records || records.length === 0) return;

        const excelData = records.map(r => ({
            [t('wallet.date')]: r.date,
            [t('wallet.workedRiderId')]: r.workedRiderWorkingId,
            [t('wallet.workedRiderName')]: r.workedRiderNameAR,
            [t('wallet.housing')]: r.workedRiderHousingName || '',
            [t('wallet.substitution')]: r.isSubstitution ? t('common.yes') : t('common.no'),
            [t('wallet.mainRiderId')]: r.isSubstitution ? r.mainRiderWorkingId : '',
            [t('wallet.mainRiderName')]: r.isSubstitution ? r.mainRiderNameAR : '',
            [t('wallet.amount')]: r.amount
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Wallet Records");
        XLSX.writeFile(wb, `wallet_records_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // ── Amount color helper ───────────────────────────────────────────────────
    const amountClass = (amount) =>
        amount >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold';

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <PageHeader
                title={t('hunger.walletTitle')}
                subtitle={t('wallet.importSubtitle')}
                icon={Wallet}
            />

            <div className="container mx-auto px-4 mt-8 space-y-8">
                {/* ── Import Section ─────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Upload size={18} className="text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800">{t('wallet.importTitle')}</h2>
                            <p className="text-xs text-gray-500">{t('wallet.importSubtitle')}</p>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Date picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Calendar size={14} className="inline mr-1" />
                                    {t('wallet.recordDate')}
                                </label>
                                <input
                                    type="date"
                                    value={importDate}
                                    onChange={(e) => setImportDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-sm"
                                />
                            </div>

                            {/* File upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('wallet.excelFile')}
                                </label>
                                <label className="flex items-center gap-3 w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-emerald-50 hover:border-emerald-400 transition-colors">
                                    <Upload size={18} className="text-gray-400" />
                                    <span className="text-sm text-gray-500 truncate">
                                        {file ? file.name : t('wallet.chooseFile')}
                                    </span>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Upload button */}
                        {file && (
                            <div className="mt-4 flex items-center gap-4">
                                <button
                                    onClick={handleImport}
                                    disabled={importing}
                                    className={`px-6 py-2 rounded-lg text-white text-sm font-semibold transition-colors ${
                                        importing
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                                >
                                    {importing ? t('wallet.importing') : t('wallet.importNow')}
                                </button>
                                <button
                                    onClick={() => { setFile(null); setImportError(null); }}
                                    className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    {t('common.cancel')}
                                </button>
                            </div>
                        )}

                        {/* Import error */}
                        {importError && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
                                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                {importError}
                            </div>
                        )}

                        {/* Import result */}
                        {importResult && (
                            <div className="mt-4 animate-pulse-once">
                                <div className="flex items-center gap-2 mb-3 text-emerald-700 font-semibold">
                                    <CheckCircle size={18} />
                                    {t('wallet.importComplete')}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {[
                                        { label: t('wallet.totalRecords'), value: importResult.totalRecords, color: 'bg-gray-100 text-gray-700' },
                                        { label: t('wallet.created'), value: importResult.createdCount, color: 'bg-blue-50 text-blue-700' },
                                        { label: t('wallet.updated'), value: importResult.updatedCount, color: 'bg-amber-50 text-amber-700' },
                                        { label: t('wallet.errors'), value: importResult.errorCount, color: 'bg-red-50 text-red-700' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className={`${color} rounded-lg p-4 text-center`}>
                                            <p className="text-xs mb-1 opacity-70">{label}</p>
                                            <p className="text-2xl font-bold">{value ?? 0}</p>
                                        </div>
                                    ))}
                                </div>

                                {importResult.errors?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-red-600 flex items-center gap-1 mb-2">
                                            <AlertTriangle size={14} /> {t('wallet.rowErrors')}
                                        </h4>
                                        <div className="overflow-x-auto rounded-lg border border-red-100">
                                            <table className="min-w-full text-sm divide-y divide-gray-100">
                                                <thead className="bg-red-50">
                                                    <tr>
                                                        {[t('wallet.row'), t('wallet.workingId'), t('wallet.message')].map((h) => (
                                                            <th key={h} className={`px-4 py-2 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-red-600 uppercase`}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-100">
                                                    {importResult.errors.map((err, i) => (
                                                        <tr key={i} className="hover:bg-red-50">
                                                            <td className="px-4 py-2 text-gray-500">{err.rowNumber}</td>
                                                            <td className="px-4 py-2 font-medium text-gray-800">{err.workingId}</td>
                                                            <td className="px-4 py-2 text-gray-600">{err.message}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Records Section ────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                                <ArrowUpDown size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800">{t('wallet.allRecords')}</h2>
                                <p className="text-xs text-gray-500">{t('wallet.totalRecordsCount', { count: records.length })}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExportExcel}
                                disabled={records.length === 0}
                                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:bg-gray-300"
                            >
                                <FileDown size={16} />
                                <span className="hidden md:inline">{t('common.exportExcel')}</span>
                            </button>
                            <input
                                type="text"
                                placeholder={t('wallet.searchPlaceholder')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none w-64"
                            />
                            <button
                                onClick={fetchRecords}
                                disabled={loadingRecords}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                title={t('common.refresh')}
                            >
                                <RefreshCw size={16} className={`text-gray-500 ${loadingRecords ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {recordsError && (
                        <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                            <AlertTriangle size={16} />
                            {recordsError}
                        </div>
                    )}

                    {loadingRecords ? (
                        <div className="flex items-center justify-center py-16 text-gray-400">
                            <RefreshCw size={24} className="animate-spin mr-2" />
                            {t('wallet.loadingRecords')}
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <Wallet size={40} className="mb-3 opacity-30" />
                            <p className="text-sm">{search ? t('wallet.noRecordsMatch') : t('wallet.noRecordsYet')}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {[
                                            t('wallet.date'), 
                                            t('wallet.workedRiderId'), 
                                            t('wallet.workedRiderName'), 
                                            t('wallet.housing'), 
                                            t('wallet.substitution'), 
                                            t('wallet.mainRiderId'), 
                                            t('wallet.mainRiderName'), 
                                            t('wallet.amount')
                                        ].map((h) => (
                                            <th key={h} className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                            {/* Date */}
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                                                {record.date}
                                            </td>
                                            {/* Worked Rider ID */}
                                            <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">
                                                {record.workedRiderWorkingId}
                                            </td>
                                            {/* Worked Rider Name */}
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-700" dir="rtl">
                                                {record.workedRiderNameAR}
                                            </td>
                                            {/* Housing */}
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600" dir="rtl">
                                                {record.workedRiderHousingName || '—'}
                                            </td>
                                            {/* Substitution badge */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {record.isSubstitution ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                                                        <User size={10} /> {t('wallet.sub')}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">—</span>
                                                )}
                                            </td>
                                            {/* Main Rider ID — only meaningful when substitution */}
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                                                {record.isSubstitution ? record.mainRiderWorkingId : '—'}
                                            </td>
                                            {/* Main Rider Name */}
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-700" dir="rtl">
                                                {record.isSubstitution ? record.mainRiderNameAR : '—'}
                                            </td>
                                            {/* Amount */}
                                            <td className={`px-4 py-3 whitespace-nowrap ${amountClass(record.amount)}`}>
                                                {record.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
