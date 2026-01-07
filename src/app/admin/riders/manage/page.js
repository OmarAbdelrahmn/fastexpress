'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/context/LanguageContext';
import { FileSpreadsheet, Clock, AlertCircle, Archive, BarChart3, History, ArrowLeft, Settings } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import MiniStatRow from '@/components/Ui/MiniStatRow';

export default function RiderManagePage() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('riders.manageRiders')}
                subtitle={t('riders.managementDescription')}
                icon={Settings}
                actionButton={{
                    text: t('common.back'),
                    icon: <ArrowLeft size={18} />,
                    onClick: () => router.back(),
                    variant: 'secondary'
                }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">

                {/* Employee Data Management Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                        {t('employees.excelColumns.management')}
                    </h3>
                    <div className="flex flex-col gap-3">
                        <MiniStatRow
                            icon={FileSpreadsheet}
                            title={t('employees.importExcel')}
                            description={t('employees.uploadFile')}
                            onClick={() => router.push('/admin/employees/admin/import-excel')}
                            color="#1a3b26ff"
                            bgClass="bg-gray-100"
                        />
                        <MiniStatRow
                            icon={Clock}
                            title={t('employees.tempData')}
                            description={t('employees.reviewUpdates')}
                            onClick={() => router.push('/admin/employees/admin/temp-imports')}
                            color="#ea580c" // orange-600
                            bgClass="bg-orange-50"
                        />
                        <MiniStatRow
                            icon={AlertCircle}
                            title={t('employees.statusRequests')}
                            description={t('employees.enableDisable')}
                            onClick={() => router.push('/admin/employees/admin/status-requests')}
                            color="#ca8a04" // yellow-600
                            bgClass="bg-yellow-50"
                        />
                    </div>
                </div>

                {/* Employee Records Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                        {t('employees.excelColumns.searchAndReports')}
                    </h3>
                    <div className="flex flex-col gap-3">
                        <MiniStatRow
                            icon={Archive}
                            title={t('employees.deletedEmployees')}
                            description={t('employees.archive')}
                            onClick={() => router.push('/admin/employees/admin/deleted')}
                            color="#dc2626" // red-600
                            bgClass="bg-red-50"
                        />
                        <MiniStatRow
                            icon={BarChart3}
                            title={t('employees.statistics')}
                            description={t('employees.dataDashboard')}
                            onClick={() => router.push('/admin/employees/admin/statistics')}
                            color="#2a86a1ff"
                            bgClass="bg-gray-100"
                        />
                        <MiniStatRow
                            icon={History}
                            title={t('employees.history')}
                            description={t('employees.viewHistory')}
                            onClick={() => router.push('/admin/employees/admin/history')}
                            color="#6366f1" // indigo-600
                            bgClass="bg-indigo-50"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
