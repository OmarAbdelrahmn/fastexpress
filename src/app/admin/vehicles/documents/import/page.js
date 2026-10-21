'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileSpreadsheet, ShieldAlert } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';
import Button from '@/components/Ui/Button';
import VehicleDocumentsImportView from '@/components/vehicles/VehicleDocumentsImportView';
import { TokenManager } from '@/lib/auth/tokenManager';

export default function VehicleDocumentsImportPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    const user = TokenManager.getUserFromToken() || {};
    const rawRoles =
      user.roles ??
      user.role ??
      user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
      [];
    const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
    const authorized = roles.includes('Master') || roles.includes('Admin');
    setIsAuthorized(authorized);
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 shadow-inner">
          <ShieldAlert size={36} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">غير مصرح بالوصول</h2>
        <p className="text-slate-500 max-w-md mb-6 leading-relaxed">
          يتطلب هذا القسم صلاحيات مسؤول (Admin) أو مشرف عام (Master) للاطلاع على وثائق المركبات واستيرادها.
        </p>
        <Button onClick={() => router.push('/admin/vehicles/reminders')} variant="secondary">
          العودة إلى وثائق المركبات
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12" dir="rtl">
      <PageHeader
        title="استيراد وتحديث تواريخ رخص السير والفحص الدوري"
        subtitle="تحديث مجمّع لتواريخ الاستمارة والفحص بالرقم التسلسلي مع دعم التواريخ الهجرية والميلادية والمعاينة المسبقة"
        icon={FileSpreadsheet}
      />

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <VehicleDocumentsImportView
          isModal={false}
          onSuccess={() => {
            // Optional: navigate or keep viewing results
          }}
        />
      </div>
    </div>
  );
}
