'use client';

import Link from 'next/link';
import { Check, CircleAlert, CircleDot } from 'lucide-react';
import { WORKFLOW_STAGES } from '@/lib/accounting/workflow';
import { cn } from './utils';

export default function WorkflowProgress({ currentStage = 0, action, isRtl = false }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="accounting-workflow-title">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 id="accounting-workflow-title" className="text-base font-black text-slate-950">
          {isRtl ? 'خطوات العمل لهذا الشهر' : 'This month’s work'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {isRtl ? 'اتبع الخطوات بالترتيب؛ سيظهر لك الإجراء التالي المطلوب.' : 'Follow the steps in order. Your next required action is highlighted.'}
        </p>
      </div>
      <ol className="grid divide-y divide-slate-100 sm:grid-cols-5 sm:divide-x sm:divide-y-0 rtl:sm:divide-x-reverse">
        {WORKFLOW_STAGES.map((stage, index) => {
          const state = index < currentStage ? 'complete' : index === currentStage ? 'current' : 'upcoming';
          const Icon = state === 'complete' ? Check : state === 'current' ? CircleDot : CircleAlert;
          return (
            <li key={stage.id} className={cn('min-w-0 px-4 py-4', state === 'current' && 'bg-blue-50/70')}>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-black',
                  state === 'complete' && 'bg-emerald-600 text-white',
                  state === 'current' && 'bg-blue-700 text-white',
                  state === 'upcoming' && 'bg-slate-100 text-slate-500',
                )}>
                  <Icon size={15} aria-hidden="true" />
                </span>
                <span className="text-xs font-bold text-slate-500">{index + 1}</span>
              </div>
              <p className="mt-2 text-sm font-bold text-slate-900">{isRtl ? stage.ar : stage.en}</p>
              <p className="mt-1 text-xs text-slate-500">
                {state === 'complete' ? (isRtl ? 'مكتملة' : 'Complete') : state === 'current' ? (isRtl ? 'الإجراء التالي' : 'Next action') : (isRtl ? 'لاحقاً' : 'Later')}
              </p>
            </li>
          );
        })}
      </ol>
      {action && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <p className="font-semibold text-slate-800">{isRtl ? 'الإجراء المقترح:' : 'Recommended next action:'} <span className="font-black">{isRtl ? action.ar : action.en}</span></p>
          <Link href={action.href} className="accounting-button accounting-button--primary accounting-button--md">
            {isRtl ? 'متابعة' : 'Continue'}
          </Link>
        </div>
      )}
    </section>
  );
}
