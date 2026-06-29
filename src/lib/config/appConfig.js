export const APP_ROLES = {
  admin: ['Master', 'Admin'],
  supervisor: ['Member', 'Supervisor', 'User'],
  accountant: ['Accountant', 'Master'],
};

export function getPrimaryRole(user) {
  return user?.roles?.[0] || user?.role || null;
}

export function hasAnyRole(user, allowedRoles = []) {
  const roles = user?.roles || (user?.role ? [user.role] : []);
  return roles.some((role) => allowedRoles.includes(role));
}

export function canUseApp(user, app) {
  return Boolean(APP_ROLES[app] && hasAnyRole(user, APP_ROLES[app]));
}

export function getAppForUser(user, preferredApp = null) {
  if (preferredApp && canUseApp(user, preferredApp)) return preferredApp;
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
