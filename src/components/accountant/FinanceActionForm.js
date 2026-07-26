'use client';

import {
  ActionButton,
  ErrorState,
  FormField,
  Panel,
  StatusBadge,
} from '@/components/accounting/AccountingUi';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { CheckCircle2, ChevronDown, Send } from 'lucide-react';
import { useMemo, useState } from 'react';

const controlClass =
  'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 disabled:cursor-not-allowed disabled:bg-slate-100';

const copy = {
  ar: {
    send: 'تنفيذ العملية',
    sending: 'جاري التنفيذ…',
    success: 'اكتملت العملية بنجاح',
    details: 'عرض الاستجابة الكاملة',
    jsonError: 'يجب أن يحتوي الحقل على JSON صالح.',
    addLine: 'إضافة سطر',
    removeLine: 'حذف السطر',
    requestError: 'تعذر تنفيذ العملية.',
  },
  en: {
    send: 'Run action',
    sending: 'Running…',
    success: 'Action completed successfully',
    details: 'View full response',
    jsonError: 'This field must contain valid JSON.',
    addLine: 'Add line',
    removeLine: 'Remove line',
    requestError: 'The action could not be completed.',
  },
};

function resolveText(value, isRtl) {
  if (typeof value === 'string') return value;
  return isRtl ? value?.ar : value?.en;
}

