'use client';

import {
  ActionButton,
  DataTable,
  EmptyState,
  ErrorState,
  FormField,
  LoadingState,
  MetricCard,
  PageHeader,
  Panel,
  StatusBadge,
} from '@/components/accounting/AccountingUi';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { useAccountingWorkspace } from '@/lib/accounting/AccountingWorkspaceContext';
import { accountingApi } from '@/lib/api/accountingApi';
import { FileSpreadsheet, Layers3, Plus, RefreshCw, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  apiErrorMessage,
  callApi,
  collectionItems,
  controlClass,
  currentMonthRange,
  formatDate,
  formatMoney,
  selectedLocale,
} from './_shared/accountingWorkspaceUtils';

const COPY = {
  ar: {
    eyebrow: 'الاستيراد والأدلة',
    title: 'دفعات استيراد المنصات',
    description: 'ارفع كشوف المنصات، راقب المعالجة، ثم عالج الملاحظات قبل الاعتماد.',
    templates: 'قوالب الاستيراد',
    refresh: 'تحديث',
    uploadTitle: 'رفع كشف جديد',
    uploadDescription: 'يُحفظ الملف الأصلي بشكل خاص، ولا ينشئ الرفع رواتب أو قيوداً محاسبية.',
    legalEntityMissing: 'اختر كياناً قانونياً من شريط مساحة العمل أولاً.',
    platform: 'حساب المنصة',
    template: 'القالب',
    noTemplate: 'بدون قالب — اكتشاف البنية أولاً',
    externalReference: 'مرجع الكشف',
    periodStart: 'بداية الفترة',
    periodEnd: 'نهاية الفترة',
    controlTotal: 'إجمالي المصدر (اختياري)',
    file: 'ملف Excel أو CSV',
    upload: 'رفع وبدء المعالجة',
    uploading: 'جاري الرفع…',
    register: 'سجل الدفعات',
    registerDescription: 'افتح أي دفعة لمراجعة المصدر، الملاحظات، والحقائق المحاسبية.',
    search: 'بحث بالمرجع',
    allStatuses: 'كل الحالات',
    emptyTitle: 'لا توجد دفعات استيراد',
    emptyDescription: 'ابدأ برفع أول كشف منصة لهذه الفترة.',
    loadError: 'تعذر تحميل دفعات الاستيراد.',
    uploadError: 'تعذر رفع الملف.',
    reference: 'المرجع',
    period: 'الفترة',
    platformColumn: 'المنصة',
    totals: 'الإجمالي',
    issues: 'ملاحظات مانعة',
    status: 'الحالة',
    open: 'فتح',
    batches: 'إجمالي الدفعات',
    needsWork: 'تحتاج معالجة',
    approved: 'معتمدة',
    facts: 'الحقائق المحفوظة',
    selectFile: 'اختر ملفاً غير فارغ.',
    success: 'تم رفع الكشف وفتح مساحة المراجعة.',
  },
  en: {
    eyebrow: 'Imports & evidence',
    title: 'Platform import batches',
    description: 'Upload platform statements, monitor processing, and resolve issues before approval.',
    templates: 'Import templates',
    refresh: 'Refresh',
    uploadTitle: 'Upload a new statement',
    uploadDescription: 'The original file is stored privately. Uploading never creates payroll or journal entries.',
    legalEntityMissing: 'Select a legal entity from the workspace bar first.',
    platform: 'Platform account',
    template: 'Template',
    noTemplate: 'No template — inspect structure first',
    externalReference: 'Statement reference',
    periodStart: 'Period start',
    periodEnd: 'Period end',
    controlTotal: 'Source control total (optional)',
    file: 'Excel or CSV file',
    upload: 'Upload and process',
    uploading: 'Uploading…',
    register: 'Batch register',
    registerDescription: 'Open a batch to review its source, issues, and accounting facts.',
    search: 'Search by reference',
    allStatuses: 'All statuses',
    emptyTitle: 'No import batches',
    emptyDescription: 'Upload the first platform statement for this period.',
    loadError: 'Import batches could not be loaded.',
    uploadError: 'The file could not be uploaded.',
    reference: 'Reference',
    period: 'Period',
    platformColumn: 'Platform',
    totals: 'Total',
    issues: 'Blocking issues',
    status: 'Status',
    open: 'Open',
    batches: 'Total batches',
    needsWork: 'Needs attention',
    approved: 'Approved',
    facts: 'Stored facts',
    selectFile: 'Choose a non-empty file.',
    success: 'Statement uploaded; opening the review workspace.',
  },
};

