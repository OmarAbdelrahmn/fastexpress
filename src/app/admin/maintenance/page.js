'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import PageHeader from '@/components/layout/pageheader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Wrench, Calendar, History, FileText, AlertCircle, CheckCircle, Clock, TrendingUp, Package, BadgeDollarSign } from 'lucide-react';
import MiniStatRow from '@/components/Ui/MiniStatRow';

export default function MaintenancePage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        suppliersCount: 0,
        sparePartsCount: 0,
        riderAccessoriesCount: 0,
        billsCount: 0,
    });

    useEffect(() => {
        loadMaintenanceData();
    }, []);

    const loadMaintenanceData = async () => {
        setLoading(true);
        try {
            const [suppliersRes, sparePartsRes, accessoriesRes, billsRes] = await Promise.all([
                ApiService.get(API_ENDPOINTS.SUPPLIER.LIST),
                ApiService.get(API_ENDPOINTS.SPARE_PARTS.LIST),
                ApiService.get(API_ENDPOINTS.RIDER_ACCESSORY.LIST),
                ApiService.get(API_ENDPOINTS.BILL.LIST)
            ]);

            setStats({
                suppliersCount: Array.isArray(suppliersRes) ? suppliersRes.length : 0,
                sparePartsCount: Array.isArray(sparePartsRes) ? sparePartsRes.length : 0,
                riderAccessoriesCount: Array.isArray(accessoriesRes) ? accessoriesRes.length : 0,
                billsCount: billsRes && Array.isArray(billsRes) ? billsRes.length : 0,
            });
        } catch (err) {
            console.error('Error loading maintenance data:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('navigation.maintenance')}
                subtitle="إدارة شاملة لجميع عمليات الصيانة"
                icon={Wrench}
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                <div className="bg-blue-50 border-r-4 border-blue-500 p-5 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 mb-1">الموردين</p>
                            <p className="text-3xl font-bold text-blue-700">{loading ? '...' : stats.suppliersCount}</p>
                        </div>
                        <Package className="text-blue-500" size={40} />
                    </div>
                </div>

                <div className="bg-orange-50 border-r-4 border-orange-500 p-5 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-600 mb-1">قطع الغيار</p>
                            <p className="text-3xl font-bold text-orange-700">{loading ? '...' : stats.sparePartsCount}</p>
                        </div>
                        <Wrench className="text-orange-500" size={40} />
                    </div>
                </div>

                <div className="bg-purple-50 border-r-4 border-purple-500 p-5 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 mb-1">إكسسوارات معدات السائقين</p>
                            <p className="text-3xl font-bold text-purple-700">{loading ? '...' : stats.riderAccessoriesCount}</p>
                        </div>
                        <Package className="text-purple-500" size={40} />
                    </div>
                </div>

                <div className="bg-teal-50 border-r-4 border-teal-500 p-5 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-teal-600 mb-1">الفواتير</p>
                            <p className="text-3xl font-bold text-teal-700">{loading ? '...' : stats.billsCount}</p>
                        </div>
                        <FileText className="text-teal-500" size={40} />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 p-4">
                {/* Maintenance Management Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                        إدارة الصيانة
                    </h3>
                    <div className="flex flex-col gap-3">
                        <MiniStatRow
                            icon={Package}
                            title="إدارة الموردين"
                            description="عرض وإدارة موردي الصيانة"
                            onClick={() => router.push('/admin/maintenance/suppliers')}
                            color="#2563eb"
                            bgClass="bg-blue-50"
                        />
                        <MiniStatRow
                            icon={Package}
                            title="إدارة قطع الغيار"
                            description="متابعة المخزون وقطع الغيار"
                            onClick={() => router.push('/admin/maintenance/spare-parts')}
                            color="#eab308"
                            bgClass="bg-yellow-50"
                        />
                        <MiniStatRow
                            icon={FileText}
                            title="نقل المعدات"
                            description="متابعة نقل المعدات"
                            onClick={() => router.push('/admin/maintenance/transfers')}
                            color="#2563eb"
                            bgClass="bg-blue-50"
                        />
                        <MiniStatRow
                            icon={FileText}
                            title="تفاصيل استخدام السكنات"
                            description="تفاصيل استخدام قطع الغيار في السكنات"
                            onClick={() => router.push('/admin/maintenance/all-housings-details')}
                            color="#10b981"
                            bgClass="bg-emerald-50"
                        />
                    </div>
                </div>

                {/* Reports Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                        التقارير والسجلات
                    </h3>
                    <div className="flex flex-col gap-3">
                        <MiniStatRow
                            icon={Package}
                            title="إدارة إكسسوارات معدات السائقين"
                            description="متابعة المخزون و معدات السائقين"
                            onClick={() => router.push('/admin/maintenance/rider-accessories')}
                            color="#8b5cf6"
                            bgClass="bg-purple-50"
                        />
                        <MiniStatRow
                            icon={FileText}
                            title="إدارة الفواتير"
                            description="إنشاء وإدارة فواتير الصيانة"
                            onClick={() => router.push('/admin/maintenance/bills')}
                            color="#0d9488"
                            bgClass="bg-teal-50"
                        />
                        <MiniStatRow
                            icon={History}
                            title="تتبع الاستخدام"
                            description="تسجيل ومتابعة استخدام قطع الغيار والمعدات"
                            onClick={() => router.push('/admin/maintenance/usage')}
                            color="#f59e0b"
                            bgClass="bg-amber-50"
                        />
                        <MiniStatRow
                            icon={BadgeDollarSign}
                            title="تكاليف السكن"
                            description="عرض تكاليف قطع الغيار لكل سكن"
                            onClick={() => router.push('/admin/maintenance/housing-costs')}
                            color="#10b981"
                            bgClass="bg-emerald-50"
                        />
                    </div>
                </div>
            </div>

            {/* Recent Maintenance Activity */}
            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <History size={20} />
                        آخر أنشطة الصيانة
                    </h3>
                    <div className="text-center py-12 text-gray-500">
                        <AlertCircle size={48} className="mx-auto mb-3 text-gray-400" />
                        <p>لا توجد أنشطة صيانة حديثة</p>
                        <p className="text-sm mt-1">سيتم عرض أحدث عمليات الصيانة هنا</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