function clientRequestKey() {
  return globalThis.crypto?.randomUUID?.() || `accounting-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isTechnicalField(field) {
  return field.technical || ['idempotencyKey', 'correlationId'].includes(field.name);
}

function parseStructuredValue(value) {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return []; }
}

function displayKey(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/Id$/i, '')
    .replace(/^./, (letter) => letter.toUpperCase());
}

function jsonValue(value, key = '') {
  if (Array.isArray(value)) return value.map((item) => jsonValue(item));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([name, item]) => [name, jsonValue(item, name)]));
  if (value === '') return /id$|amount|quantity|price|rate|months/i.test(key) ? null : value;
  if (/id$|amount|quantity|price|rate|months/i.test(key) && value !== null && value !== undefined && value !== '') return Number(value);
  return value;
}

function StructuredJsonField({ field, value, onChange, busy, isRtl, text }) {
  const parsed = value ?? [];
  const isList = Array.isArray(parsed);
  const prototype = isList ? (parsed[0] ?? parseStructuredValue(field.defaultValue)?.[0] ?? {}) : parsed;
  const columns = field.columns ?? Object.keys(prototype || {}).map((name) => ({ name, label: displayKey(name) }));
  const updateRow = (index, name, next) => onChange(parsed.map((row, rowIndex) => rowIndex === index ? { ...row, [name]: next } : row));

  if (!isList) {
    const entries = Object.entries(parsed || {});
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        {entries.map(([name, item]) => (
          <FormField key={name} label={resolveText(field.jsonLabels?.[name], isRtl) || displayKey(name)}>
            <input className={controlClass} value={item ?? ''} disabled={busy} onChange={(event) => onChange({ ...parsed, [name]: event.target.value })} />
          </FormField>
        ))}
        {!entries.length && <p className="text-sm text-slate-600">{isRtl ? 'لا توجد تفاصيل مطلوبة.' : 'No additional details are required.'}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {parsed.map((row, index) => (
        <fieldset key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
          <legend className="sr-only">{`${resolveText(field.label, isRtl)} ${index + 1}`}</legend>
          {columns.map((column) => (
            <FormField key={column.name} label={resolveText(column.label, isRtl) || displayKey(column.name)} required={column.required}>
              <input className={controlClass} type={column.type || (/amount|quantity|price|rate|id$/i.test(column.name) ? 'number' : 'text')} min={column.min} step={column.step || (/amount|quantity|price|rate/i.test(column.name) ? '0.01' : undefined)} value={row[column.name] ?? ''} disabled={busy} onChange={(event) => updateRow(index, column.name, event.target.value)} />
            </FormField>
          ))}
          <button type="button" className="self-end rounded-lg px-2 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" disabled={busy || parsed.length === 1} onClick={() => onChange(parsed.filter((_, rowIndex) => rowIndex !== index))}>{text.removeLine}</button>
        </fieldset>
      ))}
      <button type="button" className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50" disabled={busy} onClick={() => onChange([...parsed, Object.fromEntries(columns.map((column) => [column.name, column.defaultValue ?? '']))])}>{text.addLine}</button>
    </div>
  );
}

function initialValues(fields, suppliedValues) {
  return Object.fromEntries(
    fields.map((field) => [
      field.name,
      suppliedValues?.[field.name] ?? ((field.name === 'idempotencyKey' || field.name === 'correlationId') ? (field.defaultValue || clientRequestKey()) : field.type === 'json' ? parseStructuredValue(field.defaultValue ?? '[]') : field.defaultValue ?? (field.type === 'checkbox' ? false : '')),
    ]),
  );
}

function normalizeValues(fields, values) {
  const payload = {};
  for (const field of fields) {
    const raw = values[field.name];
    if ((raw === '' || raw === null || raw === undefined) && !field.keepEmpty) continue;
    if (field.type === 'number') payload[field.name] = Number(raw);
    else if (field.type === 'json') payload[field.name] = jsonValue(raw);
    else payload[field.name] = raw;
  }
  return payload;
}

function ResponseSummary({ result, message, isRtl }) {
  if (result === undefined) return null;
  const identifier = result?.number || result?.runNumber || result?.batchNumber || result?.code || result?.id;
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950" role="status" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2 font-semibold">
        <CheckCircle2 size={19} aria-hidden="true" />
        <span>{message}</span>
        {result?.status !== undefined && <StatusBadge status={result.status} />}
      </div>
      {identifier && <p className="mt-2 font-mono text-xs" dir="ltr">{identifier}</p>}
      {result !== null && typeof result === 'object' && (
        <details className="mt-3 text-sm">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-medium">
            <ChevronDown size={16} aria-hidden="true" />
            {isRtl ? copy.ar.details : copy.en.details}
          </summary>
          <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-slate-950 p-3 text-start text-xs leading-6 text-slate-100" dir="ltr">
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

export default function FinanceActionForm({
  title,
  description,
  fields,
  initialValue,
  submitLabel,
  onSubmit,
  afterSuccess,
}) {
  const { isRtl } = useAccountingI18n();
  const text = isRtl ? copy.ar : copy.en;
  const seed = useMemo(() => initialValues(fields, initialValue), [fields, initialValue]);
  const [values, setValues] = useState(seed);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(undefined);
  const visibleFields = fields.filter((field) => !isTechnicalField(field));

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setResult(undefined);
    try {
      const payload = normalizeValues(fields, values);
      const response = await onSubmit(payload);
      setResult(response ?? null);
      afterSuccess?.(response);
    } catch (requestError) {
      const jsonFailure = requestError instanceof SyntaxError;
      setError(
        jsonFailure
          ? text.jsonError
          : requestError?.errorDescription ||
            requestError?.fullError?.error?.description ||
            requestError?.fullError?.detail ||
            requestError?.message ||
            text.requestError,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title={resolveText(title, isRtl)} description={resolveText(description, isRtl)}>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
        {visibleFields.map((field) => {
          const label = resolveText(field.label, isRtl);
          const help = resolveText(field.help, isRtl);
          const span = field.full ? 'md:col-span-2' : '';
          const common = {
            id: field.name,
            name: field.name,
            required: field.required,
            disabled: busy || field.disabled,
            value: values[field.name],
            onChange: (event) => {
              const nextValue = field.type === 'checkbox' ? event.target.checked : event.target.value;
              setValues((current) => ({ ...current, [field.name]: nextValue }));
            },
          };
          return (
            <div className={span} key={field.name}>
              <FormField label={label} help={help} required={field.required}>
                {field.type === 'select' ? (
                  <select className={controlClass} {...common}>
                    {field.placeholder && <option value="">{resolveText(field.placeholder, isRtl)}</option>}
                    {(field.options || []).map((option) => (
                      <option key={String(option.value)} value={option.value}>
                        {resolveText(option.label, isRtl)}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'lineItems' ? (
                  <div className="space-y-3">
                    {(values[field.name] || []).map((line, index) => (
                      <div key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                        {(field.columns || []).map((column) => <FormField key={column.name} label={resolveText(column.label, isRtl)} required={column.required}><input className={controlClass} type={column.type || 'text'} min={column.min} step={column.step} dir={column.dir} value={line[column.name] ?? ''} onChange={(event) => setValues((current) => ({ ...current, [field.name]: current[field.name].map((item, itemIndex) => itemIndex === index ? { ...item, [column.name]: event.target.value } : item) }))} /></FormField>)}
                        <button type="button" className="self-end rounded-lg px-2 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" disabled={busy || (values[field.name] || []).length === 1} onClick={() => setValues((current) => ({ ...current, [field.name]: current[field.name].filter((_, itemIndex) => itemIndex !== index) }))}>{text.removeLine}</button>
                      </div>
                    ))}
                    <button type="button" className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50" disabled={busy} onClick={() => setValues((current) => ({ ...current, [field.name]: [...(current[field.name] || []), Object.fromEntries((field.columns || []).map((column) => [column.name, column.defaultValue ?? '']))] }))}>{text.addLine}</button>
                  </div>
                ) : field.type === 'json' ? (
                  <StructuredJsonField field={field} value={values[field.name]} busy={busy} isRtl={isRtl} text={text} onChange={(next) => setValues((current) => ({ ...current, [field.name]: next }))} />
                ) : field.type === 'textarea' ? (
                  <textarea className={`${controlClass} min-h-28 resize-y`} {...common} />
                ) : field.type === 'checkbox' ? (
                  <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium">
                    <input className="size-4 accent-blue-700" type="checkbox" {...common} checked={Boolean(values[field.name])} value={undefined} />
                    {label}
                  </label>
                ) : (
                  <input
                    className={controlClass}
                    type={field.type || 'text'}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    placeholder={resolveText(field.placeholder, isRtl)}
                    dir={field.dir}
                    {...common}
                  />
                )}
              </FormField>
            </div>
          );
        })}
        <div className="md:col-span-2 flex flex-col gap-3">
          {error && <ErrorState message={error} compact />}
          <ResponseSummary result={result} message={text.success} isRtl={isRtl} />
          <div className="flex justify-end">
            <ActionButton type="submit" icon={Send} loading={busy} disabled={busy}>
              {busy ? text.sending : resolveText(submitLabel, isRtl) || text.send}
            </ActionButton>
          </div>
        </div>
      </form>
    </Panel>
  );
}

export function FinanceTabs({ tabs, activeId, onChange, label }) {
  const { isRtl } = useAccountingI18n();
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-1" role="tablist" aria-label={resolveText(label, isRtl)}>
      <div className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const active = tab.id === activeId;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                active ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              {Icon && <Icon size={16} aria-hidden="true" />}
              {resolveText(tab.label, isRtl)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