const STATUSES = ['Received', 'Parsing', 'NeedsResolution', 'Reconciled', 'Approved', 'Rejected', 'Failed'];

export default function ImportBatchesPage() {
  const router = useRouter();
  const { isRtl } = useAccountingI18n();
  const { selectedLegalEntityId: legalEntityId } = useAccountingWorkspace();
  const copy = isRtl ? COPY.ar : COPY.en;
  const locale = selectedLocale(isRtl);
  const month = useMemo(() => currentMonthRange(), []);
  const [batches, setBatches] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [form, setForm] = useState({
    platformAccountId: '',
    templateId: '',
    externalReference: '',
    periodStart: month.start,
    periodEnd: month.end,
    sourceControlTotal: '',
    file: null,
  });

  const load = useCallback(async () => {
    if (!legalEntityId) {
      setBatches([]);
      setTemplates([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [batchPayload, templatePayload] = await Promise.all([
        callApi(accountingApi.imports, ['list', 'getAll'], {
          legalEntityId,
          search: filters.search || undefined,
          status: filters.status || undefined,
          pageNumber: 1,
          pageSize: 50,
        }),
        callApi(accountingApi.imports, ['listTemplates', 'templates'], {
          legalEntityId,
          pageNumber: 1,
          pageSize: 100,
        }).catch(() => []),
      ]);
      setBatches(collectionItems(batchPayload));
      setTemplates(collectionItems(templatePayload));
    } catch (requestError) {
      setError(apiErrorMessage(requestError, copy.loadError));
    } finally {
      setLoading(false);
    }
  }, [copy.loadError, filters.search, filters.status, legalEntityId]);

  useEffect(() => {
    const timeout = setTimeout(load, filters.search ? 250 : 0);
    return () => clearTimeout(timeout);
  }, [load, filters.search]);

  const submitUpload = async (event) => {
    event.preventDefault();
    if (!legalEntityId || uploading) return;
    if (!form.file?.size) {
      setUploadError(copy.selectFile);
      return;
    }
    setUploading(true);
    setUploadError('');
    try {
      const created = await callApi(accountingApi.imports, ['upload', 'create'], {
        legalEntityId: Number(legalEntityId),
        platformAccountId: Number(form.platformAccountId),
        templateId: form.templateId || undefined,
        externalReference: form.externalReference.trim(),
        periodStart: form.periodStart,
        periodEnd: form.periodEnd,
        sourceControlTotal: form.sourceControlTotal === '' ? undefined : Number(form.sourceControlTotal),
        file: form.file,
      });
      router.push(`/accountant/imports/${created.id}`);
    } catch (requestError) {
      setUploadError(apiErrorMessage(requestError, copy.uploadError));
      setUploading(false);
    }
  };

  const counts = useMemo(
    () => ({
      needsWork: batches.filter((item) => ['NeedsResolution', 'Failed'].includes(item.status)).length,
      approved: batches.filter((item) => item.status === 'Approved').length,
      facts: batches.reduce((sum, item) => sum + Number(item.factCount || 0), 0),
    }),
    [batches],
  );

  const columns = [
    {
      key: 'externalReference',
      header: copy.reference,
      render: (item) => (
        <div>
          <Link className="font-semibold text-blue-700 hover:underline" href={`/accountant/imports/${item.id}`}>
            {item.externalReference || item.id}
          </Link>
          <div className="mt-1 max-w-48 truncate font-mono text-xs text-slate-500" dir="ltr">{item.id}</div>
        </div>
      ),
    },
    { key: 'platformAccountId', header: copy.platformColumn, render: (item) => item.platformName || item.platformAccountId || '—' },
    {
      key: 'periodStart',
      header: copy.period,
      render: (item) => `${formatDate(item.periodStart, locale)} — ${formatDate(item.periodEnd, locale)}`,
    },
    {
      key: 'normalizedControlTotal',
      header: copy.totals,
      align: 'end',
      render: (item) => formatMoney(item.normalizedControlTotal ?? item.sourceControlTotal, locale),
    },
    { key: 'openBlockingIssueCount', header: copy.issues, align: 'end', render: (item) => item.openBlockingIssueCount ?? 0 },
    { key: 'status', header: copy.status, render: (item) => <StatusBadge status={item.status} /> },
    {
      key: 'action',
      header: '',
      render: (item) => (
        <Link className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50" href={`/accountant/imports/${item.id}`}>
          {copy.open}
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={(
          <div className="flex flex-wrap gap-2">
            <Link className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50" href="/accountant/imports/templates">
              <Layers3 size={17} /> {copy.templates}
            </Link>
            <ActionButton variant="secondary" icon={RefreshCw} onClick={load} disabled={loading}>
              {copy.refresh}
            </ActionButton>
          </div>
        )}
      />

      {!legalEntityId ? (
        <EmptyState icon={FileSpreadsheet} title={copy.legalEntityMissing} />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label={copy.title}>
            <MetricCard label={copy.batches} value={batches.length} icon={FileSpreadsheet} />
            <MetricCard label={copy.needsWork} value={counts.needsWork} tone="warning" />
            <MetricCard label={copy.approved} value={counts.approved} tone="success" />
            <MetricCard label={copy.facts} value={counts.facts.toLocaleString(locale)} />
          </section>

          <Panel title={copy.uploadTitle} description={copy.uploadDescription}>
            <form className="grid gap-4 lg:grid-cols-4" onSubmit={submitUpload}>
              <FormField label={copy.platform} required>
                <input
                  className={controlClass}
                  inputMode="numeric"
                  required
                  value={form.platformAccountId}
                  onChange={(event) => setForm((current) => ({ ...current, platformAccountId: event.target.value }))}
                />
              </FormField>
              <FormField label={copy.template}>
                <select className={controlClass} value={form.templateId} onChange={(event) => setForm((current) => ({ ...current, templateId: event.target.value }))}>
                  <option value="">{copy.noTemplate}</option>
                  {templates.map((template) => <option key={template.id} value={template.id}>{template.code} · {template.name}</option>)}
                </select>
              </FormField>
              <FormField label={copy.externalReference} required>
                <input className={controlClass} required value={form.externalReference} onChange={(event) => setForm((current) => ({ ...current, externalReference: event.target.value }))} />
              </FormField>
              <FormField label={copy.controlTotal}>
                <input className={controlClass} type="number" min="0" step="0.01" value={form.sourceControlTotal} onChange={(event) => setForm((current) => ({ ...current, sourceControlTotal: event.target.value }))} />
              </FormField>
              <FormField label={copy.periodStart} required>
                <input className={controlClass} type="date" required value={form.periodStart} onChange={(event) => setForm((current) => ({ ...current, periodStart: event.target.value }))} />
              </FormField>
              <FormField label={copy.periodEnd} required>
                <input className={controlClass} type="date" min={form.periodStart} required value={form.periodEnd} onChange={(event) => setForm((current) => ({ ...current, periodEnd: event.target.value }))} />
              </FormField>
              <FormField label={copy.file} required>
                <input className={`${controlClass} file:me-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:font-semibold file:text-blue-700`} type="file" accept=".xlsx,.csv" required onChange={(event) => setForm((current) => ({ ...current, file: event.target.files?.[0] || null }))} />
              </FormField>
              <div className="flex items-end">
                <ActionButton className="w-full" type="submit" icon={UploadCloud} loading={uploading} disabled={uploading}>
                  {uploading ? copy.uploading : copy.upload}
                </ActionButton>
              </div>
              {uploadError && <div className="lg:col-span-4"><ErrorState description={uploadError} compact /></div>}
            </form>
          </Panel>

          <Panel title={copy.register} description={copy.registerDescription}>
            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
              <input className={controlClass} type="search" placeholder={copy.search} value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
              <select className={controlClass} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
                <option value="">{copy.allStatuses}</option>
                {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            {loading ? <LoadingState /> : error ? <ErrorState description={error} onRetry={load} /> : batches.length === 0 ? (
              <EmptyState icon={Plus} title={copy.emptyTitle} description={copy.emptyDescription} />
            ) : <DataTable columns={columns} data={batches} rowKey="id" />}
          </Panel>
        </>
      )}
    </div>
  );
}
