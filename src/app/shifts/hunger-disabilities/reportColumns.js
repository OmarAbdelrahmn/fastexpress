import { TrendingUp, TrendingDown } from 'lucide-react';

export const hungerReportColumns = [
    { header: 'الرقم الوظيفي', accessor: 'actualWorkingId' },
    { header: 'اسم السائق (AR)', accessor: 'actualRiderNameAR' },
    { header: 'السكن', accessor: 'housingName' },
    { header: 'إجمالي الأيام', accessor: 'totalDays' },
    { header: 'إجمالي الطلبات', accessor: 'totalOrders' },
    { header: 'الهدف', accessor: 'target' },
    { header: 'الفارق', accessor: 'differenceFromTarget' },
    {
        header: 'نسبة الأداء',
        accessor: 'performancePercentage',
        render: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.performancePercentage >= 100
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}>
                {row.performancePercentage}%
            </span>
        )
    },
    {
        header: 'الحالة',
        accessor: 'performanceStatus',
        render: (row) => {
            // Determine status color based on isAboveTarget or string content if isAboveTarget is missing
            const isPositive = row.isAboveTarget ||
                (typeof row.performanceStatus === 'string' && row.performanceStatus.includes('Above')) ||
                row.differenceFromTarget >= 0;

            return (
                <div className="flex items-center gap-1">
                    {isPositive ? (
                        <TrendingUp size={14} className="text-green-600" />
                    ) : (
                        <TrendingDown size={14} className="text-red-600" />
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isPositive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {row.performanceStatus}
                    </span>
                </div>
            );
        }
    },
    // { header: 'ملاحظات', accessor: 'performanceNote' },
    {
        header: 'الرقم الوظيفي للبديل',
        accessor: 'substituteWorkingId',
        render: (row) => row.substituteWorkingId || 'لا يوجد'
    },
    {
        header: 'اسم البديل (AR)',
        accessor: 'substituteRiderNameAR',
        render: (row) => row.substituteRiderNameAR || 'لا يوجد'
    },];
