'use client';

import { useRouter } from 'next/navigation';
import { Package, History, Wrench } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import MiniStatRow from '@/components/Ui/MiniStatRow';

export default function UsagePage() {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <PageHeader
                title="تتبع الاستخدام"
                subtitle="تسجيل ومتابعة استخدام قطع الغيار ومعدات السائقين"
                icon={History}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 md:px-6">
                {/* Spare Parts Usage Card */}
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2 text-base md:text-lg">
                        <Wrench className="text-orange-600" size={20} />
                        قطع الغيار
                    </h3>
                    <div className="flex flex-col gap-3">
                        <MiniStatRow
                            icon={Package}
                            title="تسجيل استخدام قطعة غيار"
                            description="تسجيل استخدام قطع الغيار للمركبات"
                            onClick={() => router.push('/admin/maintenance/usage/spare-parts')}
                            color="#f97316"
                            bgClass="bg-orange-50"
                        />
                        <MiniStatRow
                            icon={History}
                            title="سجل استخدام قطع الغيار"
                            description="عرض سجل استخدام قطع الغيار حسب المركبة"
                            onClick={() => router.push('/admin/maintenance/usage/spare-parts/history')}
                            color="#ea580c"
                            bgClass="bg-orange-50"
                        />
                    </div>
                </div>

                {/* Rider Accessories Usage Card */}
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2 text-base md:text-lg">
                        <Package className="text-purple-600" size={20} />
                        معدات السائقين
                    </h3>
                    <div className="flex flex-col gap-3">
                        <MiniStatRow
                            icon={Package}
                            title="تسجيل استخدام معدات السائقين"
                            description="تسجيل استخدام معدات السائقين للمركبات"
                            onClick={() => router.push('/admin/maintenance/usage/rider-accessories')}
                            color="#8b5cf6"
                            bgClass="bg-purple-50"
                        />
                        <MiniStatRow
                            icon={History}
                            title="سجل استخدام معدات السائقين"
                            description="عرض سجل استخدام معدات السائقين حسب المركبة"
                            onClick={() => router.push('/admin/maintenance/usage/rider-accessories/history')}
                            color="#7c3aed"
                            bgClass="bg-purple-50"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
