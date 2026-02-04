'use client';

import { useState, useEffect } from 'react';
import { Calendar, Search, Download, Info, BarChart3, TrendingUp, Users, RefreshCcw, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useLanguage } from '@/lib/context/LanguageContext';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function KetaFreelancerPage() {
    const { t } = useLanguage();
    const pathname = usePathname();
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        if (!month) return;
        setLoading(true);
        setError(null);
        try {
            const response = await ApiService.get(API_ENDPOINTS.REPORTS.KETA_FREELANCER.BY_MONTH(month));
            setData(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error('Error loading data:', err);
            setError('فشل تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [month]);

    const handleExportExcel = () => {
        if (!data.length) return;
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "KetaFreelancerData");
        XLSX.writeFile(wb, `keta_freelancer_${month}.xlsx`);
    };

    const filteredData = data.filter(item =>
        item.workingId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalOrders = filteredData.reduce((sum, item) => sum + (item.totalOrders || 0), 0);
    const riderCount = filteredData.length;

    return (
        <div className="min-h-screen bg-gray-50 pb-12" dir="rtl">
            <PageHeader
                title="بيانات كيتا فري لانسر"
                subtitle="عرض وإدارة بيانات مناديب كيتا فري لانسر حسب الشهر"
                icon={BarChart3}
            />

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">

                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-200 gap-4 mb-6">
                    <Link
                        href="/admin/shifts/keta-freelancer"
                        className={`pb-4 px-2 font-bold text-sm transition-all ${pathname === '/admin/shifts/keta-freelancer' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        عرض البيانات
                    </Link>
                    <Link
                        href="/admin/shifts/keta-freelancer/import"
                        className={`pb-4 px-2 font-bold text-sm transition-all ${pathname === '/admin/shifts/keta-freelancer/import' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        استيراد من Excel
                    </Link>
                </div>

                {/* Filters & Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">اختر الشهر</label>
                            <input
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-sm font-bold text-gray-700">بحث بالمعرف الوظيفي</label>
                            <div className="relative">
                                <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="أدخل المعرف الوظيفي..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={loadData}
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white rounded-xl py-2 font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                                تحديث
                            </button>
                            <button
                                onClick={handleExportExcel}
                                disabled={!data.length}
                                className="px-4 bg-green-600 text-white rounded-xl py-2 font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                                title="تصدير إكسل"
                            >
                                <Download size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        label="إجمالي الطلبات"
                        value={totalOrders.toLocaleString()}
                        icon={TrendingUp}
                        color="blue"
                    />
                    <StatCard
                        label="عدد المناديب"
                        value={riderCount}
                        icon={Users}
                        color="green"
                    />
                    <StatCard
                        label="الشهر المعروض"
                        value={month}
                        icon={Calendar}
                        color="indigo"
                    />
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">
                            <RefreshCcw size={32} className="animate-spin mx-auto mb-4" />
                            جاري تحميل البيانات...
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500">
                            <AlertCircle size={32} className="mx-auto mb-4" />
                            {error}
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Info size={32} className="mx-auto mb-4 text-gray-300" />
                            لا توجد بيانات لهذا الشهر
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-widest border-b">
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">المعرف الوظيفي</th>
                                        <th className="px-6 py-4">الشهر</th>
                                        <th className="px-6 py-4">إجمالي الطلبات</th>
                                        <th className="px-6 py-4">تاريخ الإضافة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredData.map((item) => (
                                        <tr key={item.id} className="hover:bg-blue-50/30 transition-all">
                                            <td className="px-6 py-4 text-sm font-black text-gray-300">#{item.id}</td>
                                            <td className="px-6 py-4 font-mono font-bold text-gray-700">{item.workingId}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{item.month}</td>
                                            <td className="px-6 py-4 font-bold text-blue-600 text-lg">{item.totalOrders}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(item.createdAt).toLocaleString('ar-SA')}
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

function StatCard({ label, value, color, icon: Icon }) {
    const colorMap = {
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        green: 'bg-green-50 text-green-700 border-green-100',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    };
    return (
        <div className={`p-6 bg-white rounded-2xl border ${colorMap[color]} shadow-sm flex items-center gap-6`}>
            <div className={`p-4 rounded-xl ${colorMap[color]} bg-opacity-20`}>
                <Icon size={28} />
            </div>
            <div>
                <div className="text-[10px] font-black uppercase opacity-60 tracking-widest">{label}</div>
                <div className="text-3xl font-black">{value}</div>
            </div>
        </div>
    );
}
