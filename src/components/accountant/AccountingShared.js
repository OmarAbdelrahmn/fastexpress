'use client';

import { accountingService } from '@/lib/api/accountingService';
import { useEffect, useMemo, useState } from 'react';

export const currentYear = new Date().getFullYear();
export const currentMonth = new Date().getMonth() + 1;

export const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;

export const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('ar-SA', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const normalizeList = (value) => (Array.isArray(value) ? value : value ? [value] : []);

export const companyIdOf = (company) => company?.id ?? company?.companyId ?? company?.value ?? '';

export const companyNameOf = (company) =>
  company?.name ?? company?.companyName ?? company?.displayName ?? company?.label ?? `شركة ${companyIdOf(company)}`;

export function useAccountingCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await accountingService.lookups.getCompanies();
        if (alive) {
          setCompanies(normalizeList(data).filter((company) => companyIdOf(company) !== ''));
          setError(null);
        }
      } catch (err) {
        if (alive) setError(err);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const firstCompanyId = useMemo(() => {
    const id = companyIdOf(companies[0]);
    return id === '' ? '' : String(id);
  }, [companies]);

  return { companies, firstCompanyId, loading, error };
}

export function CompanySelect({
  label = 'الشركة',
  name = 'companyId',
  value,
  onChange,
  companies,
  loading = false,
  required = false,
  allowEmpty = false,
  placeholder = 'اختر الشركة',
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="mr-1 text-red-500">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={loading || !companies?.length}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1b428e] disabled:bg-gray-100"
      >
        {(allowEmpty || !value) && <option value="">{loading ? 'جاري تحميل الشركات...' : placeholder}</option>}
        {normalizeList(companies).map((company) => {
          const id = companyIdOf(company);
          return (
            <option key={id} value={id}>
              {companyNameOf(company)}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export function StatBox({ label, value, tone = 'slate' }) {
  const tones = {
    slate: 'border-slate-200 text-slate-950',
    blue: 'border-blue-100 text-blue-700',
    green: 'border-emerald-100 text-emerald-700',
    red: 'border-red-100 text-red-700',
  };

  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${tones[tone] || tones.slate}`}>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
