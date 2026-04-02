import { ApiService } from './apiService';

export const walletService = {
    /**
     * POST /api/wallet/import?date=YYYY-MM-DD
     * Multipart form-data with a .xlsx/.xls file field named "file"
     */
    importWalletFile: async (file, date) => {
        const formData = new FormData();
        formData.append('file', file);
        return ApiService.uploadFormData(`/api/wallet/import?date=${date}`, formData);
    },

    /**
     * GET /api/wallet
     * Returns all wallet records ordered by date descending
     */
    getAllRecords: async () => {
        return ApiService.get('/api/wallet');
    },
};
