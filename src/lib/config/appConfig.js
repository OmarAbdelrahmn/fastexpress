export const APP_HOSTS = {
  website: process.env.NEXT_PUBLIC_WEBSITE_HOST || 'expserco.com',
  admin: process.env.NEXT_PUBLIC_ADMIN_HOST || 'admin.expserco.com',
  supervisor: process.env.NEXT_PUBLIC_SUPERVISOR_HOST || 'supervisor.expserco.com',
  accountant: process.env.NEXT_PUBLIC_ACCOUNTANT_HOST || 'accountant.expserco.com',
};

export const APP_ROLES = {
  admin: ['Master', 'Admin'],
  supervisor: ['Member', 'Supervisor', 'User'],
  accountant: ['Accountant'],
};

export const APP_DEFAULT_PATHS = {
  website: '/',
  admin: '/admin/login',
  supervisor: '/member/login',
  accountant: '/accountant/login',
};

export function normalizeHost(host = '') {
  return host.split(':')[0].toLowerCase();
}

export function getAppFromHost(host = '') {
  const normalizedHost = normalizeHost(host);

  if (APP_HOSTS.admin && normalizedHost === APP_HOSTS.admin) return 'admin';
  if (APP_HOSTS.supervisor && normalizedHost === APP_HOSTS.supervisor) return 'supervisor';
  if (APP_HOSTS.accountant && normalizedHost === APP_HOSTS.accountant) return 'accountant';

  return 'website';
}

export function getPrimaryRole(user) {
  return user?.roles?.[0] || user?.role || null;
}

export function hasAnyRole(user, allowedRoles = []) {
  const roles = user?.roles || (user?.role ? [user.role] : []);
  return roles.some((role) => allowedRoles.includes(role));
}

export function getAppForUser(user) {
  if (hasAnyRole(user, APP_ROLES.admin)) return 'admin';
  if (hasAnyRole(user, APP_ROLES.accountant)) return 'accountant';
  if (hasAnyRole(user, APP_ROLES.supervisor)) return 'supervisor';
  return null;
}

export function getDashboardPathForApp(app) {
  if (app === 'admin') return '/admin/dashboard';
  if (app === 'accountant') return '/accountant/dashboard';
  if (app === 'supervisor') return '/member/dashboard';
  return '/';
}

export function getLoginPathForApp(app) {
  if (app === 'admin') return '/admin/login';
  if (app === 'accountant') return '/accountant/login';
  if (app === 'supervisor') return '/member/login';
  return '/';
}

export function getAppUrl(app, path) {
  if (typeof window === 'undefined') return path;

  const currentHost = normalizeHost(window.location.host);
  const targetHost = APP_HOSTS[app];

  if (!targetHost || currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return path;
  }

  return `${window.location.protocol}//${targetHost}${path}`;
}
