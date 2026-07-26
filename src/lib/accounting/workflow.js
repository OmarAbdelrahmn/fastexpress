export const WORKFLOW_STAGES = Object.freeze([
  { id: 'statement', ar: 'كشف المنصة', en: 'Platform statement', href: '/accountant/imports' },
  { id: 'review', ar: 'مراجعة الملاحظات', en: 'Review issues', href: '/accountant/imports' },
  { id: 'payroll', ar: 'احتساب الرواتب', en: 'Calculate payroll', href: '/accountant/payroll' },
  { id: 'approval', ar: 'اعتماد الرواتب', en: 'Approve payroll', href: '/accountant/payroll' },
  { id: 'payment', ar: 'تأكيد السداد', en: 'Confirm payment', href: '/accountant/payments' },
]);

const IMPORT_STATUS = {
  Received: { key: 'processing', ar: 'قيد المعالجة', en: 'Processing' },
  Parsing: { key: 'processing', ar: 'قيد المعالجة', en: 'Processing' },
  NeedsResolution: { key: 'attention', ar: 'تحتاج معالجة', en: 'Needs attention' },
  Failed: { key: 'attention', ar: 'تحتاج معالجة', en: 'Needs attention' },
  Reconciled: { key: 'approve', ar: 'جاهزة للاعتماد', en: 'Ready to approve' },
  Approved: { key: 'payroll', ar: 'جاهزة للرواتب', en: 'Ready for payroll' },
  Rejected: { key: 'closed', ar: 'مرفوضة', en: 'Rejected' },
  Superseded: { key: 'closed', ar: 'تم استبدالها', en: 'Replaced' },
};

const PAYROLL_STATUS = {
  Draft: { key: 'calculate', ar: 'جاهز للاحتساب', en: 'Ready to calculate' },
  Calculated: { key: 'approve', ar: 'جاهز للاعتماد', en: 'Ready to approve' },
  Approved: { key: 'payment', ar: 'جاهز للسداد', en: 'Ready to pay' },
  PaymentPrepared: { key: 'payment', ar: 'السداد قيد التنفيذ', en: 'Payment in progress' },
  PartiallyPaid: { key: 'payment', ar: 'السداد قيد التنفيذ', en: 'Payment in progress' },
  Paid: { key: 'complete', ar: 'مكتمل', en: 'Completed' },
  Held: { key: 'attention', ar: 'موقوف', en: 'On hold' },
  Reversed: { key: 'closed', ar: 'تم العكس', en: 'Reversed' },
};

const PAYMENT_STATUS = {
  Prepared: { key: 'confirm', ar: 'بانتظار التأكيد', en: 'Awaiting confirmation' },
  Exported: { key: 'confirm', ar: 'بانتظار التأكيد', en: 'Awaiting confirmation' },
  Sent: { key: 'confirm', ar: 'بانتظار التأكيد', en: 'Awaiting confirmation' },
  Confirmed: { key: 'complete', ar: 'مكتمل', en: 'Completed' },
  PartiallyRejected: { key: 'attention', ar: 'تحتاج معالجة', en: 'Needs attention' },
  Rejected: { key: 'closed', ar: 'مرفوضة', en: 'Rejected' },
  Reversed: { key: 'closed', ar: 'تم العكس', en: 'Reversed' },
};

function enumName(value, names) {
  if (typeof value === 'number' || /^\d+$/.test(String(value))) return names[Number(value)] || String(value);
  return String(value || '');
}

export function accountantStatus(kind, value, isRtl = false) {
  const names = kind === 'import'
    ? ['', 'Received', 'Parsing', 'NeedsResolution', 'Reconciled', 'Approved', 'Rejected', 'Superseded', 'Failed']
    : kind === 'payroll'
      ? ['', 'Draft', 'Calculated', 'Approved', 'PaymentPrepared', 'PartiallyPaid', 'Paid', 'Held', 'Reversed']
      : ['', 'Prepared', 'Exported', 'Sent', 'Confirmed', 'PartiallyRejected', 'Rejected', 'Reversed'];
  const name = enumName(value, names);
  const mapped = (kind === 'import' ? IMPORT_STATUS : kind === 'payroll' ? PAYROLL_STATUS : PAYMENT_STATUS)[name];
  return {
    raw: name,
    key: mapped?.key || 'neutral',
    label: mapped ? (isRtl ? mapped.ar : mapped.en) : name || '—',
  };
}

export function workflowNextAction({ imports = [], payroll = [], payments = [], isRtl = false }) {
  const first = (rows, predicate) => rows.find(predicate);
  const issueImport = first(imports, (item) => accountantStatus('import', item.status).key === 'attention');
  if (issueImport) return { stage: 1, href: `/accountant/imports/${issueImport.id}`, ar: 'معالجة ملاحظات الكشف', en: 'Resolve statement issues' };
  const approveImport = first(imports, (item) => accountantStatus('import', item.status).key === 'approve');
  if (approveImport) return { stage: 1, href: `/accountant/imports/${approveImport.id}`, ar: 'اعتماد كشف جاهز', en: 'Approve ready statement' };
  const calculate = first(payroll, (item) => accountantStatus('payroll', item.status).key === 'calculate');
  if (calculate) return { stage: 2, href: `/accountant/payroll/${calculate.id}`, ar: 'احتساب مسير الرواتب', en: 'Calculate payroll run' };
  const approve = first(payroll, (item) => accountantStatus('payroll', item.status).key === 'approve');
  if (approve) return { stage: 3, href: `/accountant/payroll/${approve.id}`, ar: 'اعتماد مسير الرواتب', en: 'Approve payroll run' };
  const confirm = first(payments, (item) => accountantStatus('payment', item.status).key === 'confirm');
  if (confirm) return { stage: 4, href: `/accountant/payments/${confirm.id}`, ar: 'تأكيد دفعة السداد', en: 'Confirm payment batch' };
  return { stage: 0, href: '/accountant/imports', ar: 'رفع كشف منصة جديد', en: 'Upload a platform statement' };
}
