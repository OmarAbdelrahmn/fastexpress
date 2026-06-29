"use client";

import { Banknote, BarChart3, ChevronLeft, CircleDollarSign, FileSpreadsheet, ReceiptText, Scale, UserRound } from 'lucide-react';
import Link from 'next/link';

const ACCOUNTANT_AREAS = [
  {
    title: 'فواتير الشركات',
    description: 'استيراد ملفات فواتير الشركات ومراجعة الإجماليات والاعتماد.',
    href: '/accountant/company-bills',
    icon: FileSpreadsheet,
    background: 'bg-gradient-to-r from-[#2E63E6] to-[#1A44B8]',
  },
  {
    title: 'مالية الشركات',
    description: 'الدخل والتحصيل والمصروفات والربح حسب الشركة والفترة.',
    href: '/accountant/company-finance',
    icon: CircleDollarSign,
    background: 'bg-gradient-to-r from-[#0F766E] to-[#115E59]',
  },
  {
    title: 'الرواتب',
    description: 'توليد رواتب السائقين واعتمادها أو عكسها.',
    href: '/accountant/salaries',
    icon: ReceiptText,
    background: 'bg-gradient-to-r from-[#7C3AED] to-[#5B21B6]',
  },
  {
    title: 'الدفعات',
    description: 'إنشاء دفعات البنك والكاش ومتابعة مبالغ السداد.',
    href: '/accountant/payments',
    icon: Banknote,
    background: 'bg-gradient-to-r from-[#FFC52A] to-[#FF8A3D]',
  },
  {
    title: 'الديون والخصومات',
    description: 'تسجيل البنود المالية على السائقين والبدلات الجماعية.',
    href: '/accountant/financial-items',
    icon: Scale,
    background: 'bg-gradient-to-r from-[#2E63E6] to-[#1A44B8]',
  },
  {
    title: 'السلف والقروض',
    description: 'إنشاء السلف وجدولة أقساط الخصم الشهرية.',
    href: '/accountant/loans',
    icon: CircleDollarSign,
    background: 'bg-gradient-to-r from-[#475569] to-[#1E293B]',
  },
  {
    title: 'حساب السائق',
    description: 'كشف حساب السائق والرصيد والمدفوعات للفترة.',
    href: '/accountant/rider-profile',
    icon: UserRound,
    background: 'bg-gradient-to-r from-[#BE123C] to-[#881337]',
  },
  {
    title: 'تقارير الحسابات',
    description: 'ميزان المراجعة ودفتر الأستاذ العام.',
    href: '/accountant/reports',
    icon: BarChart3,
    background: 'bg-gradient-to-r from-[#334155] to-[#0F172A]',
  },
];

export default function AccountantDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#1E3A8A] px-5 py-6 text-white md:px-7">
          <p className="text-sm font-semibold text-white/80">Express Service</p>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">لوحة تحكم المحاسب</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
            متابعة الموردين والفواتير والمرتجعات من مساحة واحدة بنفس هوية لوحة الإدارة.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ACCOUNTANT_AREAS.map((area) => {
          const Icon = area.icon;
          return (
            <Link
              key={area.title}
              href={area.href}
              className={`group relative block min-h-40 overflow-hidden rounded-xl p-5 text-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${area.background}`}
            >
              <Icon className="absolute -left-4 -bottom-4 text-white/25 transition-transform group-hover:scale-110" size={86} />
              <div className="relative z-10 flex h-full flex-col justify-between gap-5">
                <div>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-white/18 text-white">
                    <Icon size={22} />
                  </div>
                  <h2 className="mb-2 text-lg font-bold">{area.title}</h2>
                  <p className="text-sm leading-6 text-white/85">{area.description}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span>فتح القسم</span>
                  <ChevronLeft size={16} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
