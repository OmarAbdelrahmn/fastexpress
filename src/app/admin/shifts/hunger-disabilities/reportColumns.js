import { TrendingUp, TrendingDown } from 'lucide-react';

export const getHungerReportColumns = (t) => [
    { header: t('hungerDisabilities.workingId'), accessor: 'actualWorkingId' },
    { header: t('hungerDisabilities.riderName'), accessor: 'actualRiderNameAR' },
    { header: t('hungerDisabilities.housingName'), accessor: 'housingName' },
    { header: t('hungerDisabilities.recordsCount'), accessor: 'totalDays' },
    { header: t('companies.ordersCount'), accessor: 'totalOrders' },
    { header: t('riders.target'), accessor: 'target' },
    { header: t('hungerDisabilities.deficit'), accessor: 'differenceFromTarget' },
    {
        header: t('ridersPerformance.performanceRate'),
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
        header: t('common.status'),
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
        header: t('hungerDisabilities.substituteId'),
        accessor: 'substituteWorkingId',
        render: (row) => row.substituteWorkingId || t('common.noData') // Or a specific 'none' key
    },
    {
        header: t('hungerDisabilities.substituteName'),
        accessor: 'substituteRiderNameAR',
        render: (row) => row.substituteRiderNameAR || t('common.noData')
    },];
