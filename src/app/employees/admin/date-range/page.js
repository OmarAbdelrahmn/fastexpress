'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import PageHeader from '@/components/layout/pageheader';
import StatusBadge from '@/components/Ui/StatusBadge';
import { Calendar, Search, Download, Filter, CheckCircle, XCircle, Clock, User } from 'lucide-react';

export default function DateRangeHistoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSearch = async (e) => {
        e?.preventDefault();

        if (!startDate || !endDate) {
            setErrorMessage('الرجاء إدخال تاريخ البداية والنهاية');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setErrorMessage('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setHasSearched(true);

        try {
            const data = await ApiService.get(
                `/api/employee/date-range?startDate=${startDate}&endDate=${endDate}`
            );

            setSearchResults(data);
            setSuccessMessage(`تم العثور على ${data.totalRecords} سجل`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error searching history:', err);
            setErrorMessage(err?.message || 'حدث خطأ في البحث');
            setSearchResults(null);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setSearchResults(null);
        setHasSearched(false);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleExport = () => {
        if (!searchResults?.data || searchResults.data.length === 0) return;

        const csvContent = [
            ['رقم الإقامة', 'الاسم (عربي)', 'الاسم (إنجليزي)', 'الحالة المطلوبة', 'السبب', 'مقدم الطلب', 'تاريخ الطلب', 'محلول', 'القرار', 'تم الحل بواسطة', 'تاريخ الحل'].join(','),
            ...searchResults.data.map(record => [
                record.iqamaNo,
                record.employeeNameAR,
                record.employeeNameEN,
                record.requestedStatus,
                `"${record.reason || ''}"`,
                record.requestedBy,
                new Date(record.requestedAt).toLocaleString('ar-SA'),
                record.isResolved ? 'نعم' : 'لا',
                record.resolution || '-',
                record.resolvedBy || '-',
                record.resolvedAt ? new Date(record.resolvedAt).toLocaleString('ar-SA') : '-'
            ].join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `status_changes_${startDate}_to_${endDate}.csv`;
        link.click();
    };

    const getResolutionBadge = (isResolved, resolution) => {
        if (!isResolved) {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                    <Clock size={12} />
                    قيد الانتظار
                </span>
            );
        }
        if (resolution === 'Approved') {
            return (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                    <CheckCircle size={12} />
                    تمت الموافقة
                </span>
            );
        }
        return (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
                <XCircle size={12} />
                مرفوض
            </span>
        );
    };

    const columns = [
        {
            header: 'رقم الإقامة',
            accessor: 'iqamaNo',
            render: (row) => (
                <button
                    onClick={() => router.push(`/employees/admin/history/${row.iqamaNo}`)}
                    className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
                >
                    {row.iqamaNo}
                </button>
            )
        },
        { header: 'الاسم (عربي)', accessor: 'employeeNameAR' },
        { header: 'الاسم (إنجليزي)', accessor: 'employeeNameEN' },
        {
            header: 'الحالة المطلوبة',
            accessor: 'requestedStatus',
            render: (row) => <StatusBadge status={row.requestedStatus} />
        },
        {
            header: 'مقدم الطلب',
            accessor: 'requestedBy',
            render: (row) => (
                <div className="flex items-center gap-1">
                    <User size={14} className="text-gray-500" />
                    <span>{row.requestedBy}</span>
                </div>
            )
        },
        {
            header: 'تاريخ الطلب',
            accessor: 'requestedAt',
            render: (row) => (
                <span className="text-sm text-gray-600">
                    {new Date(row.requestedAt).toLocaleDateString('ar-SA')}
                </span>
            )
        },
        {
            header: 'الحالة',
            render: (row) => getResolutionBadge(row.isResolved, row.resolution)
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="سجل التغييرات - نطاق زمني"
                subtitle="البحث في سجل تغيير الحالة حسب التاريخ"
                icon={Calendar}
            />

            {successMessage && (
                <Alert
                    type="success"
                    title="نجح"
                    message={successMessage}
                    onClose={() => setSuccessMessage('')}
                />
            )}

            {errorMessage && (
                <Alert
                    type="error"
                    title="خطأ"
                    message={errorMessage}
                    onClose={() => setErrorMessage('')}
                />
            )}

            {/* Search Form */}
            <Card>
                <form onSubmit={handleSearch} className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Filter size={20} />
                        تحديد النطاق الزمني
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="تاريخ البداية"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                        <Input
                            label="تاريخ النهاية"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleReset}
                            disabled={loading}
                        >
                            إعادة تعيين
                        </Button>
                        <Button type="submit" loading={loading} disabled={loading}>
                            <Search size={18} className="ml-2" />
                            بحث
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Results */}
            {hasSearched && searchResults && (
                <>
                    {/* Summary Card */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">نتائج البحث</h3>
                                <p className="text-sm text-gray-600">
                                    من {new Date(searchResults.startDate).toLocaleDateString('ar-SA')}
                                    {' '}إلى{' '}
                                    {new Date(searchResults.endDate).toLocaleDateString('ar-SA')}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-left">
                                    <p className="text-sm text-gray-600">إجمالي السجلات</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {searchResults.totalRecords}
                                    </p>
                                </div>
                                {searchResults.totalRecords > 0 && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleExport}
                                    >
                                        <Download size={18} className="ml-2" />
                                        تصدير CSV
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Results Table */}
                    <Card>
                        {searchResults.data && searchResults.data.length > 0 ? (
                            <Table
                                columns={columns}
                                data={searchResults.data}
                                loading={loading}
                            />
                        ) : (
                            <div className="text-center py-12">
                                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                                <p className="text-gray-600">لا توجد سجلات في هذا النطاق الزمني</p>
                            </div>
                        )}
                    </Card>
                </>
            )}

            {/* Instructions */}
            {!hasSearched && (
                <Card>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">كيفية الاستخدام</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">1</span>
                            </div>
                            <p>اختر تاريخ البداية والنهاية للنطاق الزمني المطلوب</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">2</span>
                            </div>
                            <p>اضغط على "بحث" لعرض جميع طلبات تغيير الحالة في هذه الفترة</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">3</span>
                            </div>
                            <p>يمكنك تصدير النتائج إلى ملف CSV للمراجعة</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">4</span>
                            </div>
                            <p>انقر على رقم الإقامة لعرض السجل الكامل للموظف</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
