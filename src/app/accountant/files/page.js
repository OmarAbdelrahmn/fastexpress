'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download, FileArchive, RefreshCw, Upload } from 'lucide-react';
import {
  ActionButton,
  DataTable,
  EmptyState,
  ErrorState,
  PageHeader,
  Panel,
  StatusBadge,
} from '@/components/accounting/AccountingUi';
import { useAccountingWorkspace } from '@/lib/accounting/AccountingWorkspaceContext';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { accountingApi } from '@/lib/api/accountingApi';

const COPY = {
  ar: {
    eyebrow: 'المستندات الخاصة', title: 'خزنة الملفات المحاسبية', description: 'ارفع الأدلة وملفات التصدير الخاصة، وراجع مدة الاحتفاظ ونزّلها بشكل مصادق.',
    vault: 'الملفات المحفوظة', upload: 'رفع ملف', refresh: 'تحديث', file: 'الملف', retainUntil: 'الاحتفاظ حتى', choose: 'اختر ملفاً', send: 'رفع إلى الخزنة',
    id: 'معرف الملف', name: 'اسم الملف', contentType: 'نوع المحتوى', size: 'الحجم', status: 'الحالة', actions: 'إجراءات', download: 'تنزيل',
    noEntity: 'اختر كياناً قانونياً من شريط مساحة العمل.', empty: 'لا توجد ملفات محفوظة لهذا الكيان.', loadError: 'تعذر تحميل الملفات.', uploadError: 'تعذر رفع الملف.',
  },
  en: {
    eyebrow: 'Private documents', title: 'Accounting file vault', description: 'Upload private evidence and export files, review retention, and download them with authentication.',
    vault: 'Stored files', upload: 'Upload file', refresh: 'Refresh', file: 'File', retainUntil: 'Retain until', choose: 'Choose a file', send: 'Upload to vault',
    id: 'File ID', name: 'File name', contentType: 'Content type', size: 'Size', status: 'Status', actions: 'Actions', download: 'Download',
    noEntity: 'Select a legal entity from the workspace bar.', empty: 'No files are stored for this legal entity.', loadError: 'Files could not be loaded.', uploadError: 'The file could not be uploaded.',
  },
};

function rowsOf(value) {
  if (Array.isArray(value)) return value;
  return value?.items ?? value?.data ?? value?.results ?? [];
}

function saveFile(file, fallbackName) {
  if (!file?.blob || typeof window === 'undefined') return;
  const url = window.URL.createObjectURL(file.blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.fileName || fallbackName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

function formatBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 ** 2)).toFixed(1)} MB`;
}

export default function AccountingFilesPage() {
  const { isRtl } = useAccountingI18n();
  const { legalEntityId } = useAccountingWorkspace();
  const text = isRtl ? COPY.ar : COPY.en;
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [retainUntil, setRetainUntil] = useState('');
  const [loading, setLoading] = useState(false);
  const [busyFileId, setBusyFileId] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!legalEntityId) return;
    setLoading(true);
    setError('');
    try {
      setFiles(rowsOf(await accountingApi.files.list({ legalEntityId, pageNumber: 1, pageSize: 100 })));
    } catch (requestError) {
      setFiles([]);
      setError(requestError?.message || text.loadError);
    } finally {
      setLoading(false);
    }
  }, [legalEntityId, text.loadError]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (event) => {
    event.preventDefault();
    if (!selectedFile || !legalEntityId) return;
    const form = event.currentTarget;
    setLoading(true);
    setError('');
    try {
      await accountingApi.files.upload({
        legalEntityId,
        retainUntil: retainUntil ? new Date(retainUntil).toISOString() : undefined,
        file: selectedFile,
      });
      setSelectedFile(null);
      setRetainUntil('');
      form.reset();
      await load();
    } catch (requestError) {
      setError(requestError?.message || text.uploadError);
      setLoading(false);
    }
  };

  const download = async (item) => {
    const fileId = item.id ?? item.fileId ?? item.storedPrivateFileId;
    if (!fileId) return;
    setBusyFileId(String(fileId));
    setError('');
    try {
      saveFile(await accountingApi.files.download(fileId), item.originalFileName ?? item.fileName ?? `accounting-file-${fileId}`);
    } catch (requestError) {
      setError(requestError?.message || text.loadError);
    } finally {
      setBusyFileId('');
    }
  };

  const columns = [
    { key: 'id', header: text.id, render: (item) => <span className="font-mono text-xs" dir="ltr">{item.id ?? item.fileId ?? item.storedPrivateFileId}</span> },
    { key: 'fileName', header: text.name, render: (item) => item.originalFileName ?? item.fileName ?? item.name },
    { key: 'contentType', header: text.contentType },
    { key: 'size', header: text.size, numeric: true, render: (item) => formatBytes(item.sizeBytes ?? item.fileSize ?? item.length) },
    { key: 'status', header: text.status, render: (item) => <StatusBadge status={item.status ?? (item.isDeleted ? 'Inactive' : 'Active')} /> },
    { key: 'actions', header: text.actions, render: (item) => <ActionButton size="sm" variant="secondary" icon={Download} loading={busyFileId === String(item.id ?? item.fileId ?? item.storedPrivateFileId)} onClick={() => download(item)}>{text.download}</ActionButton> },
  ];

  return (
    <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader eyebrow={text.eyebrow} title={text.title} description={text.description} actions={<ActionButton variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>{text.refresh}</ActionButton>} />
      {!legalEntityId ? <EmptyState icon={FileArchive} title={text.noEntity} /> : (
        <>
          {error && <ErrorState compact message={error} onRetry={load} />}
          <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
            <Panel title={text.vault}>
              <DataTable columns={columns} rows={files} loading={loading} emptyTitle={text.empty} getRowKey={(item, index) => item.id ?? item.fileId ?? index} />
            </Panel>
            <Panel title={text.upload}>
              <form className="space-y-4" onSubmit={upload}>
                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  <span>{text.file}</span>
                  <input type="file" required onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm file:me-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:font-bold file:text-blue-800" />
                </label>
                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  <span>{text.retainUntil}</span>
                  <input type="datetime-local" value={retainUntil} onChange={(event) => setRetainUntil(event.target.value)} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm" />
                </label>
                <ActionButton type="submit" icon={Upload} loading={loading} disabled={!selectedFile}>{text.send}</ActionButton>
              </form>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
