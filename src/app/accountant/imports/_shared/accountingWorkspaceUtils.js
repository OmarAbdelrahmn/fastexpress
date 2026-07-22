export const controlClass =
  'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 disabled:cursor-not-allowed disabled:bg-slate-100';

export const textAreaClass = `${controlClass} min-h-24 resize-y`;

export function collectionItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export function collectionMeta(payload) {
  return {
    pageNumber: Number(payload?.pageNumber || 1),
    pageSize: Number(payload?.pageSize || collectionItems(payload).length || 1),
    totalCount: Number(payload?.totalCount ?? collectionItems(payload).length),
    totalPages: Number(payload?.totalPages || 1),
    hasPreviousPage: Boolean(payload?.hasPreviousPage),
    hasNextPage: Boolean(payload?.hasNextPage),
  };
}

export function apiErrorMessage(error, fallback) {
  return (
    error?.errorDescription ||
    error?.fullError?.error?.description ||
    error?.fullError?.detail ||
    error?.message ||
    fallback
  );
}

export function formatMoney(value, locale = 'ar-SA', currency = 'SAR') {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(value, locale = 'ar-SA') {
  if (!value) return '—';
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? String(value)
    : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsed);
}

export function currentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const date = (value) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 10);
  };
  return { start: date(start), end: date(end) };
}

export function todayIso() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export function optionalNumber(value) {
  if (value === '' || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseNumericIds(value) {
  return String(value ?? '')
    .split(/[\s,;]+/)
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isSafeInteger(item) && item > 0);
}

export function enumName(value, names = []) {
  if (typeof value === 'string' && value && !/^\d+$/.test(value)) return value;
  const index = Number(value);
  return names[index] || String(value ?? '—');
}

export function newCorrelationId(prefix = 'web') {
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${id}`;
}

export function isPendingStatus(status) {
  return ['1', '2', 'Received', 'Parsing'].includes(String(status));
}

export function selectedLocale(isRtl) {
  return isRtl ? 'ar-SA' : 'en-US';
}

export async function callApi(scope, names, ...args) {
  const methodName = names.find((name) => typeof scope?.[name] === 'function');
  if (!methodName) {
    throw new Error(`Accounting API method is unavailable: ${names.join(' / ')}`);
  }
  return scope[methodName](...args);
}
