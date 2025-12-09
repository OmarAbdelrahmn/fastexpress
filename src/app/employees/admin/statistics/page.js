'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import PageHeader from '@/components/layout/pageheader';
import StatusBadge from '@/components/Ui/StatusBadge';
import {
    BarChart3, TrendingUp, Clock, CheckCircle, XCircle,
    RefreshCw, Calendar, PieChart, Activity
} from 'lucide-react';

export default function StatisticsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [statistics, setStatistics] = useState(null);

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            const data = await ApiService.get('/api/employee/statistics');
            setStatistics(data);
        } catch (err) {
            console.error('Error loading statistics:', err);
            setErrorMessage(err?.message || 'حدث خطأ في تحميل الإحصائيات');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            enable: 'bg-green-500',
            disable: 'bg-red-500',
            fleeing: 'bg-rose-500',
            vacation: 'bg-blue-500',
            accident: 'bg-orange-500',
            sick: 'bg-yellow-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    const getStatusLabel = (status) => {
        const labels = {
            enable: 'نشط',
            disable: 'غير نشط',
            fleeing: 'هارب',
            vacation: 'إجازة',
            accident: 'حادث',
            sick: 'مريض'
        };
        return labels[status] || status;
    };

    const getMonthName = (monthIndex) => {
        const months = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        return months[monthIndex - 1] || monthIndex;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="إحصائيات تغيير الحالة"
                    subtitle="جاري التحميل..."
                    icon={BarChart3}
                />
                <Card>
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-600">جاري تحميل الإحصائيات...</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (!statistics) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="إحصائيات تغيير الحالة"
                    subtitle="لا توجد بيانات"
                    icon={BarChart3}
                />
                {errorMessage && (
                    <Alert
                        type="error"
                        title="خطأ"
                        message={errorMessage}
                        onClose={() => setErrorMessage('')}
                    />
                )}
            </div>
        );
    }

    const maxMonthValue = Math.max(...Object.values(statistics.requestsByMonth || {}));
    const maxStatusValue = Math.max(...Object.values(statistics.statusBreakdown || {}));

    return (
        <div className="space-y-6">
            <PageHeader
                title="إحصائيات تغيير حالة الموظفين"
                subtitle="نظرة شاملة على طلبات تغيير الحالة"
                icon={BarChart3}
                actionButton={{
                    text: 'تحديث',
                    icon: <RefreshCw size={18} />,
                    onClick: loadStatistics,
                    variant: 'secondary'
                }}
            />

            {errorMessage && (
                <Alert
                    type="error"
                    title="خطأ"
                    message={errorMessage}
                    onClose={() => setErrorMessage('')}
                />
            )}

            {/* Main Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp size={32} className="opacity-80" />
                        <Activity size={24} className="opacity-60" />
                    </div>
                    <p className="text-blue-100 text-sm mb-1">إجمالي الطلبات</p>
                    <p className="text-4xl font-bold">{statistics.totalRequests}</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <Clock size={32} className="opacity-80" />
                        <Activity size={24} className="opacity-60" />
                    </div>
                    <p className="text-yellow-100 text-sm mb-1">طلبات معلقة</p>
                    <p className="text-4xl font-bold">{statistics.pendingRequests}</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle size={32} className="opacity-80" />
                        <Activity size={24} className="opacity-60" />
                    </div>
                    <p className="text-green-100 text-sm mb-1">تمت الموافقة</p>
                    <p className="text-4xl font-bold">{statistics.approvedRequests}</p>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <XCircle size={32} className="opacity-80" />
                        <Activity size={24} className="opacity-60" />
                    </div>
                    <p className="text-red-100 text-sm mb-1">مرفوضة</p>
                    <p className="text-4xl font-bold">{statistics.rejectedRequests}</p>
                </div>
            </div>

            {/* Status Breakdown */}
            <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <PieChart size={20} />
                    توزيع الطلبات حسب الحالة
                </h3>

                <div className="space-y-4">
                    {statistics.statusBreakdown && Object.entries(statistics.statusBreakdown).map(([status, count]) => {
                        const percentage = statistics.totalRequests > 0
                            ? ((count / statistics.totalRequests) * 100).toFixed(1)
                            : 0;

                        return (
                            <div key={status} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={status} />
                                        <span className="text-sm text-gray-600">
                                            ({count} طلب)
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">
                                        {percentage}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full ${getStatusColor(status)} transition-all duration-500`}
                                        style={{ width: `${(count / maxStatusValue) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {(!statistics.statusBreakdown || Object.keys(statistics.statusBreakdown).length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                        لا توجد بيانات لعرضها
                    </div>
                )}
            </Card>

            {/* Monthly Requests Chart */}
            <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Calendar size={20} />
                    الطلبات الشهرية
                </h3>

                <div className="space-y-4">
                    {statistics.requestsByMonth && Object.entries(statistics.requestsByMonth)
                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                        .map(([month, count]) => (
                            <div key={month} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-700">
                                        {getMonthName(parseInt(month))}
                                    </span>
                                    <span className="text-sm font-bold text-blue-600">
                                        {count} طلب
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                        style={{ width: `${(count / maxMonthValue) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                </div>

                {(!statistics.requestsByMonth || Object.keys(statistics.requestsByMonth).length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                        لا توجد بيانات شهرية لعرضها
                    </div>
                )}
            </Card>

            {/* Quick Actions */}
            <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-4">إجراءات سريعة</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                        variant="secondary"
                        onClick={() => router.push('/employees/admin/status-requests')}
                        className="w-full"
                    >
                        <Clock size={18} className="ml-2" />
                        عرض الطلبات المعلقة ({statistics.pendingRequests})
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => router.push('/employees/admin/date-range')}
                        className="w-full"
                    >
                        <Calendar size={18} className="ml-2" />
                        البحث بالتاريخ
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => router.push('/employees/admin')}
                        className="w-full"
                    >
                        <TrendingUp size={18} className="ml-2" />
                        إدارة الموظفين
                    </Button>
                </div>
            </Card>
        </div>
    );
}
