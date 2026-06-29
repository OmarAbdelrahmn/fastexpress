"use client";

import { AuthProvider, useAuth } from '@/lib/auth/authContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Loader2, AlertCircle } from 'lucide-react';
import { TokenManager } from '@/lib/auth/tokenManager';
import { APP_ROLES, getAppForUser, getDashboardPathForApp, hasAnyRole } from '@/lib/config/appConfig';

function MemberLayoutContent({ children }) {
    const { loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [roleChecking, setRoleChecking] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const isLoginPage = pathname === '/member/login';

    useEffect(() => {
        // Skip role check for login page
        if (isLoginPage) {
            setRoleChecking(false);
            setHasAccess(true);
            return;
        }

        // Check user role
        const checkUserRole = () => {
            const user = TokenManager.getUserFromToken();

            if (!user) {
                setRoleChecking(false);
                setHasAccess(false);
                return;
            }

            const isSupervisor = hasAnyRole(user, APP_ROLES.supervisor);

            if (!isSupervisor) {
                const app = getAppForUser(user);
                router.push(app ? getDashboardPathForApp(app) : '/admin/dashboard');
                setHasAccess(false);
            } else {
                setHasAccess(true);
            }

            setRoleChecking(false);
        };

        checkUserRole();
    }, [pathname, isLoginPage, router]);

    // Show loading spinner while checking authentication or role
    if (loading || roleChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Loader2 className="animate-spin text-orange-500" size={48} />
            </div>
        );
    }

    // Show access denied if admin trying to access member area (shouldn't normally see this due to redirect)
    if (!hasAccess && !isLoginPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-4">This area is for members only.</p>
                    <button
                        onClick={() => router.push('/admin/dashboard')}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Go to Admin Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Login page without Header and Sidebar
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Other member pages with Header and Sidebar
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

export default function MemberLayout({ children }) {
    return (
        <AuthProvider loginPath="/member/login" dashboardPath="/member/dashboard">
            <MemberLayoutContent>{children}</MemberLayoutContent>
        </AuthProvider>
    );
}
