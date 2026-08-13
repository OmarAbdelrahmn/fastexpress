'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, ArrowLeftRight, CalendarClock, ChevronLeft, ClipboardList, Filter, Loader2,
  Menu, RefreshCw, Search, ShieldCheck, SlidersHorizontal, X,
} from 'lucide-react';
import { TokenManager } from '@/lib/auth/tokenManager';
import { SystemAuditService } from '@/lib/api/systemAuditService';
import { useLanguage } from '@/lib/context/LanguageContext';

const ACTIONS = ['Create', 'Update', 'Delete'];
const PAGE_SIZES = [50, 100, 200, 500];

const toLocalInput = (date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
const defaultFilters = () => {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 10);
  return { fromUtc: toLocalInput(from), toUtc: toLocalInput(now), entityType: '', entityKey: '', action: '', actorUserId: '', operationId: '', source: '' };
};

function isMasterUser() {
  const user = TokenManager.getUserFromToken() || {};
  const raw = user.roles ?? user.role ?? user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? [];
  return (Array.isArray(raw) ? raw : [raw]).some((role) => String(role).toLowerCase() === 'master');
}

function requestParams(filters, page, pageSize = 50) {
  const params = { page: String(page), pageSize: String(pageSize) };
  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;
    params[key] = key === 'fromUtc' || key === 'toUtc' ? new Date(value).toISOString() : value.trim();
  });
  return params;
}

function formatDate(value, locale) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function actionClass(action) {
  return { Create: 'border-emerald-200 bg-emerald-50 text-emerald-700', Update: 'border-blue-200 bg-blue-50 text-blue-700', Delete: 'border-rose-200 bg-rose-50 text-rose-700' }[action] || 'border-slate-200 bg-slate-50 text-slate-700';
}

function actionLabel(action, english) {
  if (english) return action || '—';
  return { Create: 'إنشاء', Update: 'تحديث', Delete: 'حذف' }[action] || action || '—';
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== '';
}

function displayAuditValue(value) {
  if (!hasValue(value)) return '—';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try { return JSON.stringify(value); } catch { return String(value); }
}

function valuesMatch(before, after) {
  try { return JSON.stringify(before) === JSON.stringify(after); } catch { return before === after; }
}

function AuditDetail({ label, value, mono = false }) {
  if (!hasValue(value)) return null;
  return <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5"><dt className="text-[11px] font-bold text-slate-500">{label}</dt><dd dir="auto" className={`mt-1 break-words text-sm font-medium text-slate-800 ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd></div>;
}

function ChangeComparison({ auditEvent, text }) {
  const fields = Array.from(new Set([...(auditEvent.changedFields || []), ...Object.keys(auditEvent.oldValues || {}), ...Object.keys(auditEvent.newValues || {})]));
  if (!fields.length) return null;

  return <section className="mt-5"><div className="mb-3 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><ArrowLeftRight size={16} /></span><div><h3 className="text-sm font-extrabold text-slate-900">{text.valueChanges}</h3><p className="text-xs text-slate-500">{text.valueChangesHelp}</p></div></div><div className="space-y-2">{fields.map((field) => {
    const before = auditEvent.oldValues?.[field];
    const after = auditEvent.newValues?.[field];
    const isSame = valuesMatch(before, after);
    return <article key={field} className={`rounded-xl border p-3 ${isSame ? 'border-slate-200 bg-slate-50/60' : 'border-blue-200 bg-blue-50/35'}`}><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><code className="rounded bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow-sm">{field}</code>{isSame && <span className="text-[11px] font-semibold text-slate-500">{text.noVisibleDifference}</span>}</div><div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch"><div className="rounded-lg border border-slate-200 bg-white px-3 py-2"><p className="text-[11px] font-bold text-slate-500">{text.before}</p><p dir="auto" className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-slate-800">{displayAuditValue(before)}</p></div><ArrowLeftRight className="mx-auto my-1 text-slate-400 sm:my-auto" size={17} /><div className="rounded-lg border border-blue-200 bg-white px-3 py-2"><p className="text-[11px] font-bold text-blue-600">{text.after}</p><p dir="auto" className="mt-1 whitespace-pre-wrap break-words text-sm font-bold text-slate-900">{displayAuditValue(after)}</p></div></div></article>;
  })}</div></section>;
}

