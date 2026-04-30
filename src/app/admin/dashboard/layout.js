'use client';

import { AuthProvider, useAuth } from '@/lib/auth/authContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { Loader2 } from 'lucide-react';

function DashboardLayoutContent({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <Loader2 className="animate-spin text-white" size={24} />
          </div>
          <p className="text-sm font-medium text-slate-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-auto min-h-[calc(100vh-64px)]">
          <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
            {children}
          </div>
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