'use client';

import { AlertTriangle, CheckCircle2, CircleDot, Clock3, RotateCcw, XCircle } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { accountingT } from '@/lib/accounting/i18n';
import { cn } from './utils';

const statusConfig = {
  draft: { tone: 'neutral', icon: CircleDot },
  inactive: { tone: 'neutral', icon: CircleDot },
  received: { tone: 'info', icon: Clock3 },
  parsing: { tone: 'info', icon: Clock3 },
  pending: { tone: 'warning', icon: Clock3 },
  needsresolution: { tone: 'warning', icon: AlertTriangle },
  calculated: { tone: 'info', icon: CheckCircle2 },
  reconciled: { tone: 'success', icon: CheckCircle2 },
  active: { tone: 'success', icon: CheckCircle2 },
  accepted: { tone: 'success', icon: CheckCircle2 },
  resolved: { tone: 'success', icon: CheckCircle2 },
  submitted: { tone: 'warning', icon: Clock3 },
  prepared: { tone: 'warning', icon: Clock3 },
  exported: { tone: 'info', icon: CheckCircle2 },
  approved: { tone: 'success', icon: CheckCircle2 },
  confirmed: { tone: 'success', icon: CheckCircle2 },
  posted: { tone: 'success', icon: CheckCircle2 },
  paid: { tone: 'success', icon: CheckCircle2 },
  partiallypaid: { tone: 'warning', icon: Clock3 },
  rejected: { tone: 'danger', icon: XCircle },
  failed: { tone: 'danger', icon: XCircle },
  reversed: { tone: 'danger', icon: RotateCcw },
  waived: { tone: 'neutral', icon: CircleDot },
  open: { tone: 'success', icon: CircleDot },
  softclosed: { tone: 'warning', icon: AlertTriangle },
  closed: { tone: 'neutral', icon: CircleDot },
};

function normalizeStatus(status) {
  return String(status ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function fallbackLabel(status) {
  return String(status ?? '—')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ');
}

export default function StatusBadge({ status, label, tone, icon: CustomIcon, showIcon = true, className }) {
  const { locale } = useLanguage();
  const normalized = normalizeStatus(status);
  const config = statusConfig[normalized] ?? { tone: 'neutral', icon: CircleDot };
  const Icon = CustomIcon ?? config.icon;
  const translated = accountingT(locale, `status.${normalized}`);
  const visibleLabel = label ?? (translated === `status.${normalized}` ? fallbackLabel(status) : translated);

  return (
    <span className={cn('accounting-status', `accounting-status--${tone ?? config.tone}`, className)}>
      {showIcon && <Icon aria-hidden="true" size={13} strokeWidth={2.2} />}
      <span>{visibleLabel}</span>
    </span>
  );
}
