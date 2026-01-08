// File: src/app/dashboard/layout.js
'use client';

import { AuthProvider, useAuth } from '@/lib/auth/authContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Loader2 } from 'lucide-react';

function DashboardLayoutContent({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen "  style={{
    background: "linear-gradient(0deg,rgba(255, 255, 255, 1) 5%, rgba(130, 130, 130, 1) 50%,rgba(255, 255, 255, 1) 100%)"
    }}
 dir="rtl">
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

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider loginPath="/admin/login" dashboardPath="/admin/dashboard">
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  );
}