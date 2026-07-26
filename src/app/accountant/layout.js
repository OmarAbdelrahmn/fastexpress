'use client';

import { AccountingShell, LoadingState } from '@/components/accounting';
import { AccountingWorkspaceProvider } from '@/lib/accounting/AccountingWorkspaceContext';
import { accountingT } from '@/lib/accounting/i18n';
import { AuthProvider, useAuth } from '@/lib/auth/authContext';
import {
  ACCOUNTANT_DASHBOARD_PATH,
  ACCOUNTANT_LOGIN_PATH,
  getCurrentAccountantUser,
  getRedirectForAuthenticatedUser,
} from '@/lib/auth/accountantAuth';
import { useLanguage } from '@/lib/context/LanguageContext';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function rolesOf(user) {
  const roles = user?.roles ?? user?.role ?? [];
  return (Array.isArray(roles) ? roles : [roles]).map(String);
}

function hasAccountantAccess(user) {
  const roles = rolesOf(user);
  return roles.includes('Accountant') || roles.includes('Master');
}

const MASTER_ONLY_PATHS = [
  '/accountant/setup',
  '/accountant/ledger',
  '/accountant/access',
  '/accountant/compensation',
  '/accountant/operations/compliance',
];

function AccountantLayoutContent({ children }) {
  const { loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLanguage();
  const [roleChecking, setRoleChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [user, setUser] = useState(null);
  const isLoginPage = pathname === ACCOUNTANT_LOGIN_PATH;

  useEffect(() => {
    const user = getCurrentAccountantUser();
    setUser(user);

    if (isLoginPage && !user) {
      setRoleChecking(false);
      setHasAccess(true);
      return;
    }

    if (!user) {
      setRoleChecking(false);
      setHasAccess(false);
      return;
    }

    if (!hasAccountantAccess(user)) {
      let redirectTo = '/';
      try {
        redirectTo = getRedirectForAuthenticatedUser(user) || '/';
      } catch {
        const roles = rolesOf(user);
        if (roles.includes('Admin')) redirectTo = '/admin/dashboard';
        if (roles.some((role) => ['Member', 'Supervisor', 'User'].includes(role))) redirectTo = '/member/dashboard';
      }
      setHasAccess(false);
      router.replace(redirectTo);
    } else {
      setHasAccess(true);
      if (isLoginPage) router.replace(ACCOUNTANT_DASHBOARD_PATH);
    }

    setRoleChecking(false);
  }, [isLoginPage, router]);

  if (loading || roleChecking) {
    return (
      <div className="accounting-shell flex min-h-screen items-center justify-center p-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <LoadingState
          title={accountingT(locale, 'shell.checkingAccess')}
          description={accountingT(locale, 'shell.checkingAccessDescription')}
        />
      </div>
    );
  }

  if (!hasAccess && !isLoginPage) {
    return (
      <div className="accounting-shell flex min-h-screen items-center justify-center p-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-7 text-center shadow-xl shadow-slate-900/5">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-700">
            <AlertCircle aria-hidden="true" size={25} />
          </span>
          <h1 className="mt-4 text-xl font-black text-slate-950">{accountingT(locale, 'shell.accessDenied')}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{accountingT(locale, 'shell.accessDeniedDescription')}</p>
          <button
            onClick={() => router.push(ACCOUNTANT_LOGIN_PATH)}
            className="accounting-button accounting-button--primary accounting-button--md mx-auto mt-5"
          >
            <ArrowRight className="rtl:rotate-180" aria-hidden="true" size={17} />
            {accountingT(locale, 'shell.backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  const isMasterOnlyPage = MASTER_ONLY_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (!isLoginPage && isMasterOnlyPage && !rolesOf(user).includes('Master')) {
    return (
      <div className="accounting-shell flex min-h-screen items-center justify-center p-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-900/5">
          <h1 className="text-xl font-black text-slate-950">{locale === 'ar' ? 'هذه الصفحة مخصصة للمدير المالي' : 'This page is for Master users'}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{locale === 'ar' ? 'يمكنك متابعة العمل اليومي من لوحة المحاسبة.' : 'Continue your daily work from the accounting overview.'}</p>
          <button onClick={() => router.push(ACCOUNTANT_DASHBOARD_PATH)} className="accounting-button accounting-button--primary accounting-button--md mx-auto mt-5">
            {locale === 'ar' ? 'العودة للنظرة العامة' : 'Back to overview'}
          </button>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AccountingWorkspaceProvider user={user}>
      <AccountingShell>{children}</AccountingShell>
    </AccountingWorkspaceProvider>
  );
}

export default function AccountantLayout({ children }) {
  return (
    <AuthProvider loginPath={ACCOUNTANT_LOGIN_PATH} dashboardPath={ACCOUNTANT_DASHBOARD_PATH}>
      <AccountantLayoutContent>{children}</AccountantLayoutContent>
    </AuthProvider>
  );
}
