'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import { ClipboardList, Search, ArrowRight, Calendar, Info, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const ACTION_STYLES = {
    Add:    { label: 'إضافة',   bg: 'bg-green-100',  text: 'text-green-700'  },
    Update: { label: 'تعديل',   bg: 'bg-blue-100',   text: 'text-blue-700'   },
    Delete: { label: 'حذف',     bg: 'bg-red-100',     text: 'text-red-700'    },
    Use:    { label: 'استخدام', bg: 'bg-orange-100', text: 'text-orange-700' },
};

function ActionBadge({ action }) {
    const style = ACTION_STYLES[action] || { label: action, bg: 'bg-gray-100', text: 'text-gray-700' };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
            {style.label}
        </span>
    );
}

function DiffCell({ before, after, formatter }) {
    const fmt = formatter || ((v) => (v == null ? '-' : v));
    const changed = String(before) !== String(after);
    return (
        <div className="text-xs leading-tight">
            <span className={changed ? 'text-red-500 line-through mr-1' : 'text-gray-500'}>
                {fmt(before)}
            </span>
            {changed && (
                <span className="text-green-600 font-semibold">{fmt(after)}</span>
            )}
        </div>
    );
}

const toDateInput = (d) => d.toISOString().split('T')[0];

export default function MemberInventoryAuditPage() {
    const router = useRouter();

    const today      = new Date();
    const firstMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const tomorrow   = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [fromDate, setFromDate] = useState(toDateInput(firstMonth));
    const [toDate, setToDate]     = useState(toDateInput(tomorrow));
    const [data, setData]         = useState([]);
    const [loading, setLoading]   = useState(false);
    const [alert, setAlert]       = useState(null);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 4000);
    };

    const fetchData = async () => {
        if (!fromDate || !toDate) {
            showAlert('error', 'الرجاء اختيار تاريخ البداية والنهاية');
            return;
        }
        if (new Date(fromDate) > new Date(toDate)) {
            showAlert('error', 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
            return;
        }
        setLoading(true);
        setSearched(true);
        try {
            const response = await ApiService.get(
                API_ENDPOINTS.MEMBER.INVENTORY_AUDIT_LOG({ fromDate, toDate })
            );
            setData(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error('Error loading audit log:', err);
            showAlert('error', err.message || 'حدث خطأ أثناء تحميل البيانات');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExcelExport = () => {
        if (!data || data.length === 0) {
            showAlert('error', 'لا توجد بيانات للتصدير');
            return;
        }
        const rows = data.map((row) => ({
            '#':          row.id,
            'النوع':      row.itemType || '-',
            'اسم الصنف': row.itemName || '-',
            'العملية':   row.action || '-',
            'الموقع قبل':  row.locationBefore || '-',
            'الموقع بعد':  row.locationAfter  || '-',
            'الكمية قبل':  row.quantityBefore ?? '-',
            'الكمية بعد':  row.quantityAfter  ?? '-',
            'السعر قبل':  row.priceBefore != null ? `${Number(row.priceBefore).toFixed(2)} ر.س` : '-',
            'السعر بعد':  row.priceAfter  != null ? `${Number(row.priceAfter).toFixed(2)} ر.س`  : '-',
            'المنفذ':     row.performedBy || '-',
            'التاريخ':    row.performedAt ? new Date(row.performedAt).toLocaleString('ar-SA') : '-',
            'ملاحظات':   row.notes || '-',
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [
            { wch: 6 }, { wch: 14 }, { wch: 28 }, { wch: 10 },
            { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 10 },
            { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 20 }, { wch: 30 },
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'سجل المخزون');
        XLSX.writeFile(wb, `inventory-audit_${fromDate}_to_${toDate}.xlsx`);
    };

    return (
        <div className="space-y-5" dir="rtl">
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 px-4 md:px-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 h-10 px-3"
                    >
                        <ArrowRight size={18} className="ml-1" />
                        <span className="text-sm">رجوع</span>
                    </Button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ClipboardList size={22} className="text-indigo-600" />
                            سجل تغييرات المخزون
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">عرض جميع عمليات الإضافة والتعديل والحذف في مستودعك</p>
                    </div>
                </div>

                <Button
                    onClick={handleExcelExport}
                    disabled={data.length === 0}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50 h-10 px-4"
                >
                    <Download size={16} className="ml-2" />
                    تصدير Excel
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 mx-4 md:mx-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                            <Calendar size={13} className="text-blue-500" /> من تاريخ
                        </label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-[42px]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                            <Calendar size={13} className="text-red-400" /> إلى تاريخ
                        </label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-[42px]"
                        />
                    </div>
                    <Button
                        onClick={fetchData}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-[42px]"
                    >
                        {loading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Search size={16} className="ml-2" />
                                بحث
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mx-4 md:mx-6">
                <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 text-sm">
                        سجل حركات المخزون
                        {data.length > 0 && (
                            <span className="mr-2 text-xs text-gray-400 font-normal">({data.length} سجل)</span>
                        )}
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-600 min-w-[800px]">
                        <thead className="text-xs text-gray-600 bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">النوع</th>
                                <th className="px-4 py-3">اسم الصنف</th>
                                <th className="px-4 py-3">العملية</th>
                                <th className="px-4 py-3">الموقع</th>
                                <th className="px-4 py-3">الكمية</th>
                                <th className="px-4 py-3">السعر</th>
                                <th className="px-4 py-3">المنفذ</th>
                                <th className="px-4 py-3">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                                        <span className="inline-block w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                                        <p className="mt-2 text-sm">جاري التحميل...</p>
                                    </td>
                                </tr>
                            ) : !searched ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                                        <Info size={36} className="mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">اختر نطاق تاريخ واضغط بحث</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                                        <ClipboardList size={36} className="mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">لا توجد سجلات في هذه الفترة</p>
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, idx) => (
                                    <tr key={row.id ?? idx} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-gray-400 text-xs">{row.id}</td>

                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700 font-medium">
                                                {row.itemType || '-'}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {row.itemName || `#${row.itemId}`}
                                        </td>

                                        <td className="px-4 py-3">
                                            <ActionBadge action={row.action} />
                                        </td>

                                        <td className="px-4 py-3">
                                            <DiffCell before={row.locationBefore} after={row.locationAfter} />
                                        </td>

                                        <td className="px-4 py-3">
                                            <DiffCell before={row.quantityBefore} after={row.quantityAfter} />
                                        </td>

                                        <td className="px-4 py-3">
                                            <DiffCell
                                                before={row.priceBefore}
                                                after={row.priceAfter}
                                                formatter={(v) => v != null ? `${Number(v).toFixed(2)} ر.س` : '-'}
                                            />
                                        </td>

                                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                                            {row.performedBy || '-'}
                                        </td>

                                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                            {row.performedAt
                                                ? new Date(row.performedAt).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })
                                                : '-'
                                            }
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
