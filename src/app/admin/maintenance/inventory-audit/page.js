'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import PageHeader from '@/components/layout/pageheader';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import { ClipboardList, Search, Download, ChevronLeft, ChevronRight, Calendar, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

const ACTION_STYLES = {
    Add:    { label: 'إضافة',  bg: 'bg-green-100',  text: 'text-green-700'  },
    Update: { label: 'تعديل',  bg: 'bg-blue-100',   text: 'text-blue-700'   },
    Delete: { label: 'حذف',    bg: 'bg-red-100',     text: 'text-red-700'    },
    Use:    { label: 'استخدام',bg: 'bg-orange-100', text: 'text-orange-700' },
};

function ActionBadge({ action }) {
    const style = ACTION_STYLES[action] || { label: action, bg: 'bg-gray-100', text: 'text-gray-700' };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
            {style.label}
        </span>
    );
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' });
}

function DiffCell({ before, after, formatter }) {
    const fmt = formatter || ((v) => (v == null ? '-' : v));
    const changed = before !== after;
    return (
        <div className="text-xs">
            <span className={changed ? 'text-red-500 line-through mr-1' : 'text-gray-500'}>
                {fmt(before)}
            </span>
            {changed && (
                <span className="text-green-600 font-semibold">{fmt(after)}</span>
            )}
        </div>
    );
}

export default function InventoryAuditPage() {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const fmtDate = (d) => d.toISOString().split('T')[0];

    const [fromDate, setFromDate] = useState(fmtDate(firstOfMonth));
    const [toDate, setToDate]     = useState(fmtDate(tomorrow));
    const [page, setPage]         = useState(1);
    const pageSize                = 50;

    const [data, setData]         = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading]   = useState(false);
    const [alert, setAlert]       = useState(null);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        fetchData(1);
    }, []);

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 4000);
    };

    const fetchData = async (pageNum = page) => {
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
                API_ENDPOINTS.INVENTORY_AUDIT.LIST({ fromDate, toDate, page: pageNum, pageSize })
            );

            if (response && typeof response === 'object' && 'items' in response) {
                setData(response.items || []);
                setTotalCount(response.totalCount || 0);
            } else if (Array.isArray(response)) {
                // fallback if API returns array directly
                setData(response);
                setTotalCount(response.length);
            } else {
                setData([]);
                setTotalCount(0);
            }
        } catch (err) {
            console.error('Error loading audit log:', err);
            showAlert('error', err.message || 'حدث خطأ أثناء تحميل البيانات');
            setData([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchData(1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchData(newPage);
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const handleExcelExport = () => {
        if (!data || data.length === 0) {
            showAlert('error', 'لا توجد بيانات للتصدير');
            return;
        }
        const rows = data.map((row) => ({
            '#': row.id,
            'النوع':          row.itemType || '-',
            'رقم الصنف':      row.itemId,
            'اسم الصنف':      row.itemName || '-',
            'العملية':        row.action || '-',
            'الموقع قبل':     row.locationBefore || '-',
            'الموقع بعد':     row.locationAfter || '-',
            'الكمية قبل':     row.quantityBefore ?? '-',
            'الكمية بعد':     row.quantityAfter ?? '-',
            'السعر قبل':      row.priceBefore != null ? `${Number(row.priceBefore).toFixed(2)} ر.س` : '-',
            'السعر بعد':      row.priceAfter  != null ? `${Number(row.priceAfter).toFixed(2)} ر.س`  : '-',
            'المنفذ':         row.performedBy || '-',
            'التاريخ':        row.performedAt ? new Date(row.performedAt).toLocaleString('ar-SA') : '-',
            'ملاحظات':        row.notes || '-',
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [
            { wch: 6 }, { wch: 14 }, { wch: 10 }, { wch: 28 }, { wch: 10 },
            { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 10 },
            { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 20 }, { wch: 30 },
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'سجل المخزون');
        XLSX.writeFile(wb, `inventory-audit_${fromDate}_to_${toDate}.xlsx`);
    };

    return (
        <div className="space-y-6" dir="rtl">
            <PageHeader
                title="سجل تغييرات المخزون"
                subtitle="عرض جميع عمليات الإضافة والتعديل والحذف في المخزون"
                icon={ClipboardList}
            />

            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            {/* Filters */}
            <Card>
                <div className="flex flex-col md:flex-row gap-4 items-end flex-wrap p-1">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <Calendar size={14} className="text-gray-400" />
                            من تاريخ
                        </label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm h-[42px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <Calendar size={14} className="text-gray-400" />
                            إلى تاريخ
                        </label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm h-[42px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <Button
                        onClick={handleSearch}
                        disabled={loading}
                        variant="primary"
                        className="h-[42px] bg-blue-600 hover:bg-blue-700 text-white px-6"
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

                    <Button
                        onClick={handleExcelExport}
                        disabled={data.length === 0}
                        variant="outline"
                        className="h-[42px] border-green-600 text-green-600 hover:bg-green-50 px-5"
                    >
                        <Download size={16} className="ml-2" />
                        تصدير Excel
                    </Button>

                    {totalCount > 0 && (
                        <span className="text-sm text-gray-500 mr-auto">
                            إجمالي النتائج: <strong>{totalCount}</strong>
                        </span>
                    )}
                </div>
            </Card>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-600 min-w-[900px]">
                        <thead className="text-xs text-gray-700 bg-gray-50 uppercase">
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
                                <th className="px-4 py-3">ملاحظات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                                        <span className="inline-block w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                                        <p className="mt-2 text-sm">جاري التحميل...</p>
                                    </td>
                                </tr>
                            ) : !searched ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                                        <Info size={40} className="mx-auto mb-2 text-gray-300" />
                                        <p>اختر نطاق تاريخ واضغط بحث لعرض السجل</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                                        <ClipboardList size={40} className="mx-auto mb-2 text-gray-300" />
                                        <p>لا توجد سجلات في هذه الفترة</p>
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, idx) => (
                                    <tr
                                        key={row.id ?? idx}
                                        className="bg-white border-b hover:bg-gray-50 transition-colors"
                                    >
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
                                            <DiffCell
                                                before={row.locationBefore}
                                                after={row.locationAfter}
                                            />
                                        </td>

                                        <td className="px-4 py-3">
                                            <DiffCell
                                                before={row.quantityBefore}
                                                after={row.quantityAfter}
                                            />
                                        </td>

                                        <td className="px-4 py-3">
                                            <DiffCell
                                                before={row.priceBefore}
                                                after={row.priceAfter}
                                                formatter={(v) => v != null ? `${Number(v).toFixed(2)} ر.س` : '-'}
                                            />
                                        </td>

                                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                                            {row.performedBy || '-'}
                                        </td>

                                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                            {formatDateDisplay(row.performedAt)}
                                        </td>

                                        <td className="px-4 py-3 text-xs text-gray-400 max-w-[160px] truncate">
                                            {row.notes || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">
                            صفحة {page} من {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1 || loading}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={18} />
                            </button>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= totalPages || loading}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
