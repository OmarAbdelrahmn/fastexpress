import { ApiService } from './apiService';
import { API_ENDPOINTS } from './endpoints';
import { TokenManager } from '../auth/tokenManager';

export const escapedService = {
  /**
   * GET /api/escaped
   * Returns all escaped employees regardless of path.
   */
  list: async () => {
    return ApiService.get(API_ENDPOINTS.ESCAPED_EMPLOYEE.LIST);
  },

  /**
   * GET /api/escaped/{iqamaNo}
   * Returns a single escaped employee or null
   */
  getByIqama: async (iqamaNo) => {
    try {
      return await ApiService.get(API_ENDPOINTS.ESCAPED_EMPLOYEE.BY_IQAMA(iqamaNo));
    } catch (err) {
      const list = await ApiService.get(API_ENDPOINTS.ESCAPED_EMPLOYEE.LIST);
      return list.find(x => x.iqamaNo == iqamaNo) || null;
    }
  },

  /**
   * GET /api/escaped/stats
   * Returns dashboard summary numbers.
   */
  getStats: async () => {
    return ApiService.get(API_ENDPOINTS.ESCAPED_EMPLOYEE.STATS);
  },

  /**
   * GET /api/escaped/by-path/{path}
   * Filter by path. Path: 0 (None), 1 (Reported), 2 (Outage)
   */
  getByPath: async (path) => {
    return ApiService.get(API_ENDPOINTS.ESCAPED_EMPLOYEE.BY_PATH(path));
  },

  /**
   * PUT /api/escaped/{iqamaNo}/reported
   * Activates the Reported path.
   */
  markReported: async (iqamaNo, data) => {
    const user = TokenManager.getUserFromToken();
    const payload = {
      ...data,
      updatedBy: user?.name || user?.username || 'admin',
    };
    return ApiService.put(API_ENDPOINTS.ESCAPED_EMPLOYEE.REPORTED(iqamaNo), payload);
  },

  /**
   * PUT /api/escaped/{iqamaNo}/outage
   * Activates the Outage path.
   */
  markOutage: async (iqamaNo, data) => {
    const user = TokenManager.getUserFromToken();
    const payload = {
      ...data,
      updatedBy: user?.name || user?.username || 'admin',
    };
    return ApiService.put(API_ENDPOINTS.ESCAPED_EMPLOYEE.OUTAGE(iqamaNo), payload);
  },

  /**
   * PUT /api/escaped/{iqamaNo}/switch-path
   * Switches between Reported and Outage paths.
   */
  switchPath: async (iqamaNo, data) => {
    const user = TokenManager.getUserFromToken();
    const payload = {
      ...data,
      updatedBy: user?.name || user?.username || 'admin',
    };
    return ApiService.put(API_ENDPOINTS.ESCAPED_EMPLOYEE.SWITCH_PATH(iqamaNo), payload);
  },

  /**
   * PATCH /api/escaped/{iqamaNo}/notes
   */
  updateNotes: async (iqamaNo, notes) => {
    return ApiService.patch(API_ENDPOINTS.ESCAPED_EMPLOYEE.UPDATE_NOTES(iqamaNo), { notes });
  },

  /**
   * DELETE /api/escaped/{iqamaNo}
   */
  delete: async (iqamaNo) => {
    return ApiService.delete(API_ENDPOINTS.ESCAPED_EMPLOYEE.DELETE(iqamaNo));
  },

  /**
   * DELETE /api/escaped/{iqamaNo}/force
   */
  forceDelete: async (iqamaNo) => {
    return ApiService.delete(API_ENDPOINTS.ESCAPED_EMPLOYEE.FORCE_DELETE(iqamaNo));
  },

  /**
   * PATCH /api/escaped/{iqamaNo}/deactivate
   */
  deactivate: async (iqamaNo) => {
    return ApiService.patch(API_ENDPOINTS.ESCAPED_EMPLOYEE.DEACTIVATE(iqamaNo));
  },

  /**
   * PATCH /api/escaped/{iqamaNo}/activate
   */
  activate: async (iqamaNo) => {
    return ApiService.patch(API_ENDPOINTS.ESCAPED_EMPLOYEE.ACTIVATE(iqamaNo));
  },
};
