"use client";

import { AuthProvider, useAuth } from '@/lib/auth/authContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { TokenManager } from '@/lib/auth/tokenManager';

function AdminLayoutContent({ children }) {
    const { loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [roleChecking, setRoleChecking] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const isLoginPage = pathname === '/admin/login';

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

            // Check if user has admin role
            const userRole = user.roles?.[0];
            const isAdmin = userRole === 'Admin' || userRole === 'Master';

            if (!isAdmin) {
                // User is not admin, redirect to member dashboard
                router.push('/member/dashboard');
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
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    // Show access denied if not admin (shouldn't normally see this due to redirect)
    if (!hasAccess && !isLoginPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-4">You don't have permission to access this area.</p>
                    <button
                        onClick={() => router.push('/member/dashboard')}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                        Go to Member Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Login page without Header and Sidebar
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Admin pages with Header and Sidebar
    return (
        <div>
            <div>
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }) {
    return (
        <AuthProvider loginPath="/admin/login" dashboardPath="/admin/dashboard">
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AuthProvider>
    );
}
