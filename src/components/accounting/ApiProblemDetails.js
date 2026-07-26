'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from './utils';
import { useAccountingWorkspace } from '@/lib/accounting/AccountingWorkspaceContext';

const DEFAULT_LABELS = {
  status: 'Status',
  instance: 'Endpoint',
  correlationId: 'Correlation ID',
  exceptionType: 'Exception type',
  exceptionMessage: 'Exception message',
  innerExceptionMessage: 'Inner exception',
  validation: 'Validation errors',
  errorCode: 'Error code',
  errorDescription: 'Rule description',
  technical: 'Full technical details',
};

function problemData(error, fallback) {
  const payload = error?.fullError && typeof error.fullError === 'object' ? error.fullError : {};
  const detail = payload.detail || error?.errorDescription || error?.detail || error?.message || fallback;
  const ruleError = payload.error && typeof payload.error === 'object' ? payload.error : {};

  const validationErrors = Object.entries(payload.errors || {}).flatMap(([field, messages]) =>
    (Array.isArray(messages) ? messages : [messages]).map((message) => `${field}: ${message}`),
  );

  return {
    title: payload.title || fallback,
    detail,
    errorCode: ruleError.code,
    errorDescription: ruleError.description,
    status: payload.status ?? error?.status,
    instance: payload.instance,
    correlationId: payload.correlationId,
    exceptionType: payload.exceptionType,
    exceptionMessage: payload.exceptionMessage,
    innerExceptionMessage: payload.innerExceptionMessage,
    validationErrors,
    raw: Object.keys(payload).length > 0 ? payload : {
      title: fallback,
      detail,
      status: error?.status,
    },
  };
}

export default function ApiProblemDetails({ error, fallback, labels, className }) {
  const { isMaster } = useAccountingWorkspace();
  const copy = { ...DEFAULT_LABELS, ...labels };
  const problem = problemData(error, fallback);
  const fields = [
    [copy.errorCode, problem.errorCode],
    [copy.errorDescription, problem.errorDescription],
    [copy.status, problem.status],
    [copy.instance, problem.instance],
    [copy.correlationId, problem.correlationId],
    [copy.exceptionType, problem.exceptionType],
    [copy.exceptionMessage, problem.exceptionMessage],
    [copy.innerExceptionMessage, problem.innerExceptionMessage],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '');
  const friendlyDetail = /idempotency|correlation|posting profile/i.test(problem.detail)
    ? 'The financial setup is incomplete. Ask a Master user to review the accounting setup.'
    : problem.detail;

  return (
    <section className={cn('rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-slate-700', className)} role="alert">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 shrink-0 text-red-700" aria-hidden="true" size={21} />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-red-950">{problem.title}</h3>
          <p className="mt-1 leading-6 text-red-900">{friendlyDetail}</p>
          {isMaster && fields.length > 0 && (
            <dl className="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-3">
              {fields.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-bold text-red-800">{label}</dt>
                  <dd className="mt-0.5 break-all font-mono text-xs text-slate-800" dir="ltr">{String(value)}</dd>
                </div>
              ))}
            </dl>
          )}
          {problem.validationErrors.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-bold text-red-800">{copy.validation}</h4>
              <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-red-900">
                {problem.validationErrors.map((message, index) => <li key={`${message}-${index}`} dir="auto">{message}</li>)}
              </ul>
            </div>
          )}
          {isMaster && <details className="mt-3">
            <summary className="cursor-pointer font-semibold text-red-900 underline-offset-2 hover:underline">{copy.technical}</summary>
            <pre className="mt-2 max-h-72 overflow-auto rounded-lg border border-red-100 bg-white p-3 text-xs leading-5 text-slate-800" dir="ltr">
              {JSON.stringify(problem.raw, null, 2)}
            </pre>
          </details>}
        </div>
      </div>
    </section>
  );
}
