'use client';

import { APP_ROLES, getAppForUser, getDashboardPathForApp, hasAnyRole } from '@/lib/config/appConfig';
import { TokenManager } from './tokenManager';

export const ACCOUNTANT_LOGIN_PATH = '/accountant/login';
export const ACCOUNTANT_DASHBOARD_PATH = '/accountant/dashboard';

export function getCurrentAccountantUser() {
  return TokenManager.getUserFromToken();
}

export function isAccountantUser(user) {
  return hasAnyRole(user, APP_ROLES.accountant);
}

export function isAccountantAuthenticated() {
  const user = getCurrentAccountantUser();
  return TokenManager.isTokenValid() && isAccountantUser(user);
}

export function getRedirectForAuthenticatedUser(user, preferredApp = 'accountant') {
  const app = getAppForUser(user, preferredApp);
  return app ? getDashboardPathForApp(app) : null;
}

export function clearAccountantSession() {
  TokenManager.clearToken();
}
