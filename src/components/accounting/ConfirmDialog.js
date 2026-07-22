'use client';

import { useEffect, useId, useRef } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';
import { accountingT } from '@/lib/accounting/i18n';
import ActionButton from './ActionButton';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const { locale } = useLanguage();
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const generatedId = useId().replace(/:/g, '');
  const titleId = `accounting-confirm-title-${generatedId}`;
  const descriptionId = `accounting-confirm-description-${generatedId}`;
  const Icon = tone === 'danger' ? AlertTriangle : CheckCircle2;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      previousFocusRef.current = document.activeElement;
      dialog.showModal();
      window.requestAnimationFrame(() => cancelButtonRef.current?.focus());
    } else if (!open && dialog.open) {
      dialog.close();
      previousFocusRef.current?.focus?.();
    }
  }, [open]);

  useEffect(() => () => previousFocusRef.current?.focus?.(), []);

  const cancel = (event) => {
    event?.preventDefault?.();
    if (!loading) onCancel?.();
  };

  return (
    <dialog
      ref={dialogRef}
      className="accounting-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={loading || undefined}
      onCancel={cancel}
      onClick={(event) => {
        if (event.target === event.currentTarget) cancel(event);
      }}
    >
      <div className="accounting-dialog__surface">
        <div className="flex items-start gap-3">
          <span className={`accounting-dialog__icon ${tone === 'danger' ? 'accounting-dialog__icon--danger' : 'accounting-dialog__icon--success'}`} aria-hidden="true">
            <Icon size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-black text-slate-950">
              {title ?? accountingT(locale, 'dialog.confirmTitle')}
            </h2>
            <p id={descriptionId} className="mt-2 text-sm leading-6 text-slate-600">
              {description ?? accountingT(locale, 'dialog.confirmDescription')}
            </p>
          </div>
          <button
            type="button"
            className="accounting-icon-button -mt-1 -me-1"
            onClick={cancel}
            disabled={loading}
            aria-label={accountingT(locale, 'common.close')}
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            ref={cancelButtonRef}
            type="button"
            className="accounting-button accounting-button--outline accounting-button--md"
            onClick={cancel}
            disabled={loading}
          >
            {cancelLabel ?? accountingT(locale, 'common.cancel')}
          </button>
          <ActionButton
            variant={tone === 'danger' ? 'danger' : 'primary'}
            loading={loading}
            loadingLabel={accountingT(locale, 'dialog.processing')}
            onClick={onConfirm}
          >
            {confirmLabel ?? accountingT(locale, 'common.confirm')}
          </ActionButton>
        </div>
      </div>
    </dialog>
  );
}
