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
    ChevronRight,
    ChevronLeft,
    Filter
} from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import * as XLSX from 'xlsx';


export default function SubstitutionImportPage() {
    const { t, locale } = useLanguage();
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
                'ActualRiderWorkingId': '',
                'SubstituteWorkingId': ''
            }
        ];
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Substitutions");

        // Adjust column widths
        const wscols = [
            { wch: 25 },
            { wch: 25 }
        ];
        ws['!cols'] = wscols;

        XLSX.writeFile(wb, "substitution_import_template.xlsx");
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
            setError(t('common.invalidFileType') || 'يرجى اختيار ملف Excel بصيغة .xlsx أو .xls');
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
            // Use fetch directly for FormData to ensure multipart/form-data is handled correctly
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fastexpress.tryasp.net';
            const response = await fetch(`${baseUrl}${API_ENDPOINTS.SUBSTITUTION.IMPORT}`, {
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
                setFileInputKey(prev => prev + 1); // Reset file input
            } else {
                setError(data.message || data.detail || data.title || t('common.uploadFailed') || 'فشل رفع الملف');
            }
        } catch (err) {
            setError(t('common.connectionError') || 'فشل الاتصال بالخادم');
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

    const getStatusBadge = (status) => {
        switch (status) {
            case 1: // Created
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold whitespace-nowrap">جديد</span>;
            case 2: // Retained
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold whitespace-nowrap">مستمر</span>;
            case 3: // Stopped
                return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold whitespace-nowrap">متوقف</span>;
            case 4: // ActualRiderNotFound
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold whitespace-nowrap">السائق الأساسي مفقود</span>;
            case 5: // SubstituteRiderNotFound
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold whitespace-nowrap">السائق البديل مفقود</span>;
            case 6: // ValidationError
                return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold whitespace-nowrap">خطأ في التحقق</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold whitespace-nowrap">غير معروف</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12" dir="rtl">
            <PageHeader
                title="استيراد البدلاء من Excel"
                subtitle="ارفع ملف Excel لمزامنة بيانات البدلاء مع النظام"
                icon={FileSpreadsheet}
            />

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-4">
                {/* Upload Section */}
                {!result || !uploadSuccess ? (
                    <>
                        <div className="flex justify-end">
                            <button
                                onClick={downloadTemplate}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 active:scale-95"
                            >
                                <Download size={20} />
                                تحميل نموذج ملف الـ Excel
                            </button>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">

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
                                    <div className="mt-6 flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in zoom-in duration-300">
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
                                                    <>
                                                        <RefreshCcw size={18} className="animate-spin" />
                                                        جاري المعالجة...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload size={18} />
                                                        رفع ومعالجة الملف
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 animate-in fade-in zoom-in duration-300">
                                        <AlertCircle size={20} />
                                        <p className="font-medium">{error}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (

                    <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-3 rounded-full">
                                <CheckCircle size={32} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-green-800">تمت معالجة الملف بنجاح</h3>
                                <p className="text-green-700 font-medium">تم تحديث بيانات البدلاء في النظام بناءً على الملف المرفوع.</p>
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

                {/* Results Section */}
                {result && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            <StatCard label="إجمالي السجلات" value={result.totalRecordsInExcel ?? result.TotalRecordsInExcel} color="blue" icon={Info} />
                            <StatCard label="تم إنشاؤه" value={result.activeSubstitutionsCreated ?? result.ActiveSubstitutionsCreated} color="green" icon={CheckCircle} />
                            <StatCard label="تم الاحتفاظ به" value={result.activeSubstitutionsRetained ?? result.ActiveSubstitutionsRetained} color="indigo" icon={RefreshCcw} />
                            <StatCard label="تم إيقافه" value={result.activeSubstitutionsStopped ?? result.ActiveSubstitutionsStopped} color="orange" icon={XCircle} />
                            <StatCard label="أخطاء التحقق" value={result.validationErrors ?? result.ValidationErrors} color="red" icon={AlertCircle} />
                            <StatCard label="سائق مفقود" value={result.actualRiderNotFound ?? result.ActualRiderNotFound} color="red" icon={XCircle} />
                            <StatCard label="بديل مفقود" value={result.substituteRiderNotFound ?? result.SubstituteRiderNotFound} color="red" icon={XCircle} />
                        </div>

                        {/* Processing Errors */}
                        {(result.processingErrors || result.ProcessingErrors) && (result.processingErrors || result.ProcessingErrors).length > 0 && (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                                    <AlertCircle size={24} />
                                    أخطاء المعالجة الفنية
                                </h3>
                                <div className="bg-white/50 rounded-xl p-4 space-y-2">
                                    {(result.processingErrors || result.ProcessingErrors).map((err, idx) => (
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
                            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm">
                                <div>
                                    <h3 className="text-xl font-extrabold text-gray-900">تفاصيل نتائج الاستيراد</h3>
                                    <p className="text-sm text-gray-500 mt-1">قائمة بجميع السجلات التي تمت معالجتها من الملف</p>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">تاريخ المعالجة:</span>
                                    <span className="text-sm font-bold text-gray-700">
                                        {new Date(result.processedAt).toLocaleString('ar-SA')}
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-right border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">السطر</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">السائق الأساسي</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">الاسم</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">السائق البديل</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">الاسم</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">الحالة</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">الإجراء</th>
                                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b text-center">الملاحظات والأخطاء</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {(result.details || result.Details || []).map((detail, idx) => (
                                            <tr key={idx} className="group hover:bg-blue-50/30 transition-all duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-300 group-hover:text-blue-200 transition-colors">#{detail.rowNumber ?? detail.RowNumber}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold border border-gray-200 group-hover:bg-blue-100 group-hover:border-blue-200 group-hover:text-blue-700">
                                                        {detail.actualRiderWorkingId ?? detail.ActualRiderWorkingId}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-bold">{detail.actualRiderName ?? detail.ActualRiderName ?? '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold border border-gray-200 group-hover:bg-purple-100 group-hover:border-purple-200 group-hover:text-purple-700">
                                                        {detail.substituteWorkingId ?? detail.SubstituteWorkingId}
                                                    </code>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-bold">{detail.substituteRiderName ?? detail.SubstituteRiderName ?? '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(detail.status ?? detail.Status)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`text-sm font-black ${(detail.action ?? detail.Action) ? 'text-blue-600' : 'text-gray-300'}`}>
                                                        {(detail.action ?? detail.Action) || 'لا يوجد'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-red-500 max-w-xs">{(detail.errorMessage ?? detail.ErrorMessage) || '-'}</td>
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
        blue: 'bg-blue-50 text-blue-700 border-blue-100 group-hover:bg-blue-100',
        green: 'bg-green-50 text-green-700 border-green-100 group-hover:bg-green-100',
        orange: 'bg-orange-50 text-orange-700 border-orange-100 group-hover:bg-orange-100',
        red: 'bg-red-50 text-red-700 border-red-100 group-hover:bg-red-100',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100 group-hover:bg-indigo-100',
    };

    return (
        <div className={`group p-5 rounded-3xl border ${colorMap[color]} shadow-sm flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
            <div className={`p-2 rounded-xl ${colorMap[color]} bg-opacity-20 transition-transform group-hover:scale-110`}>
                <Icon size={20} />
            </div>
            <div className="text-3xl font-black tracking-tighter leading-none">{value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-tight">{label}</div>
        </div>
    );
}
