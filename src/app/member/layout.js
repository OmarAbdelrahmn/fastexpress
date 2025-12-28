"use client";

import { AuthProvider, useAuth } from '@/lib/auth/authContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Loader2 } from 'lucide-react';

function MemberLayoutContent({ children }) {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Loader2 className="animate-spin text-orange-500" size={48} />
            </div>
        );
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

export default function MemberLayout({ children }) {
    return (
        <AuthProvider>
            <MemberLayoutContent>{children}</MemberLayoutContent>
        </AuthProvider>
    );
}
