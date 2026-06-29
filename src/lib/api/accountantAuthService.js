import { ApiService } from './apiService';
import { API_ENDPOINTS } from './endpoints';
import { TokenManager } from '@/lib/auth/tokenManager';
import {
  ACCOUNTANT_DASHBOARD_PATH,
  clearAccountantSession,
  getCurrentAccountantUser,
  getRedirectForAuthenticatedUser,
  isAccountantUser,
} from '@/lib/auth/accountantAuth';

export const accountantAuthService = {
  login: async (credentials) => {
    const response = await ApiService.post(API_ENDPOINTS.ACCOUNTING.AUTH.LOGIN, credentials);

    if (!response?.token) {
      throw new Error('Login failed');
    }

    TokenManager.setToken(response.token);
    const user = response.user || getCurrentAccountantUser();

    if (!isAccountantUser(user)) {
      const redirectTo = getRedirectForAuthenticatedUser(user);
      if (!redirectTo) clearAccountantSession();

      const error = new Error('This login is for accountant users only.');
      error.redirectTo = redirectTo;
      throw error;
    }

    return {
      token: response.token,
      user,
      redirectTo: ACCOUNTANT_DASHBOARD_PATH,
      raw: response,
    };
  },

  logout: () => {
    clearAccountantSession();
  },

  getCurrentAccount: () => ApiService.get(API_ENDPOINTS.ACCOUNTING.AUTH.ME),

  updateAccountInfo: (payload) => ApiService.put(API_ENDPOINTS.ACCOUNTING.AUTH.UPDATE_INFO, payload),

  changePassword: (payload) => ApiService.put(API_ENDPOINTS.ACCOUNTING.AUTH.CHANGE_PASSWORD, payload),
};
