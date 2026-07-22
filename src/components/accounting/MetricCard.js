'use client';

import { ArrowDownLeft, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from './utils';

const toneClasses = {
  blue: 'accounting-metric--blue',
  gold: 'accounting-metric--gold',
  green: 'accounting-metric--green',
  red: 'accounting-metric--red',
  slate: 'accounting-metric--slate',
  success: 'accounting-metric--green',
  danger: 'accounting-metric--red',
  warning: 'accounting-metric--gold',
  neutral: 'accounting-metric--slate',
};

export default function MetricCard({
  label,
  value,
  caption,
  trend,
  trendDirection = 'neutral',
  icon: Icon,
  tone = 'blue',
  loading = false,
  className,
}) {
  const TrendIcon = trendDirection === 'up'
    ? ArrowUpRight
    : trendDirection === 'down'
      ? ArrowDownLeft
      : Minus;

  return (
    <article className={cn('accounting-metric', toneClasses[tone] ?? toneClasses.blue, className)} aria-busy={loading || undefined}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          {loading ? (
            <div className="mt-3 h-8 w-28 animate-pulse rounded-md bg-slate-200" aria-label="Loading" />
          ) : (
            <p className="mt-2 truncate text-2xl font-black tabular-nums text-slate-950">{value ?? '—'}</p>
          )}
        </div>
        {Icon && (
          <span className="accounting-metric__icon" aria-hidden="true">
            <Icon size={20} strokeWidth={1.8} />
          </span>
        )}
      </div>

      {(trend !== undefined || caption) && !loading && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {trend !== undefined && (
            <span className={cn('inline-flex items-center gap-1 font-bold tabular-nums', {
              up: 'text-emerald-700',
              down: 'text-red-700',
              neutral: 'text-slate-600',
            }[trendDirection] ?? 'text-slate-600')}>
              <TrendIcon aria-hidden="true" size={14} />
              {trend}
            </span>
          )}
          {caption && <span className="text-slate-500">{caption}</span>}
        </div>
      )}
    </article>
  );
}
