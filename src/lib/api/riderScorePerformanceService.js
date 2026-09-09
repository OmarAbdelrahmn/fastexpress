import { ApiService } from './apiService';
import { API_ENDPOINTS } from './endpoints';

export const riderScorePerformanceService = {
  /**
   * List and filter records
   * @param {Object} [params] - Optional filters: { riderId, workingId, date, startDate, endDate, segment }
   */
  list: (params = {}) => {
    return ApiService.get(API_ENDPOINTS.RIDER_SCORE_PERFORMANCE.LIST, params);
  },

  /**
   * Get one record by ID
   * @param {number|string} id
   */
  getById: (id) => {
    return ApiService.get(API_ENDPOINTS.RIDER_SCORE_PERFORMANCE.BY_ID(id));
  },

  /**
   * Create manually
   * @param {Object} data
   */
  create: (data) => {
    return ApiService.post(API_ENDPOINTS.RIDER_SCORE_PERFORMANCE.CREATE, data);
  },

  /**
   * Update a record
   * @param {number|string} id
   * @param {Object} data
   */
  update: (id, data) => {
    return ApiService.put(API_ENDPOINTS.RIDER_SCORE_PERFORMANCE.UPDATE(id), data);
  },

  /**
   * Delete a record
   * @param {number|string} id
   */
  delete: (id) => {
    return ApiService.delete(API_ENDPOINTS.RIDER_SCORE_PERFORMANCE.DELETE(id));
  },

  /**
   * Import Excel file (.xlsx, .xlsm)
   * @param {File} file
   * @param {string} performanceDate - YYYY-MM-DD
   */
  importRiderScores: async (file, performanceDate) => {
    const url = `${API_ENDPOINTS.RIDER_SCORE_PERFORMANCE.IMPORT}?performanceDate=${encodeURIComponent(performanceDate)}`;
    return ApiService.uploadFile(url, file);
  },
};