export default function SystemAuditPage() {
  const { locale } = useLanguage();
  const english = locale === 'en';
  const text = useMemo(() => english ? {
    title: 'System audit', subtitle: 'Trace every protected change across the system.', filters: 'Filters', apply: 'Apply filters', clear: 'Clear', refresh: 'Refresh',
    from: 'From date and time', to: 'To date and time', entityType: 'Entity type', entityKey: 'Entity key', action: 'Action', actor: 'Actor user ID', operation: 'Operation ID', source: 'Source',
    events: 'events', loading: 'Loading audit events…', empty: 'No audit events match these filters.', loadError: 'Could not load audit events.', access: 'System Audit is available to Master users only.',
    occurred: 'Occurred', actorName: 'Actor', entity: 'Entity', changed: 'Changed fields', details: 'Details', close: 'Close', previous: 'Previous', next: 'Next', page: 'Page',
    eventDetails: 'Audit event details', operationName: 'Operation', correlation: 'Correlation ID', method: 'HTTP method', path: 'Request path', ip: 'IP address', scopeType: 'Scope type', scopeBefore: 'Scope before', scopeAfter: 'Scope after', active: 'active filters', allActions: 'All actions', recent: 'Showing the most recent events first.', valueChanges: 'Recorded field changes', valueChangesHelp: 'Before and after values for every returned field.', before: 'Previous value', after: 'New value', noVisibleDifference: 'Same displayed value',
  } : {
    title: 'سجل تدقيق النظام', subtitle: 'تتبّع التغييرات المحمية في جميع أجزاء النظام.', filters: 'التصفية', apply: 'تطبيق التصفية', clear: 'مسح', refresh: 'تحديث',
    from: 'من تاريخ ووقت', to: 'إلى تاريخ ووقت', entityType: 'نوع الكيان', entityKey: 'مفتاح الكيان', action: 'الإجراء', actor: 'معرّف المستخدم المنفذ', operation: 'معرّف العملية', source: 'المصدر',
    events: 'حدثاً', loading: 'جارٍ تحميل أحداث التدقيق…', empty: 'لا توجد أحداث تدقيق مطابقة للتصفية.', loadError: 'تعذر تحميل أحداث التدقيق.', access: 'سجل تدقيق النظام متاح لدور Master فقط.',
    occurred: 'وقت الحدث', actorName: 'المنفذ', entity: 'الكيان', changed: 'الحقول المتغيرة', details: 'التفاصيل', close: 'إغلاق', previous: 'السابق', next: 'التالي', page: 'الصفحة',
    eventDetails: 'تفاصيل حدث التدقيق', operationName: 'العملية', correlation: 'معرّف الترابط', method: 'طريقة HTTP', path: 'مسار الطلب', ip: 'عنوان IP', scopeType: 'نوع النطاق', scopeBefore: 'النطاق قبل', scopeAfter: 'النطاق بعد', active: 'فلاتر مفعلة', allActions: 'كل الإجراءات', recent: 'عرض أحدث الأحداث أولاً.', valueChanges: 'تغييرات الحقول المسجلة', valueChangesHelp: 'القيمة السابقة والجديدة لكل حقل أعاده النظام.', before: 'القيمة السابقة', after: 'القيمة الجديدة', noVisibleDifference: 'لا يوجد فرق ظاهر',
  }, [english]);

  const [master] = useState(isMasterUser);
  const [filters, setFilters] = useState(defaultFilters);
  const [draft, setDraft] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [result, setResult] = useState({ totalCount: 0, page: 1, pageSize: 50, items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [eventDetail, setEventDetail] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const load = useCallback(async (targetPage = page, activeFilters = filters, size = pageSize) => {
    if (!master) return;
    setLoading(true); setError('');
    try {
      const response = await SystemAuditService.list(requestParams(activeFilters, targetPage, size));
      setResult({ totalCount: response?.totalCount ?? 0, page: response?.page ?? targetPage, pageSize: response?.pageSize ?? size, items: Array.isArray(response?.items) ? response.items : [] });
    } catch (requestError) { setError(requestError.message || text.loadError); } finally { setLoading(false); }
  }, [filters, master, page, pageSize, text.loadError]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === 'Escape') { setDrawerOpen(false); setEventDetail(null); } };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const apply = (event) => { event.preventDefault(); setFilters(draft); setPage(1); setDrawerOpen(false); load(1, draft); };
  const clear = () => { const next = defaultFilters(); setDraft(next); setFilters(next); setPage(1); load(1, next); };
  const showDetails = async (auditEvent) => {
    setEventDetail(auditEvent); setDetailsLoading(true); setDetailsError('');
    try {
      const response = await SystemAuditService.getById(auditEvent.id);
      setEventDetail(response);
    } catch (requestError) { setDetailsError(requestError.message || text.loadError); } finally { setDetailsLoading(false); }
  };
  const totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));
  const filterCount = Object.values(filters).filter(Boolean).length;

  const fields = <>
    <label className="audit-label">{text.from}<input type="datetime-local" value={draft.fromUtc} onChange={(event) => updateDraft('fromUtc', event.target.value)} className="audit-control" /></label>
    <label className="audit-label">{text.to}<input type="datetime-local" value={draft.toUtc} onChange={(event) => updateDraft('toUtc', event.target.value)} className="audit-control" /></label>
    <label className="audit-label">{text.entityType}<input value={draft.entityType} onChange={(event) => updateDraft('entityType', event.target.value)} placeholder="Domain.Entities.Spare.SparePart" className="audit-control" /></label>
    <label className="audit-label">{text.entityKey}<input value={draft.entityKey} onChange={(event) => updateDraft('entityKey', event.target.value)} placeholder="Id=14" className="audit-control" /></label>
    <label className="audit-label">{text.action}<select value={draft.action} onChange={(event) => updateDraft('action', event.target.value)} className="audit-control"><option value="">{text.allActions}</option>{ACTIONS.map((action) => <option key={action} value={action}>{actionLabel(action, english)}</option>)}</select></label>
    <label className="audit-label">{text.actor}<input value={draft.actorUserId} onChange={(event) => updateDraft('actorUserId', event.target.value)} className="audit-control" /></label>
    <label className="audit-label">{text.operation}<input value={draft.operationId} onChange={(event) => updateDraft('operationId', event.target.value)} className="audit-control" /></label>
    <label className="audit-label">{text.source}<input value={draft.source} onChange={(event) => updateDraft('source', event.target.value)} placeholder="Http" className="audit-control" /></label>
  </>;

  if (!master) return <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-10" dir={english ? 'ltr' : 'rtl'}><main className="mx-auto max-w-6xl"><div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800"><ShieldCheck className="mt-0.5 shrink-0" size={20} /><div><h1 className="font-bold">{text.title}</h1><p className="mt-1 text-sm font-semibold">{text.access}</p></div></div></main></div>;

  return <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-10" dir={english ? 'ltr' : 'rtl'}>
    <main className="mx-auto max-w-[1500px] space-y-4">
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm"><ClipboardList size={20} /></span><div className="min-w-0"><h1 className="text-xl font-extrabold tracking-tight text-slate-900">{text.title}</h1><p className="mt-0.5 text-sm text-slate-500">{text.subtitle}</p></div></div>
        <div className="flex shrink-0 flex-wrap gap-2"><button onClick={() => setDrawerOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50" aria-label={text.filters} aria-expanded={drawerOpen}><Menu size={18} />{text.filters}{filterCount > 0 && <span className="rounded-full bg-blue-100 px-1.5 text-xs text-blue-700">{filterCount}</span>}</button><button onClick={() => load()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"><RefreshCw size={17} className={loading ? 'animate-spin' : ''} />{text.refresh}</button></div>
      </section>
      {error && <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="mt-0.5 shrink-0" size={18} /><div><p className="font-bold">{text.loadError}</p><p className="mt-1">{error}</p></div></div>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><CalendarClock size={18} /></div><div><h2 className="font-bold text-slate-900">{result.totalCount.toLocaleString(english ? 'en-GB' : 'ar-SA')} {text.events}</h2><p className="text-xs text-slate-500">{filterCount ? `${filterCount} ${text.active}` : text.recent}</p></div></div><div className="flex flex-wrap items-center gap-3"><div className="flex items-center gap-3"><p className="text-sm text-slate-500">{text.page} {result.page} {english ? 'of' : 'من'} {totalPages}</p><select value={pageSize} onChange={(e) => { const size = Number(e.target.value); setPageSize(size); setPage(1); load(1, filters, size); }} className="audit-control !min-h-8 !py-1 !text-sm !w-auto" aria-label="Page size">{PAGE_SIZES.map(size => <option key={size} value={size}>{size}</option>)}</select></div><div className="flex gap-2"><button disabled={loading || result.page <= 1} onClick={() => { const target = result.page - 1; setPage(target); load(target); }} className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45">{text.previous}</button><button disabled={loading || result.page >= totalPages} onClick={() => { const target = result.page + 1; setPage(target); load(target); }} className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45">{text.next}</button></div><button onClick={() => setDrawerOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"><SlidersHorizontal size={17} />{text.filters}</button></div></div>
        {loading ? <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-slate-500"><Loader2 className="animate-spin text-blue-600" size={30} /><p className="text-sm">{text.loading}</p></div> : result.items.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-5 text-center text-slate-500"><Search size={30} className="text-slate-300" /><p className="text-sm">{text.empty}</p><button onClick={clear} className="text-sm font-bold text-blue-700 hover:text-blue-900">{text.clear}</button></div> : <div className="overflow-x-auto"><table className="min-w-[850px] w-full"><thead className="bg-slate-50 text-xs font-bold text-slate-500"><tr><th className="px-5 py-3 text-start">{text.occurred}</th><th className="px-5 py-3 text-start">{text.actorName}</th><th className="px-5 py-3 text-start">{text.entity}</th><th className="px-5 py-3 text-start">{text.action}</th><th className="px-5 py-3 text-start">{text.changed}</th><th className="px-5 py-3"><span className="sr-only">{text.details}</span></th></tr></thead><tbody className="divide-y divide-slate-100">{result.items.map((item) => <tr key={item.id} className="transition-colors hover:bg-blue-50/40"><td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700">{formatDate(item.occurredAtUtc, locale)}</td><td className="px-5 py-4"><p className="text-sm font-bold text-slate-800">{item.actorName || '—'}</p><p className="mt-0.5 text-xs text-slate-500">{item.actorType}{item.source ? ` · ${item.source}` : ''}</p></td><td className="max-w-64 px-5 py-4"><p className="truncate text-sm font-semibold text-slate-800" title={item.entityDisplayName || item.entityType}>{item.entityDisplayName || item.entityType || '—'}</p><p className="mt-0.5 truncate font-mono text-xs text-slate-500" title={item.entityKey}>{item.entityKey || item.entityType}</p></td><td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${actionClass(item.action)}`}>{actionLabel(item.action, english)}</span></td><td className="max-w-60 px-5 py-4"><div className="flex flex-wrap gap-1">{item.changedFields?.length ? item.changedFields.map((field) => <span key={field} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{field}</span>) : <span className="text-xs text-slate-400">—</span>}</div></td><td className="px-5 py-4 text-end"><button onClick={() => showDetails(item)} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-bold text-blue-700 hover:bg-blue-100">{text.details}<ChevronLeft size={16} className={english ? 'rotate-180' : ''} /></button></td></tr>)}</tbody></table></div>}
      </section>
      {drawerOpen && <div className="fixed inset-0 z-[70]" role="presentation"><button className="absolute inset-0 h-full w-full cursor-default bg-slate-950/35" onClick={() => setDrawerOpen(false)} aria-label={text.close} /><aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label={text.filters}><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div className="flex items-center gap-2"><Filter size={19} className="text-blue-600" /><h2 className="font-bold text-slate-900">{text.filters}</h2></div><button onClick={() => setDrawerOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label={text.close}><X size={20} /></button></div><form onSubmit={apply} className="flex flex-1 flex-col overflow-y-auto"><div className="grid gap-4 p-5">{fields}</div><div className="mt-auto flex gap-3 border-t border-slate-200 bg-white p-5"><button type="button" onClick={clear} className="min-h-11 flex-1 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">{text.clear}</button><button type="submit" className="min-h-11 flex-1 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700">{text.apply}</button></div></form></aside></div>}
      {eventDetail && <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="presentation"><button className="absolute inset-0 h-full w-full cursor-default bg-slate-950/50" onClick={() => setEventDetail(null)} aria-label={text.close} /><section className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label={text.eventDetails}><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div className="flex items-center gap-3"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${actionClass(eventDetail.action)}`}>{actionLabel(eventDetail.action, english)}</span><div><h2 className="font-bold text-slate-900">{eventDetail.entityDisplayName || text.eventDetails}</h2><p className="mt-0.5 text-xs text-slate-500">#{eventDetail.id} · {formatDate(eventDetail.occurredAtUtc, locale)}</p></div></div><button onClick={() => setEventDetail(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label={text.close}><X size={20} /></button></div>{detailsLoading ? <div className="flex min-h-64 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={30} /></div> : detailsError ? <div className="p-5 text-sm text-rose-700">{detailsError}</div> : <div className="overflow-y-auto p-5"><dl className="grid gap-2 sm:grid-cols-2"><AuditDetail label={text.actorName} value={[eventDetail.actorName, eventDetail.actorUserId].filter(Boolean).join(' · ')} /><AuditDetail label={text.entity} value={[eventDetail.entityType, eventDetail.entityKey].filter(Boolean).join(' · ')} /><AuditDetail label={text.scopeType} value={eventDetail.scopeType} /><AuditDetail label={text.scopeBefore} value={eventDetail.scopeBefore} /><AuditDetail label={text.scopeAfter} value={eventDetail.scopeAfter} /><AuditDetail label={text.operationName} value={eventDetail.operationName} /><AuditDetail label={text.correlation} value={eventDetail.correlationId} mono /><AuditDetail label={text.method} value={eventDetail.httpMethod} /><AuditDetail label={text.path} value={eventDetail.requestPath} mono /><AuditDetail label={text.ip} value={eventDetail.ipAddress} mono /></dl><ChangeComparison auditEvent={eventDetail} text={text} /></div>}</section></div>}
      <style jsx>{`.audit-label { display: grid; gap: .4rem; color: #475569; font-size: .78rem; font-weight: 700; } .audit-control { min-height: 2.7rem; width: 100%; border: 1px solid #cbd5e1; border-radius: .65rem; background: #fff; color: #0f172a; padding: .55rem .7rem; font-size: .875rem; outline: none; } .audit-control:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.14); }`}</style>
    </main>
  </div>;
}
