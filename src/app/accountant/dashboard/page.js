"use client";

import { TokenManager } from '@/lib/auth/tokenManager';
import { BarChart3, FileSpreadsheet, ReceiptText, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ACCOUNTANT_AREAS = [
  {
    title: 'Bills',
    description: 'Review maintenance bills and supplier invoices.',
    icon: ReceiptText,
  },
  {
    title: 'Costs',
    description: 'Track vehicle, rider, housing, spare part, and accessory costs.',
    icon: BarChart3,
  },
  {
    title: 'Wallet Reports',
    description: 'Review wallet imports and finance-related platform reports.',
    icon: Wallet,
  },
  {
    title: 'Exports',
    description: 'Prepare Excel and PDF finance exports from approved data.',
    icon: FileSpreadsheet,
  },
];

export default function AccountantDashboardPage() {
  const router = useRouter();

  const logout = () => {
    TokenManager.clearToken();
    router.push('/accountant/login');
  };

  return (
    <main className="min-h-screen bg-slate-50" dir="rtl">
      <header className="bg-slate-950 text-white px-6 py-5 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">لوحة المحاسب</h1>
            <p className="text-sm text-slate-300 mt-1">Express Service Finance</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold transition"
          >
            تسجيل الخروج
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {ACCOUNTANT_AREAS.map((area) => {
            const Icon = area.icon;
            return (
              <article key={area.title} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <Icon size={22} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">{area.title}</h2>
                <p className="text-sm text-slate-600 leading-6">{area.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
