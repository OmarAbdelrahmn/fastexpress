import { ApiService } from './apiService';
import { TokenManager } from '../auth/tokenManager';
export const hungerService = {
    importHungerFile: async (file, shiftDate) => {

        const API_BASE = 'https://fastexpress.tryasp.net/api';
        const url = `${API_BASE}/hunger/import?shiftDate=${shiftDate}`;

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TokenManager.getToken()}`
            },
            body: formData
        });
        const result = await response.json();

        return result;
    },

    getSummary: async (startDate, endDate) => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        return ApiService.get('/api/hunger/summary', params);
    },

    getDateRangeReport: async (startDate, endDate) => {
        return ApiService.get('/api/hunger/date-range', { startDate, endDate });
    },

    getMonthReport: async (year, month) => {
        return ApiService.get('/api/hunger/month', { year, month });
    },

    getYearReport: async (year) => {
        return ApiService.get('/api/hunger/year', { year });
    },

    getRiderReport: async (workingId, startDate, endDate) => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        return ApiService.get(`/api/hunger/rider/${workingId}`, params);
    },

    getAboveTargetReport: async (startDate, endDate) => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        return ApiService.get('/api/hunger/above-target', params);
    },

    getBelowTargetReport: async (startDate, endDate) => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        return ApiService.get('/api/hunger/below-target', params);
    },

    getWithSubstitutesReport: async (startDate, endDate) => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        return ApiService.get('/api/hunger/with-substitutes', params);
    },

    getWithoutSubstitutesReport: async (startDate, endDate) => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        return ApiService.get('/api/hunger/without-substitutes', params);
    }
};
