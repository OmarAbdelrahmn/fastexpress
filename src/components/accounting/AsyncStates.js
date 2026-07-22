'use client';

import { AlertTriangle, Inbox, LoaderCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { accountingT } from '@/lib/accounting/i18n';
import ActionButton from './ActionButton';
import { cn } from './utils';

export function LoadingState({ title, description, compact = false, className }) {
  const { locale } = useLanguage();
  return (
    <div className={cn('accounting-state', compact && 'accounting-state--compact', className)} role="status" aria-live="polite">
      <LoaderCircle className="animate-spin text-blue-700" aria-hidden="true" size={compact ? 24 : 32} />
      <div>
        <p className="font-bold text-slate-900">{title ?? accountingT(locale, 'common.loading')}</p>
        {description !== null && (
          <p className="mt-1 text-sm text-slate-500">{description ?? accountingT(locale, 'common.loadingDescription')}</p>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, compact = false, className }) {
  const { locale } = useLanguage();
  return (
    <div className={cn('accounting-state', compact && 'accounting-state--compact', className)}>
      <span className="accounting-state__icon" aria-hidden="true"><Icon size={compact ? 22 : 28} /></span>
      <div>
        <p className="font-bold text-slate-900">{title ?? accountingT(locale, 'common.empty')}</p>
        {description !== null && (
          <p className="mt-1 max-w-lg text-sm leading-6 text-slate-500">{description ?? accountingT(locale, 'common.emptyDescription')}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, description, message, onRetry, retryLabel, compact = false, className }) {
  const { locale } = useLanguage();
  return (
    <div className={cn('accounting-state accounting-state--error', compact && 'accounting-state--compact', className)} role="alert">
      <span className="accounting-state__icon accounting-state__icon--error" aria-hidden="true"><AlertTriangle size={compact ? 22 : 28} /></span>
      <div>
        <p className="font-bold text-slate-900">{title ?? accountingT(locale, 'common.error')}</p>
        {description !== null && (
          <p className="mt-1 max-w-lg text-sm leading-6 text-slate-600">{description ?? message ?? accountingT(locale, 'common.errorDescription')}</p>
        )}
      </div>
      {onRetry && (
        <ActionButton variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
          {retryLabel ?? accountingT(locale, 'common.retry')}
        </ActionButton>
      )}
    </div>
  );
}
