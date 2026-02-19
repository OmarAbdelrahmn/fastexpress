'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Calendar, Search } from 'lucide-react';
import PageHeader from "@/components/layout/pageheader";
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Card from '@/components/Ui/Card';
import { useLanguage } from '@/lib/context/LanguageContext';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export default function CompanyDailyTrendPage() {
    const { t } = useLanguage();

    const [rawData, setRawData] = useState([]);
    const [zoomLevel, setZoomLevel] = useState('month'); // 'day', 'week', 'month', 'year'
    const [loading, setLoading] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState('all'); // 'all', '1', '2'
    const [selectedMetric, setSelectedMetric] = useState('accepted'); // 'accepted', 'rejected', 'both'

    // Date filters for "Zoom" (Local filtering)
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Load data via API
    useEffect(() => {
        handleLoadData();
    }, []);

    const handleLoadData = async () => {
        setLoading(true);
        try {
            const data = await ApiService.get(API_ENDPOINTS.REPORTS.FROM_START);
            setRawData(Array.isArray(data) ? data : []);

            // Optional: Set default date range based on data?
            // For now, let's leave them empty to show all, or set to typical range if needed.
        } catch (error) {
            console.error("Failed to fetch report data:", error);
            setRawData([]);
        } finally {
            setLoading(false);
        }
    };

    // Aggregation Logic
    const chartData = useMemo(() => {
        if (!rawData.length) return [];

        // 1. Filter raw data based on date range inputs
        const filteredRawData = rawData.filter(item => {
            if (!startDate && !endDate) return true;
            const itemDate = new Date(item.shiftDate);
            const start = startDate ? new Date(startDate) : new Date('2000-01-01');
            const end = endDate ? new Date(endDate) : new Date('2100-01-01');
            return itemDate >= start && itemDate <= end;
        });

        const groupedData = {};

        filteredRawData.forEach(item => {
            let key;
            const date = new Date(item.shiftDate);

            if (zoomLevel === 'day') {
                key = item.shiftDate;
            } else if (zoomLevel === 'week') {
                // Get week number - ISO week starts on Monday
                const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
                const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
                const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
                key = `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
            } else if (zoomLevel === 'month') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else if (zoomLevel === 'year') {
                key = `${date.getFullYear()}`;
            }

            if (!groupedData[key]) {
                groupedData[key] = {
                    date: key,
                    originalDate: date.getTime(), // For sorting
                    count: 0,
                    // Initialize metrics
                    hungerAccepted: 0,
                    hungerRejected: 0,
                    hungerUniqueRiders: 0,
                    ketaAccepted: 0,
                    ketaRejected: 0,
                    ketaUniqueRiders: 0,
                };
            }

            groupedData[key].count += 1;

            // Aggregate based on company
            if (item.companyId === 1) { // Hunger
                groupedData[key].hungerAccepted += item.totalAcceptedOrders || 0;
                groupedData[key].hungerRejected += item.totalRejectedOrders || 0;
                groupedData[key].hungerUniqueRiders += item.uniqueRiders || 0;
            } else if (item.companyId === 2) { // Keta
                groupedData[key].ketaAccepted += item.totalAcceptedOrders || 0;
                groupedData[key].ketaRejected += item.totalRejectedOrders || 0;
                groupedData[key].ketaUniqueRiders += item.uniqueRiders || 0;
            }
        });

        // Convert sums to averages for unique riders in each group
        const result = Object.values(groupedData).sort((a, b) => a.originalDate - b.originalDate);
        return result.map(item => ({
            ...item,
            hungerUniqueRiders: item.count > 0 ? Math.round(item.hungerUniqueRiders / (item.count / 2)) : 0, // Approx count of days
            ketaUniqueRiders: item.count > 0 ? Math.round(item.ketaUniqueRiders / (item.count / 2)) : 0,
        }));
    }, [rawData, zoomLevel, startDate, endDate]); // `zoomLevel` here is the aggregation zoom

    // Calculate statistics for the filtered data
    const statistics = useMemo(() => {
        if (!rawData.length) return null;

        // 1. Filter raw data matches the chartData filtering
        const filteredRawData = rawData.filter(item => {
            if (!startDate && !endDate) return true;
            const itemDate = new Date(item.shiftDate);
            const start = startDate ? new Date(startDate) : new Date('2000-01-01');
            const end = endDate ? new Date(endDate) : new Date('2100-01-01');
            return itemDate >= start && itemDate <= end;
        });

        if (!filteredRawData.length) return null;

        // For Unique Riders, we want the daily average in the period
        const dailyRiders = {}; // date -> riders
        let totalAccepted = 0;
        let totalRejected = 0;
        let hungerAccepted = 0;
        let ketaAccepted = 0;

        filteredRawData.forEach(item => {
            const date = item.shiftDate;
            if (!dailyRiders[date]) dailyRiders[date] = 0;

            if (selectedCompany === 'all' || selectedCompany === '1') {
                if (item.companyId === 1) {
                    totalAccepted += item.totalAcceptedOrders || 0;
                    totalRejected += item.totalRejectedOrders || 0;
                    hungerAccepted += item.totalAcceptedOrders || 0;
                    dailyRiders[date] += item.uniqueRiders || 0;
                }
            }
            if (selectedCompany === 'all' || selectedCompany === '2') {
                if (item.companyId === 2) {
                    totalAccepted += item.totalAcceptedOrders || 0;
                    totalRejected += item.totalRejectedOrders || 0;
                    ketaAccepted += item.totalAcceptedOrders || 0;
                    dailyRiders[date] += item.uniqueRiders || 0;
                }
            }
        });

        const dayCount = Object.keys(dailyRiders).length;
        const totalUniqueRidersSum = Object.values(dailyRiders).reduce((a, b) => a + b, 0);
        const avgUniqueRiders = dayCount > 0 ? Math.round(totalUniqueRidersSum / dayCount) : 0;

        // Calculate previous period stats for comparison
        let previousAccepted = 0;
        let previousRejected = 0;
        let previousUniqueRidersSum = 0;
        const previousDailyRiders = {};
        let previousHungerAccepted = 0;
        let previousKetaAccepted = 0;

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const periodDuration = end - start;

            const prevEnd = new Date(start);
            prevEnd.setDate(prevEnd.getDate() - 1);
            const prevStart = new Date(prevEnd - periodDuration);

            const previousData = rawData.filter(item => {
                const itemDate = new Date(item.shiftDate);
                return itemDate >= prevStart && itemDate <= prevEnd;
            });

            previousData.forEach(item => {
                const date = item.shiftDate;
                if (!previousDailyRiders[date]) previousDailyRiders[date] = 0;

                if (selectedCompany === 'all' || selectedCompany === '1') {
                    if (item.companyId === 1) {
                        previousAccepted += item.totalAcceptedOrders || 0;
                        previousRejected += item.totalRejectedOrders || 0;
                        previousHungerAccepted += item.totalAcceptedOrders || 0;
                        previousDailyRiders[date] += item.uniqueRiders || 0;
                    }
                }
                if (selectedCompany === 'all' || selectedCompany === '2') {
                    if (item.companyId === 2) {
                        previousAccepted += item.totalAcceptedOrders || 0;
                        previousRejected += item.totalRejectedOrders || 0;
                        previousKetaAccepted += item.totalAcceptedOrders || 0;
                        previousDailyRiders[date] += item.uniqueRiders || 0;
                    }
                }
            });
        }

        const prevDayCount = Object.keys(previousDailyRiders).length;
        const totalPrevUniqueRidersSum = Object.values(previousDailyRiders).reduce((a, b) => a + b, 0);
        const avgPreviousUniqueRiders = prevDayCount > 0 ? Math.round(totalPrevUniqueRidersSum / prevDayCount) : 0;

        // Calculate current and previous total orders
        const totalOrders = totalAccepted + totalRejected;
        const previousTotalOrders = previousAccepted + previousRejected;

        // Calculate percentage changes
        const acceptedChange = previousAccepted > 0
            ? ((totalAccepted - previousAccepted) / previousAccepted) * 100
            : 0;
        const rejectedChange = previousRejected > 0
            ? ((totalRejected - previousRejected) / previousRejected) * 100
            : 0;
        const uniqueRidersChange = avgPreviousUniqueRiders > 0
            ? ((avgUniqueRiders - avgPreviousUniqueRiders) / avgPreviousUniqueRiders) * 100
            : 0;
        const totalOrdersChange = previousTotalOrders > 0
            ? ((totalOrders - previousTotalOrders) / previousTotalOrders) * 100
            : 0;
        const hungerChange = previousHungerAccepted > 0
            ? ((hungerAccepted - previousHungerAccepted) / previousHungerAccepted) * 100
            : 0;
        const ketaChange = previousKetaAccepted > 0
            ? ((ketaAccepted - previousKetaAccepted) / previousKetaAccepted) * 100
            : 0;

        return {
            totalAccepted,
            totalRejected,
            totalUniqueRiders: avgUniqueRiders,
            acceptedChange,
            rejectedChange,
            uniqueRidersChange,
            totalOrdersChange,
            hungerAccepted,
            ketaAccepted,
            hungerChange,
            ketaChange,
            hasPreviousData: previousAccepted > 0 || previousRejected > 0 || avgPreviousUniqueRiders > 0
        };
    }, [rawData, selectedCompany, startDate, endDate]);

    // Determine lines to show
    const showHunger = selectedCompany === 'all' || selectedCompany === '1';
    const showKeta = selectedCompany === 'all' || selectedCompany === '2';
    const showAccepted = selectedMetric === 'accepted' || selectedMetric === 'both';
    const showRejected = selectedMetric === 'rejected' || selectedMetric === 'both';
    const showUniqueRiders = selectedMetric === 'uniqueRiders';

    const formatXAxis = (tickItem) => {
        return tickItem;
    };

    // Helper to format Y-axis label based on selection
    const getYAxisLabel = () => {
        if (selectedMetric === 'accepted') return t('companyDailyTrend.acceptedOrders');
        if (selectedMetric === 'rejected') return t('companyDailyTrend.rejectedOrders');
        if (selectedMetric === 'uniqueRiders') return t('companyDailyTrend.uniqueRidersMetric');
        return t('companyDailyTrend.bothMetrics');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 pb-12">
            <PageHeader
                title={"رسم بياني لاداء الشركات"}
                subtitle={"عرض مخطط بياني للاداء اليومي و الشهري و السنوي للشركات"}
                icon={Calendar}
            />

            {/* Filters & Controls */}
            <div className="mx-8 my-5">
                <Card>
                    <div className="flex flex-col gap-6">
                        {/* Top Row: Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Company Filter */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">{t('companyDailyTrend.selectCompany')}</label>
                                <select
                                    value={selectedCompany}
                                    onChange={(e) => setSelectedCompany(e.target.value)}
                                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="all">{t('companyDailyTrend.allCompanies')}</option>
                                    <option value="1">{t('companyDailyTrend.hunger')}</option>
                                    <option value="2">{t('companyDailyTrend.keta')}</option>
                                </select>
                            </div>

                            {/* Metric Filter */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">{t('companyDailyTrend.metric')}</label>
                                <select
                                    value={selectedMetric}
                                    onChange={(e) => setSelectedMetric(e.target.value)}
                                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="accepted">{t('companyDailyTrend.accepted')}</option>
                                    <option value="rejected">{t('companyDailyTrend.rejected')}</option>
                                    <option value="uniqueRiders">{t('companyDailyTrend.uniqueRidersMetric')}</option>
                                    <option value="both">{t('companyDailyTrend.bothMetrics')}</option>
                                </select>
                            </div>

                            {/* Date Range Inputs (Zoom) */}
                            <Input
                                type="date"
                                label={t('common.from')}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <Input
                                type="date"
                                label={t('common.to')}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        {/* Bottom Row: Zoom Levels & Refresh */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {t('dailyTrendAnalysis')}
                                </h2>
                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                                    {chartData.length} {t('days')}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                                <button
                                    onClick={() => setZoomLevel(prev => Math.max(prev - 1, 0))}
                                    disabled={zoomLevel === 0}
                                    className="p-2 hover:bg-white hover:shadow-sm rounded-md disabled:opacity-50 transition-all text-gray-600"
                                    title="تصغير"
                                >
                                    <ZoomOut size={18} />
                                </button>
                                <span className="text-xs font-mono font-bold text-gray-500 w-8 text-center">
                                    {parseInt(100 + (zoomLevel * 10))}%
                                </span>
                                <button
                                    onClick={() => setZoomLevel(prev => Math.min(prev + 1, 5))}
                                    disabled={zoomLevel === 5}
                                    className="p-2 hover:bg-white hover:shadow-sm rounded-md disabled:opacity-50 transition-all text-gray-600"
                                    title="تكبير"
                                >
                                    <ZoomIn size={18} />
                                </button>
                                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                <button
                                    onClick={() => {
                                        setZoomLevel(0);
                                        setReferenceLine(null);
                                    }}
                                    className="p-2 hover:bg-white hover:shadow-sm rounded-md text-gray-600 transition-all"
                                    title="إعادة تعيين"
                                >
                                    <RefreshCcw size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="mx-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Accepted Orders Card */}
                        <Card>
                            <div className="p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600">{t('companyDailyTrend.totalAccepted')}</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-2">
                                            {statistics.totalAccepted.toLocaleString()}
                                        </p>
                                        {statistics.hasPreviousData && (
                                            <div className={`flex items-center mt-2 text-sm ${statistics.acceptedChange >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                <span className="font-medium">
                                                    {statistics.acceptedChange >= 0 ? '↑' : '↓'}
                                                    {Math.abs(statistics.acceptedChange).toFixed(1)}%
                                                </span>
                                                <span className="ml-2 text-gray-500">{t('companyDailyTrend.vsPrevious')}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Total Rejected Orders Card */}
                        <Card>
                            <div className="p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600">{t('companyDailyTrend.totalRejected')}</p>
                                        <p className="text-3xl font-bold text-red-600 mt-2">
                                            {statistics.totalRejected.toLocaleString()}
                                        </p>
                                        {statistics.hasPreviousData && (
                                            <div className={`flex items-center mt-2 text-sm ${statistics.rejectedChange <= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                <span className="font-medium">
                                                    {statistics.rejectedChange >= 0 ? '↑' : '↓'}
                                                    {Math.abs(statistics.rejectedChange).toFixed(1)}%
                                                </span>
                                                <span className="ml-2 text-gray-500">{t('companyDailyTrend.vsPrevious')}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Hunger Company Card */}
                        <Card>
                            <div className="p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600">{t('companyDailyTrend.hungerOrders')}</p>
                                        <p className="text-3xl font-bold text-purple-600 mt-2">
                                            {statistics.hungerAccepted.toLocaleString()}
                                        </p>
                                        {statistics.hasPreviousData && (
                                            <div className={`flex items-center mt-2 text-sm ${statistics.hungerChange >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                <span className="font-medium">
                                                    {statistics.hungerChange >= 0 ? '↑' : '↓'}
                                                    {Math.abs(statistics.hungerChange).toFixed(1)}%
                                                </span>
                                                <span className="ml-2 text-gray-500">{t('companyDailyTrend.vsPrevious')}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Keta Company Card */}
                        <Card>
                            <div className="p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-600">{t('companyDailyTrend.ketaOrders')}</p>
                                        <p className="text-3xl font-bold text-orange-600 mt-2">
                                            {statistics.ketaAccepted.toLocaleString()}
                                        </p>
                                        {statistics.hasPreviousData && (
                                            <div className={`flex items-center mt-2 text-sm ${statistics.ketaChange >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                <span className="font-medium">
                                                    {statistics.ketaChange >= 0 ? '↑' : '↓'}
                                                    {Math.abs(statistics.ketaChange).toFixed(1)}%
                                                </span>
                                                <span className="ml-2 text-gray-500">{t('companyDailyTrend.vsPrevious')}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-full">
                                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Card>

                    </div>
                </div>
            )}

            {/* Chart Area */}
            <div className="mx-8 my-5">
                <Card>
                    <div className="h-[300px] md:h-[400px] w-full" style={{ direction: 'ltr' }}>
                        {loading ? (
                            <div className="h-full flex items-center justify-center">{t('common.loading')}</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatXAxis}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        tick={{ dx: -30 }}
                                        tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                                        label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip />
                                    <Legend />

                                    {/* Lines for Hunger (ID: 1) */}
                                    {showHunger && showAccepted && (
                                        <Line
                                            type="monotone"
                                            dataKey="hungerAccepted"
                                            name={`${t('companyDailyTrend.hunger')} - ${t('companyDailyTrend.accepted')}`}
                                            stroke="#8884d8"
                                            strokeWidth={2}
                                            activeDot={{ r: 6 }}
                                        />
                                    )}
                                    {showHunger && showRejected && (
                                        <Line
                                            type="monotone"
                                            dataKey="hungerRejected"
                                            name={`${t('companyDailyTrend.hunger')} - ${t('companyDailyTrend.rejected')}`}
                                            stroke="#EF4444"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                        />
                                    )}
                                    {showHunger && showUniqueRiders && (
                                        <Line
                                            type="monotone"
                                            dataKey="hungerUniqueRiders"
                                            name={`${t('companyDailyTrend.hunger')} - ${t('companyDailyTrend.uniqueRidersMetric')}`}
                                            stroke="#9333ea"
                                            strokeWidth={2}
                                            activeDot={{ r: 6 }}
                                        />
                                    )}

                                    {/* Lines for Keta (ID: 2) */}
                                    {showKeta && showAccepted && (
                                        <Line
                                            type="monotone"
                                            dataKey="ketaAccepted"
                                            name={`${t('companyDailyTrend.keta')} - ${t('companyDailyTrend.accepted')}`}
                                            stroke="#82ca9d"
                                            strokeWidth={2}
                                            activeDot={{ r: 6 }}
                                        />
                                    )}
                                    {showKeta && showRejected && (
                                        <Line
                                            type="monotone"
                                            dataKey="ketaRejected"
                                            name={`${t('companyDailyTrend.keta')} - ${t('companyDailyTrend.rejected')}`}
                                            stroke="#ff6b6b"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                        />
                                    )}
                                    {showKeta && showUniqueRiders && (
                                        <Line
                                            type="monotone"
                                            dataKey="ketaUniqueRiders"
                                            name={`${t('companyDailyTrend.keta')} - ${t('companyDailyTrend.uniqueRidersMetric')}`}
                                            stroke="#f97316"
                                            strokeWidth={2}
                                            activeDot={{ r: 6 }}
                                        />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
