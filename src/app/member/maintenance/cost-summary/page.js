'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Search, ArrowRight, Filter, Calendar, Truck, User, Hash, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatPlateNumber } from '@/lib/utils/formatters';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import Table from '@/components/Ui/Table';

export default function MemberCostSummaryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const [fromDate, setFromDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1); // ➕ tomorrow
        return d.toISOString().split('T')[0];
    });
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        loadCostSummary();
    }, []);

    const loadCostSummary = async () => {
        setLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams();
            if (fromDate) params.append('fromDate', fromDate);
            if (toDate) params.append('toDate', toDate);

            const queryString = params.toString() ? `?${params.toString()}` : '';
            const response = await ApiService.get(`${API_ENDPOINTS.MEMBER.COST_SUMMARY}${queryString}`);
            setSummary(response);
        } catch (error) {
            console.error('Error loading cost summary:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل ملخص التكاليف');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        loadCostSummary();
    };

    const handleReset = () => {
        const d = new Date();
        setFromDate(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]);
        setToDate(new Date().toISOString().split('T')[0]);
        loadCostSummary();
    };

    const handleVehicleExport = () => {
        if (!summary?.vehicleCosts || summary.vehicleCosts.length === 0) {
            showAlert('error', 'لا توجد بيانات لتصديرها');
            return;
        }

        const dataToExport = summary.vehicleCosts.map(row => ({
            'رقم اللوحة': row.vehiclePlate,
            'إجمالي التكلفة (ر.س)': row.totalCost.toFixed(2)
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicle Costs');
        XLSX.writeFile(workbook, `vehicle_costs_${summary.housingName || 'export'}.xlsx`);
    };

    const handleRiderExport = () => {
        if (!summary?.riderCosts || summary.riderCosts.length === 0) {
            showAlert('error', 'لا توجد بيانات لتصديرها');
            return;
        }

        const dataToExport = summary.riderCosts.map(row => ({
            'اسم المندوب': row.riderName,
            'معرف العمل': row.workingId,
            'إجمالي التكلفة (ر.س)': row.totalCost.toFixed(2)
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rider Costs');
        XLSX.writeFile(workbook, `rider_costs_${summary.housingName || 'export'}.xlsx`);
    };

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 3000);
    };

    const vehicleColumns = [
        {
            header: 'رقم اللوحة',
            accessor: 'vehiclePlate',
            render: (row) => formatPlateNumber(row.vehiclePlate) || '-'
        },
        {
            header: 'إجمالي التكلفة',
            accessor: 'totalCost',
            render: (row) => `${row.totalCost?.toFixed(2) || '0.00'} ر.س`
        }
    ];

    const riderColumns = [
        {
            header: 'اسم المندوب',
            accessor: 'riderName',
        },
        {
            header: 'معرف العمل',
            accessor: 'workingId',
        },
        {
            header: 'إجمالي التكلفة',
            accessor: 'totalCost',
            render: (row) => `${row.totalCost?.toFixed(2) || '0.00'} ر.س`
        }
    ];

    return (
        <div className="space-y-6">
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="flex gap-4 px-5">
                <Button
                    variant="outline"
                    onClick={() => router.push('/member/dashboard')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                    <ArrowRight size={20} className="ml-2" />
                    رجوع
                </Button>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm mx-5">
                <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            من تاريخ
                        </label>
                        <Input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            إلى تاريخ
                        </label>
                        <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                            disabled={loading}
                        >
                            بحث
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            إعادة ضبط
                        </Button>
                    </div>
                </form>
            </div>

            {/* Summary Information Grid */}
            <div className="bg-white p-6 rounded-lg shadow-sm mx-5 border-t-4 border-orange-500">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{summary?.housingName || 'جاري التحميل...'}</h2>
                        <p className="text-gray-500 mt-1">ملخص تكاليف السكن والصيانة</p>
                    </div>
                    <div className="text-left">
                        <div className="text-sm text-gray-500">إجمالي التكلفة العام</div>
                        <div className="text-3xl font-black text-orange-600">
                            {loading ? '...' : summary?.grandTotal?.toFixed(2) || '0.00'}
                            <span className="text-lg font-normal text-gray-500 mr-1">ر.س</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-600 mb-1 font-semibold">
                            <Truck size={18} />
                            <span>المركبات</span>
                        </div>
                        <div className="text-2xl font-bold">{summary?.totalVehicles || 0}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-purple-600 mb-1 font-semibold">
                            <User size={18} />
                            <span>المناديب</span>
                        </div>
                        <div className="text-2xl font-bold">{summary?.totalRiders || 0}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800 mb-1 font-semibold">
                            <Hash size={18} />
                            <span>قطع الغيار</span>
                        </div>
                        <div className="text-xl font-bold text-blue-900">
                            {summary?.totalSparePartsCost?.toFixed(2) || '0.00'} ر.س
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-purple-800 mb-1 font-semibold">
                            <Hash size={18} />
                            <span>المعدات</span>
                        </div>
                        <div className="text-xl font-bold text-purple-900">
                            {summary?.totalAccessoriesCost?.toFixed(2) || '0.00'} ر.س
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-5">
                {/* Vehicle Costs Table */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Truck className="text-blue-600" size={20} />
                            تكاليف المركبات
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleVehicleExport}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            disabled={loading || !summary?.vehicleCosts?.length}
                        >
                            <FileSpreadsheet size={16} className="ml-2" />
                            تصدير Excel
                        </Button>
                    </div>
                    <Table
                        columns={vehicleColumns}
                        data={summary?.vehicleCosts || []}
                        loading={loading}
                    />
                </div>

                {/* Rider Costs Table */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <User className="text-purple-600" size={20} />
                            تكاليف المناديب
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRiderExport}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            disabled={loading || !summary?.riderCosts?.length}
                        >
                            <FileSpreadsheet size={16} className="ml-2" />
                            تصدير Excel
                        </Button>
                    </div>
                    <Table
                        columns={riderColumns}
                        data={summary?.riderCosts || []}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
}
