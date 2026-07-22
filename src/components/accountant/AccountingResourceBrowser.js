'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  ActionButton,
  DataTable,
  ErrorState,
  Panel,
  StatusBadge,
} from '@/components/accounting/AccountingUi';
import { useAccountingI18n } from '@/lib/accounting/i18n';

const TEXT = {
  ar: {
    title: 'السجلات الحالية',
    resource: 'نوع السجل',
    refresh: 'تحديث',
    detail: 'تفاصيل السجل',
    loadError: 'تعذر تحميل السجلات.',
    empty: 'لا توجد سجلات من هذا النوع.',
  },
  en: {
    title: 'Current records',
    resource: 'Record type',
    refresh: 'Refresh',
    detail: 'Record details',
    loadError: 'Records could not be loaded.',
    empty: 'No records of this type were found.',
  },
};

const PRIORITY_KEYS = [
  'code',
  'name',
  'number',
  'status',
  'description',
  'transactionDate',
  'invoiceDate',
  'effectiveDate',
  'amount',
  'totalAmount',
];

function rowsOf(value) {
  if (Array.isArray(value)) return value;
  return value?.items ?? value?.data ?? value?.results ?? value?.records ?? [];
}

function valueLabel(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase());
}

function isRenderable(value) {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

function chooseKeys(rows) {
  const sample = rows.find((row) => row && typeof row === 'object');
  if (!sample) return [];
  const keys = Object.keys(sample).filter((key) => isRenderable(sample[key]));
  const idKey = keys.find((key) => key === 'id' || key.endsWith('Id'));
  const prioritized = [idKey, ...PRIORITY_KEYS.filter((key) => keys.includes(key)), ...keys]
    .filter(Boolean);
  return [...new Set(prioritized)].slice(0, 6);
}

function cellFor(key, row) {
  const value = row?.[key];
  if (/status|state|type|category/i.test(key)) return <StatusBadge status={value} />;
  if (typeof value === 'boolean') return value ? '✓' : '—';
  return value ?? '—';
}

export default function AccountingResourceBrowser({ resources = [] }) {
  const { isRtl } = useAccountingI18n();
  const text = isRtl ? TEXT.ar : TEXT.en;
  const [resourceId, setResourceId] = useState(resources[0]?.id ?? '');
  const [rows, setRows] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!resources.some((resource) => resource.id === resourceId)) {
      setResourceId(resources[0]?.id ?? '');
    }
  }, [resourceId, resources]);

  const resource = resources.find((item) => item.id === resourceId) ?? resources[0];

  const load = useCallback(async () => {
    if (!resource?.load) return;
    setLoading(true);
    setError('');
    setDetail(null);
    try {
      setRows(rowsOf(await resource.load()));
    } catch (requestError) {
      setRows([]);
      setError(requestError?.message || text.loadError);
    } finally {
      setLoading(false);
    }
  }, [resource, text.loadError]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = useMemo(() => chooseKeys(rows).map((key) => ({
    key,
    header: valueLabel(key),
    numeric: typeof rows[0]?.[key] === 'number',
    render: (row) => cellFor(key, row),
  })), [rows]);

  const openDetail = async (row) => {
    if (!resource?.get) return;
    const id = resource.idOf?.(row) ?? row?.id ?? Object.entries(row ?? {}).find(([key]) => key.endsWith('Id'))?.[1];
    if (id === undefined || id === null || id === '') return;
    setLoading(true);
    setError('');
    try {
      setDetail(await resource.get(id));
    } catch (requestError) {
      setError(requestError?.message || text.loadError);
    } finally {
      setLoading(false);
    }
  };

  if (!resources.length) return null;

  return (
    <Panel
      title={text.title}
      actions={(
        <div className="flex flex-wrap items-end gap-2">
          <label className="grid gap-1 text-xs font-bold text-slate-600">
            <span>{text.resource}</span>
            <select
              value={resource?.id ?? ''}
              onChange={(event) => setResourceId(event.target.value)}
              className="min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800"
            >
              {resources.map((item) => (
                <option key={item.id} value={item.id}>{isRtl ? item.label.ar : item.label.en}</option>
              ))}
            </select>
          </label>
          <ActionButton variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>
            {text.refresh}
          </ActionButton>
        </div>
      )}
    >
      {error && <ErrorState compact message={error} onRetry={load} />}
      <DataTable
        columns={columns.length ? columns : [{ key: 'value', header: text.resource, render: () => '—' }]}
        rows={rows}
        loading={loading}
        emptyTitle={text.empty}
        getRowKey={(row, index) => resource?.idOf?.(row) ?? row.id ?? index}
        onRowClick={resource?.get ? openDetail : undefined}
      />
      {detail && (
        <details className="mt-4 rounded-xl border border-slate-200 bg-slate-950 p-4 text-slate-100" open>
          <summary className="cursor-pointer text-sm font-black">{text.detail}</summary>
          <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs leading-6" dir="ltr">
            {JSON.stringify(detail, null, 2)}
          </pre>
        </details>
      )}
    </Panel>
  );
}
