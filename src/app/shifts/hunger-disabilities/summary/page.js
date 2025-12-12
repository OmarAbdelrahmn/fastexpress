'use client';
import { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/pageheader';
import Table from '@/components/Ui/Table';
import { BarChart3, Calculator, Calendar as CalendarIcon, Filter, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { hungerService } from '@/lib/api/hungerService';
import { getHungerReportColumns } from '../reportColumns';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function SummaryPage() {
    const { t, language } = useLanguage();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        // Set default date range (current month)
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
        setStartDate(firstDay);
        setEndDate(lastDay);
    }, []);

    useEffect(() => {
        if (startDate && endDate) {
            fetchData();
        }
    }, [startDate, endDate]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const jsonData = await hungerService.getSummary(startDate, endDate);
            setData(jsonData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const housingBreakdownColumns = [
        { header: t('hungerDisabilities.company'), accessor: 'housingName' },
        { header: t('companies.ridersCount'), accessor: 'riderCount' },
        { header: t('companies.ordersCount'), accessor: 'totalOrders' },
        { header: t('hungerDisabilities.aboveTarget'), accessor: 'ridersAboveTarget' },
    ];

    const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
                    <div className="text-2xl font-bold text-gray-900">{value}</div>
                    {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
                </div>
                <div className={`p-3 rounded-lg ${colorClass}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    const hungerColumns = getHungerReportColumns(t);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <PageHeader
                title={t('hungerDisabilities.summary')}
                subtitle={t('hungerDisabilities.summaryDesc')}
                icon={BarChart3}
            />

            <div className="container mx-auto px-4 mt-8 space-y-8">
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('shifts.startDate')}</label>
                            <div className="relative">
                                <CalendarIcon className={`absolute top-2.5 h-5 w-5 text-gray-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className={`w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('shifts.endDate')}</label>
                            <div className="relative">
                                <CalendarIcon className={`absolute top-2.5 h-5 w-5 text-gray-400 ${language === 'ar' ? 'right-3' : 'left-3'}`} />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className={`w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-1/3">
                            <button
                                onClick={fetchData}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <Filter className="h-5 w-5" />
                                <span>{t('common.refresh')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : data && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title={t('companies.ridersCount')}
                                value={data.totalRiders}
                                icon={Users}
                                colorClass="bg-blue-500"
                            />
                            <StatCard
                                title={t('companies.ordersCount')}
                                value={data.totalOrders}
                                subtext={`${t('shifts.averageLabel')} ${data.averageOrdersPerRider} / ${t('shifts.rider')}`}
                                icon={Calculator}
                                colorClass="bg-purple-500"
                            />
                            <StatCard
                                title={t('companies.performance')}
                                value={`${data.overallPerformanceRate}%`}
                                subtext={`${t('hungerDisabilities.deficit')}: ${data.totalDifference}`}
                                icon={TrendingUp}
                                colorClass={data.totalDifference >= 0 ? "bg-green-500" : "bg-red-500"}
                            />
                            <StatCard
                                title={t('hungerDisabilities.aboveTarget')}
                                value={data.ridersAboveTarget}
                                subtext={`${t('common.from')} ${data.totalRiders} ${t('shifts.rider')}`}
                                icon={BarChart3}
                                colorClass="bg-indigo-500"
                            />
                        </div>

                        {/* Company Breakdown */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800">{t('hungerDisabilities.companyBreakdown')}</h2>
                            </div>
                            <Table
                                columns={housingBreakdownColumns}
                                data={data.housingBreakdown || []}
                                loading={false}
                            />
                        </div>

                        {/* Top Performers */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <TrendingUp className="text-green-500" />
                                    <span>{t('hungerDisabilities.topRiders')}</span>
                                </h2>
                            </div>
                            <Table
                                columns={hungerColumns}
                                data={data.topPerformers || []}
                                loading={false}
                            />
                        </div>

                        {/* Bottom Performers */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <TrendingDown className="text-red-500" />
                                    <span>{t('hungerDisabilities.bottomRiders')}</span>
                                </h2>
                            </div>
                            <Table
                                columns={hungerColumns}
                                data={data.bottomPerformers || []}
                                loading={false}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
