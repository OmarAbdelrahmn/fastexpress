"use client";

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { AuthProvider, useAuth } from '@/lib/auth/authContext';
import {
  ACCOUNTANT_DASHBOARD_PATH,
  ACCOUNTANT_LOGIN_PATH,
  getCurrentAccountantUser,
  getRedirectForAuthenticatedUser,
  isAccountantUser,
} from '@/lib/auth/accountantAuth';
import { AlertCircle, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function AccountantLayoutContent({ children }) {
  const { loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [roleChecking, setRoleChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const isLoginPage = pathname === ACCOUNTANT_LOGIN_PATH;

  useEffect(() => {
    const user = getCurrentAccountantUser();

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

    if (!isAccountantUser(user)) {
      const redirectTo = getRedirectForAuthenticatedUser(user);
      setHasAccess(false);
      router.replace(redirectTo || '/');
    } else {
      setHasAccess(true);
      if (isLoginPage) router.replace(ACCOUNTANT_DASHBOARD_PATH);
    }

    setRoleChecking(false);
  }, [isLoginPage, router]);

  if (loading || roleChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!hasAccess && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح بالدخول</h1>
          <p className="text-gray-600 mb-4">هذه المنطقة مخصصة للمحاسبين فقط.</p>
          <button
            onClick={() => router.push(ACCOUNTANT_LOGIN_PATH)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            الذهاب إلى تسجيل دخول المحاسب
          </button>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-400" dir="rtl">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6 overflow-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AccountantLayout({ children }) {
  return (
    <AuthProvider loginPath={ACCOUNTANT_LOGIN_PATH} dashboardPath={ACCOUNTANT_DASHBOARD_PATH}>
      <AccountantLayoutContent>{children}</AccountantLayoutContent>
    </AuthProvider>
  );
}
