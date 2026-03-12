import { useState, useCallback, useMemo } from 'react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export const useHousingPerformance = (t) => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('hunger'); // 'hunger' or 'keta'

    const [form, setForm] = useState(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const formatDate = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        return {
            startDate: formatDate(startOfMonth),
            endDate: formatDate(yesterday)
        };
    });

    const fetchData = useCallback(async () => {
        if (!form.startDate || !form.endDate) {
            setError(t('common.periodError'));
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');
        setReportData(null);

        try {
            const endpoint = selectedCompany === 'keta'
                ? API_ENDPOINTS.REPORTS.ALL_HOUSINGS_SUMMARY + '2'
                : API_ENDPOINTS.REPORTS.ALL_HOUSINGS_SUMMARY;

            const data = await ApiService.get(endpoint, {
                startDate: form.startDate,
                endDate: form.endDate
            });

            if (data && data.length > 0) {
                setReportData(data);
                setSuccessMessage(t('common.successLoad'));
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setError(t('common.noData'));
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || t('common.errorLoad'));
        } finally {
            setLoading(false);
        }
    }, [form.startDate, form.endDate, selectedCompany, t]);

    const totals = useMemo(() => {
        if (!reportData) return null;

        let totalRiders = 0;
        let totalHours = 0;
        let totalOrders = 0;
        let totalMissingDays = 0;

        reportData.forEach(housing => {
            if (housing.summaryReport && housing.summaryReport.riderSummaries) {
                totalRiders += housing.summaryReport.riderSummaries.length;
                housing.summaryReport.riderSummaries.forEach(rider => {
                    totalHours += rider.totalWorkingHours || 0;
                    totalOrders += rider.totalOrders || 0;
                    totalMissingDays += Math.abs(rider.missingDays || 0);
                });
            }
        });

        return {
            totalRiders,
            totalHours,
            totalOrders,
            totalMissingDays
        };
    }, [reportData]);

    return {
        form,
        setForm,
        loading,
        reportData,
        error,
        setError,
        successMessage,
        setSuccessMessage,
        selectedCompany,
        setSelectedCompany,
        fetchData,
        totals
    };
};
