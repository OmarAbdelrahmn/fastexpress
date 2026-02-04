'use client';

import { useState } from 'react';
import {
    Upload,
    FileSpreadsheet,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCcw,
    Download,
    Info,
    Calendar,
    BarChart3
} from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function KetaFreelancerImportPage() {
    const { t } = useLanguage();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(0);

    const downloadTemplate = () => {
        const data = [
            {
                'WorkingId': '12345',
                'Month': '2025-02',
                'TotalOrders': 150
            }
        ];
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "KetaFreelancer");

        const wscols = [
            { wch: 20 },
            { wch: 15 },
            { wch: 15 }
        ];
        ws['!cols'] = wscols;

        XLSX.writeFile(wb, "keta_freelancer_template.xlsx");
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        const extension = file.name.split('.').pop().toLowerCase();
        if (['xlsx', 'xls'].includes(extension)) {
            setFile(file);
            setError(null);
            setUploadSuccess(false);
            setResult(null);
        } else {
            setError('يرجى اختيار ملف Excel بصيغة .xlsx أو .xls');
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setResult(null);
        setError(null);
        setUploadSuccess(false);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const baseUrl = 'https://fastexpress.tryasp.net'; // Hardcoded as per environment or config
            const response = await fetch(`${baseUrl}${API_ENDPOINTS.REPORTS.KETA_FREELANCER.IMPORT}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
                setUploadSuccess(true);
                setFile(null);
                setFileInputKey(prev => prev + 1);
            } else {
                setError(data.message || data.detail || data.title || 'فشل رفع الملف');
            }
        } catch (err) {
            setError('فشل الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    const resetImport = () => {
        setFile(null);
        setResult(null);
        setError(null);
        setUploadSuccess(false);
        setFileInputKey(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12" dir="rtl">
            <PageHeader
                title="استيراد كيتا فري لانسر"
                subtitle="ارفع ملف Excel لتحديث بيانات مناديب كيتا فري لانسر"
                icon={FileSpreadsheet}
            />

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-4">

                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-200 gap-4 mb-6">
                    <Link
                        href="/admin/shifts/keta-freelancer"
                        className={`pb-4 px-2 font-bold text-sm transition-all ${usePathname() === '/admin/shifts/keta-freelancer' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        عرض البيانات
                    </Link>
                    <Link
                        href="/admin/shifts/keta-freelancer/import"
                        className={`pb-4 px-2 font-bold text-sm transition-all ${usePathname() === '/admin/shifts/keta-freelancer/import' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        استيراد من Excel
                    </Link>
                </div>

                {!result || !uploadSuccess ? (
                    <>
                        {/* <div className="flex justify-end">
                            <button
                                onClick={downloadTemplate}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-95"
                            >
                                <Download size={20} />
                                تحميل نموذج ملف الـ Excel
                            </button>
                        </div> */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8">
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all ${dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50/50'
                                        }`}
                                >
                                    <input
                                        key={fileInputKey}
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                        accept=".xlsx, .xls"
                                    />
                                    <div className="bg-blue-100 p-4 rounded-full mb-4">
                                        <Upload size={32} className="text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {file ? file.name : 'اسحب وافلت ملف Excel هنا'}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6 text-center">
                                        أو انقر لاختيار ملف من جهازك. الصيغ المدعومة: .xlsx, .xls
                                    </p>
                                </div>

                                {file && (
                                    <div className="mt-6 flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex-1 flex items-center gap-3">
                                            <div className="bg-blue-600 p-2 rounded-lg">
                                                <FileSpreadsheet size={20} className="text-white" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{file.name}</div>
                                                <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setFile(null)}
                                                className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-white transition-all active:scale-95"
                                            >
                                                إلغاء
                                            </button>
                                            <button
                                                onClick={handleUpload}
                                                disabled={loading}
                                                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {loading ? (
                                                    <><RefreshCcw size={18} className="animate-spin" /> جاري المعالجة...</>
                                                ) : (
                                                    <><Upload size={18} /> رفع ومعالجة الملف</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
                                        <AlertCircle size={20} />
                                        <p className="font-medium">{error}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-3 rounded-full">
                                <CheckCircle size={32} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-green-800">تمت معالجة الملف بنجاح</h3>
                                <p className="text-green-700 font-medium">تم تحديث بيانات كيتا فري لانسر في النظام.</p>
                            </div>
                        </div>
                        <button
                            onClick={resetImport}
                            className="px-6 py-3 bg-white text-green-700 border border-green-200 rounded-xl font-bold hover:bg-green-100 transition-all flex items-center gap-2 whitespace-nowrap shadow-sm"
                        >
                            <RefreshCcw size={18} />
                            استيراد ملف آخر
                        </button>
                    </div>
                )}

                {result && (
                    <div className="space-y-8">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard label="إجمالي السجلات" value={result.totalRecords ?? result.TotalRecords} color="blue" icon={Info} />
                            <StatCard label="استيراد ناجح" value={result.successfulImports ?? result.SuccessfulImports} color="green" icon={CheckCircle} />
                            <StatCard label="سجلات فاشلة" value={result.failedRecords ?? result.FailedRecords} color="red" icon={XCircle} />
                            <StatCard label="تاريخ المعالجة" value={new Date(result.processedAt ?? result.ProcessedAt).toLocaleString('ar-SA')} color="indigo" icon={Calendar} />
                        </div>

                        {/* Errors List */}
                        {(result.errors ?? result.Errors) && (result.errors ?? result.Errors).length > 0 && (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                                    <AlertCircle size={24} />
                                    أخطاء عامة
                                </h3>
                                <div className="bg-white/50 rounded-xl p-4 space-y-2">
                                    {(result.errors ?? result.Errors).map((err, idx) => (
                                        <div key={idx} className="flex gap-2 text-red-700 text-sm">
                                            <span className="font-bold">•</span>
                                            <span>{err}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Detailed Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h3 className="text-xl font-extrabold text-gray-900">تفاصيل النتائج</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
                                            <th className="px-6 py-4 border-b">السطر</th>
                                            <th className="px-6 py-4 border-b">المعرف الوظيفي</th>
                                            <th className="px-6 py-4 border-b">الشهر</th>
                                            <th className="px-6 py-4 border-b">إجمالي الطلبات</th>
                                            <th className="px-6 py-4 border-b">الحالة</th>
                                            <th className="px-6 py-4 border-b">النتيجة</th>
                                            <th className="px-6 py-4 border-b">ملاحظات/أخطاء</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {(result.results ?? result.Results ?? []).map((row, idx) => (
                                            <tr key={idx} className="hover:bg-blue-50/30 transition-all">
                                                <td className="px-6 py-4 text-sm font-black text-gray-300">#{row.rowNumber ?? row.RowNumber}</td>
                                                <td className="px-6 py-4 font-mono font-bold text-gray-700">{row.workingId ?? row.WorkingId}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{row.month ?? row.Month}</td>
                                                <td className="px-6 py-4 font-bold text-blue-600">{row.totalOrders ?? row.TotalOrders}</td>
                                                <td className="px-6 py-4">
                                                    {(row.success ?? row.Success) ? (
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold whitespace-nowrap">ناجح</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold whitespace-nowrap">فاشل</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-1">
                                                        {(row.created ?? row.Created) && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold whitespace-nowrap">إنشاء</span>}
                                                        {(row.updated ?? row.Updated) && <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold whitespace-nowrap">تحديث</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium min-w-[200px]">
                                                    {(row.errorMessage ?? row.ErrorMessage) && <div className="text-red-500 font-bold mb-1">{row.errorMessage ?? row.ErrorMessage}</div>}
                                                    {(row.warnings ?? row.Warnings ?? []).map((w, i) => <div key={i} className="text-orange-500">• {w}</div>)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, color, icon: Icon }) {
    const colorMap = {
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        green: 'bg-green-50 text-green-700 border-green-100',
        red: 'bg-red-50 text-red-700 border-red-100',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    };
    return (
        <div className={`p-5 rounded-3xl border ${colorMap[color]} shadow-sm flex flex-col items-center justify-center text-center gap-2`}>
            <div className={`p-2 rounded-xl ${colorMap[color]} bg-opacity-20`}>
                <Icon size={20} />
            </div>
            <div className="text-2xl font-black">{value}</div>
            <div className="text-[10px] font-black uppercase opacity-60">{label}</div>
        </div>
    );
}
