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
<div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-600" dir="rtl">
      <Header />
      <div className="flex">
        
        <Sidebar  />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  );
}