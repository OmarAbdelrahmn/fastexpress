"use client";

import { AuthProvider, useAuth } from '@/lib/auth/authContext';
import { TokenManager } from '@/lib/auth/tokenManager';
import { APP_ROLES, hasAnyRole } from '@/lib/config/appConfig';
import { AlertCircle, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function AccountantLayoutContent({ children }) {
  const { loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [roleChecking, setRoleChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const isLoginPage = pathname === '/accountant/login';

  useEffect(() => {
    if (isLoginPage) {
      setRoleChecking(false);
      setHasAccess(true);
      return;
    }

    const user = TokenManager.getUserFromToken();
    if (!user) {
      setRoleChecking(false);
      setHasAccess(false);
      return;
    }

    if (!hasAnyRole(user, APP_ROLES.accountant)) {
      setHasAccess(false);
      router.push('/accountant/login');
    } else {
      setHasAccess(true);
    }

    setRoleChecking(false);
  }, [isLoginPage, router]);

  if (loading || roleChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  if (!hasAccess && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">This area is for accountant users only.</p>
          <button
            onClick={() => router.push('/accountant/login')}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Go to Accountant Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AccountantLayout({ children }) {
  return (
    <AuthProvider loginPath="/accountant/login" dashboardPath="/accountant/dashboard">
      <AccountantLayoutContent>{children}</AccountantLayoutContent>
    </AuthProvider>
  );
}
