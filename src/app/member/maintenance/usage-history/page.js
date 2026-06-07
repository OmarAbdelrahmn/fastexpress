'use client';

import { Fragment, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Calendar, Search, ArrowRight, ChevronDown, ChevronUp,
    User, Truck
} from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatPlateNumber } from '@/lib/utils/formatters';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';

// Helpers to get default date range (first of month → today)
const toDateInput = (date) => date.toISOString().split('T')[0];
const getDefaultFromDate = () => {
    const d = new Date();
    d.setDate(1);
    return toDateInput(d);
};
const getDefaultToDate = () => toDateInput(new Date());

export default function MemberUsageHistoryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Default tab from query param if available
    const initialTab = searchParams.get('tab') === 'accessories' ? 'accessories' : 'spare-parts';
    const [activeTab, setActiveTab] = useState(initialTab);

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [alert, setAlert] = useState(null);

    // Filters – default to current month
    const [fromDate, setFromDate] = useState(getDefaultFromDate);
    const [toDate, setToDate] = useState(getDefaultToDate);
    const [searchQuery, setSearchQuery] = useState('');

    // Expanded rows tracking
    const [expandedRows, setExpandedRows] = useState({});

    useEffect(() => {
        // Load with the default date filters applied
        loadUsageHistory(true);
    }, []);

    const loadUsageHistory = async (useFilters = false) => {
        setLoading(true);
        try {
            let url = API_ENDPOINTS.MEMBER.USAGE_HISTORY;
            const params = [];

            if (useFilters) {
                if (fromDate) {
                    params.push(`fromDate=${fromDate}T00:00:00`);
                }
                if (toDate) {
                    params.push(`toDate=${toDate}T23:59:59`);
                }
            }

            if (params.length > 0) {
                url += `?${params.join('&')}`;
            }

            const response = await ApiService.get(url);
            setData(response);
            // Reset expanded rows when data changes
            setExpandedRows({});
        } catch (error) {
            console.error('Error loading usage history:', error);
            setAlert({ type: 'error', message: 'حدث خطأ أثناء تحميل سجل الاستهلاك' });
        } finally {
            setLoading(false);
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        loadUsageHistory(true);
    };

    const handleClearFilters = () => {
        setFromDate('');
        setToDate('');
        loadUsageHistory(false);
    };

    const toggleRow = (itemId) => {
        setExpandedRows(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    // Grouping and filtering calculations
    const getGroupedSpareParts = () => {
        if (!data?.sparePartUsages) return [];

        const grouped = {};
        data.sparePartUsages.forEach(usage => {
            const key = usage.sparePartId || usage.sparePartName;
            if (!grouped[key]) {
                grouped[key] = {
                    id: key,
                    name: usage.sparePartName || 'غير محدد',
                    totalQuantity: 0,
                    totalCost: 0,
                    usages: []
                };
            }
            grouped[key].totalQuantity += usage.quantityUsed || 0;
            grouped[key].totalCost += usage.cost || 0;
            grouped[key].usages.push(usage);
        });

        // Filter by search query
        return Object.values(grouped).filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const getGroupedAccessories = () => {
        if (!data?.accessoryUsages) return [];

        const grouped = {};
        data.accessoryUsages.forEach(usage => {
            const key = usage.accessoryId || usage.accessoryName;
            if (!grouped[key]) {
                grouped[key] = {
                    id: key,
                    name: usage.accessoryName || 'غير محدد',
                    totalQuantity: 0,
                    totalCost: 0,
                    usages: []
                };
            }
            // Accessory usages might not have quantityUsed (usually 1 per issue)
            const qty = usage.quantityUsed || usage.quantity || 1;
            grouped[key].totalQuantity += qty;
            grouped[key].totalCost += usage.cost || 0;
            grouped[key].usages.push(usage);
        });

        // Filter by search query
        return Object.values(grouped).filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const sparePartsList = getGroupedSpareParts();
    const accessoriesList = getGroupedAccessories();

    return (
        <div className="space-y-6" dir="rtl">
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            {/* Back Button & Title */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 md:px-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => router.push(activeTab === 'spare-parts' ? '/member/maintenance/spare-parts' : '/member/maintenance/rider-accessories')}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 h-10 px-3"
                    >
                        <ArrowRight size={18} className="ml-1" />
                        <span className="text-sm">رجوع</span>
                    </Button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">سجل استهلاك المستودع</h1>
                        {data?.housingName && (
                            <p className="text-xs md:text-sm text-gray-500 font-medium">{data.housingName}</p>
                        )}
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('spare-parts')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-md transition-all text-sm font-semibold ${activeTab === 'spare-parts'
                            ? 'bg-white shadow text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        قطع الغيار
                    </button>
                    <button
                        onClick={() => setActiveTab('accessories')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-md transition-all text-sm font-semibold ${activeTab === 'accessories'
                            ? 'bg-white shadow text-blue-600'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        معدات السائقين
                    </button>
                </div>
            </div>

            {/* Summary Statistics Card */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-4 md:px-6">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <span className="block text-gray-500 text-xs font-semibold mb-1">قطع الغيار المصروفة</span>
                    <span className="text-lg md:text-2xl font-bold text-blue-600">
                        {loading ? '...' : (data?.totalSparePartUsages || 0)}
                    </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <span className="block text-gray-500 text-xs font-semibold mb-1">المعدات المصروفة</span>
                    <span className="text-lg md:text-2xl font-bold text-purple-600">
                        {loading ? '...' : (data?.totalAccessoryUsages || 0)}
                    </span>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 mx-4 md:mx-6">
                <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                            <Calendar size={14} className="text-blue-500" />
                            من تاريخ
                        </label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                            <Calendar size={14} className="text-red-500" />
                            إلى تاريخ
                        </label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white flex-1 text-sm h-10"
                            disabled={loading}
                        >
                            تصفية
                        </Button>
                        {(fromDate || toDate) && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClearFilters}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 text-sm h-10"
                            >
                                إعادة تعيين
                            </Button>
                        )}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                            <Search size={14} className="text-gray-400" />
                            بحث بالاسم
                        </label>
                        <Input
                            placeholder="ابحث عن الصنف..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 text-sm"
                        />
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mx-4 md:mx-6">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800 text-sm md:text-base">
                        {activeTab === 'spare-parts' ? 'استهلاك قطع الغيار' : 'استهلاك معدات السائقين'}
                    </h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500 font-medium">جاري تحميل البيانات...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 font-semibold border-b text-xs md:text-sm">
                                    <th className="py-3 px-4 w-12"></th>
                                    <th className="py-3 px-4">اسم الصنف</th>
                                    <th className="py-3 px-4 text-center">الكمية المستهلكة</th>
                                    <th className="py-3 px-4 text-left">التكلفة الإجمالية</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTab === 'spare-parts' ? (
                                    sparePartsList.length > 0 ? (
                                        sparePartsList.map((group) => (
                                            <Fragment key={group.id}>
                                                <tr
                                                    onClick={() => toggleRow(group.id)}
                                                    className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <td className="py-4 px-4 text-center text-gray-400">
                                                        {expandedRows[group.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </td>
                                                    <td className="py-4 px-4 font-bold text-gray-900 text-sm md:text-base">
                                                        {group.name}
                                                    </td>
                                                    <td className="py-4 px-4 text-center font-semibold text-gray-700">
                                                        {group.totalQuantity}
                                                    </td>
                                                    <td className="py-4 px-4 text-left font-bold text-blue-600">
                                                        {Number(group.totalCost).toFixed(2)} ر.س
                                                    </td>
                                                </tr>
                                                {expandedRows[group.id] && (
                                                    <tr className="bg-blue-50/20">
                                                        <td colSpan="4" className="p-0 border-b">
                                                            <div className="px-6 py-4 space-y-3">
                                                                <h4 className="text-xs md:text-sm font-bold text-gray-700 border-b pb-1">تفاصيل حركات الصرف</h4>
                                                                <table className="w-full text-right text-xs md:text-sm">
                                                                    <thead>
                                                                        <tr className="text-gray-500 border-b">
                                                                            <th className="pb-2">رقم المركبة</th>
                                                                            <th className="pb-2 text-center">الكمية</th>
                                                                            <th className="pb-2 text-center">تاريخ الصرف</th>
                                                                            <th className="pb-2 text-left">التكلفة</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {group.usages.map((usage) => (
                                                                            <tr key={usage.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-100/50">
                                                                                <td className="py-2 flex items-center gap-1.5 text-gray-900">
                                                                                    <Truck size={14} className="text-gray-400 flex-shrink-0" />
                                                                                    <span className="font-semibold">{formatPlateNumber(usage.vehicleNumber) || usage.vehicleNumber || 'غير محدد'}</span>
                                                                                </td>
                                                                                <td className="py-2 text-center text-gray-700 font-semibold">{usage.quantityUsed}</td>
                                                                                <td className="py-2 text-center text-gray-600">
                                                                                    {new Date(usage.usedAt).toLocaleString('ar-SA', {
                                                                                        year: 'numeric',
                                                                                        month: '2-digit',
                                                                                        day: '2-digit',
                                                                                        hour: '2-digit',
                                                                                        minute: '2-digit'
                                                                                    })}
                                                                                </td>
                                                                                <td className="py-2 text-left font-semibold text-gray-800">{Number(usage.cost || 0).toFixed(2)} ر.س</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-8 text-center text-gray-500">
                                                لا توجد بيانات استهلاك قطع غيار تطابق البحث
                                            </td>
                                        </tr>
                                    )
                                ) : (
                                    accessoriesList.length > 0 ? (
                                        accessoriesList.map((group) => (
                                            <Fragment key={group.id}>
                                                <tr
                                                    onClick={() => toggleRow(group.id)}
                                                    className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <td className="py-4 px-4 text-center text-gray-400">
                                                        {expandedRows[group.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </td>
                                                    <td className="py-4 px-4 font-bold text-gray-900 text-sm md:text-base">
                                                        {group.name}
                                                    </td>
                                                    <td className="py-4 px-4 text-center font-semibold text-gray-700">
                                                        {group.totalQuantity}
                                                    </td>
                                                    <td className="py-4 px-4 text-left font-bold text-blue-600">
                                                        {Number(group.totalCost).toFixed(2)} ر.س
                                                    </td>
                                                </tr>
                                                {expandedRows[group.id] && (
                                                    <tr className="bg-purple-50/10">
                                                        <td colSpan="4" className="p-0 border-b">
                                                            <div className="px-6 py-4 space-y-3">
                                                                <h4 className="text-xs md:text-sm font-bold text-gray-700 border-b pb-1">تفاصيل حركات الصرف</h4>
                                                                <table className="w-full text-right text-xs md:text-sm">
                                                                    <thead>
                                                                        <tr className="text-gray-500 border-b">
                                                                            <th className="pb-2">اسم السائق</th>
                                                                            <th className="pb-2 text-center">الكمية</th>
                                                                            <th className="pb-2 text-center">تاريخ الصرف</th>
                                                                            <th className="pb-2 text-left">التكلفة</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {group.usages.map((usage) => (
                                                                            <tr key={usage.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-100/50">
                                                                                <td className="py-2">
                                                                                    <div className="flex items-center gap-1.5 font-medium text-gray-900">
                                                                                        <User size={14} className="text-gray-400" />
                                                                                        <div>
                                                                                            <p>{usage.riderNameAR || usage.riderNameEN || 'غير محدد'}</p>
                                                                                            {usage.riderId && (
                                                                                                <p className="text-xs text-gray-500 font-mono">ID: {usage.riderId}</p>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="py-2 text-center text-gray-700 font-semibold">{usage.quantityUsed || usage.quantity || 1}</td>
                                                                                <td className="py-2 text-center text-gray-600">
                                                                                    {new Date(usage.issuedAt || usage.usedAt).toLocaleString('ar-SA', {
                                                                                        year: 'numeric',
                                                                                        month: '2-digit',
                                                                                        day: '2-digit',
                                                                                        hour: '2-digit',
                                                                                        minute: '2-digit'
                                                                                    })}
                                                                                </td>
                                                                                <td className="py-2 text-left font-semibold text-gray-800">{Number(usage.cost || 0).toFixed(2)} ر.س</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-8 text-center text-gray-500">
                                                لا توجد بيانات استهلاك معدات تطابق البحث
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
