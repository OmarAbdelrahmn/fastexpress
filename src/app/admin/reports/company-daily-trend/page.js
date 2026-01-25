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
import { Calendar, Search, Filter } from 'lucide-react';
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
    const [zoomLevel, setZoomLevel] = useState('month'); // 'day', 'month', 'year'
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
            console.log("Fetched Data:", data);
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
            } else if (zoomLevel === 'month') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else if (zoomLevel === 'year') {
                key = `${date.getFullYear()}`;
            }

            if (!groupedData[key]) {
                groupedData[key] = {
                    date: key,
                    originalDate: date.getTime(), // For sorting
                    // Initialize metrics
                    hungerAccepted: 0,
                    hungerRejected: 0,
                    ketaAccepted: 0,
                    ketaRejected: 0,
                };
            }

            // Aggregate based on company
            if (item.companyId === 1) { // Hunger
                groupedData[key].hungerAccepted += item.totalAcceptedOrders || 0;
                groupedData[key].hungerRejected += item.totalRejectedOrders || 0;
            } else if (item.companyId === 2) { // Keta
                groupedData[key].ketaAccepted += item.totalAcceptedOrders || 0;
                groupedData[key].ketaRejected += item.totalRejectedOrders || 0;
            }
        });

        return Object.values(groupedData).sort((a, b) => a.originalDate - b.originalDate);
    }, [rawData, zoomLevel, startDate, endDate]);

    // Determine lines to show
    const showHunger = selectedCompany === 'all' || selectedCompany === '1';
    const showKeta = selectedCompany === 'all' || selectedCompany === '2';
    const showAccepted = selectedMetric === 'accepted' || selectedMetric === 'both';
    const showRejected = selectedMetric === 'rejected' || selectedMetric === 'both';

    const formatXAxis = (tickItem) => {
        return tickItem;
    };

    // Helper to format Y-axis label based on selection
    const getYAxisLabel = () => {
        if (selectedMetric === 'accepted') return t('companyDailyTrend.acceptedOrders');
        if (selectedMetric === 'rejected') return t('companyDailyTrend.rejectedOrders');
        return t('companyDailyTrend.bothMetrics');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 pb-12">
            <PageHeader
                title={t('companyDailyTrend.title')}
                subtitle={t('companyDailyTrend.subtitle')}
                icon={Calendar}
            />

            {/* Filters & Controls */}
            <div className="mx-6 mb-6">
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
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t pt-4">
                            <div className="flex gap-2">
                                <span className="text-sm text-gray-500 self-center mr-2">{t('companyDailyTrend.zoomLevel')}:</span>
                                <Button
                                    variant={zoomLevel === 'day' ? 'primary' : 'outline'}
                                    onClick={() => setZoomLevel('day')}
                                    size="sm"
                                >
                                    {t('companyDailyTrend.days')}
                                </Button>
                                <Button
                                    variant={zoomLevel === 'month' ? 'primary' : 'outline'}
                                    onClick={() => setZoomLevel('month')}
                                    size="sm"
                                >
                                    {t('companyDailyTrend.months')}
                                </Button>
                                <Button
                                    variant={zoomLevel === 'year' ? 'primary' : 'outline'}
                                    onClick={() => setZoomLevel('year')}
                                    size="sm"
                                >
                                    {t('companyDailyTrend.years')}
                                </Button>
                            </div>

                            <Button onClick={handleLoadData} disabled={loading} variant="outline" size="sm">
                                <Search size={16} className="mr-2" />
                                {t('common.refresh')}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Chart Area */}
            <div className="mx-6">
                <Card>
                    <div className="h-[500px] w-full p-4">
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
                                        tick={{ dx: -40 }}
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
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
