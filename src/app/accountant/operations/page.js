'use client';

import { EmptyState, PageHeader } from '@/components/accounting/AccountingUi';
import FinanceActionForm, { FinanceTabs } from '@/components/accountant/FinanceActionForm';
import AccountingResourceBrowser from '@/components/accountant/AccountingResourceBrowser';
import { useAccountingI18n } from '@/lib/accounting/i18n';
import { useAccountingWorkspace } from '@/lib/accounting/AccountingWorkspaceContext';
import { accountingApi } from '@/lib/api/accountingApi';
import { Boxes, Building2, Landmark, PackageCheck, ReceiptText, ScrollText, ShieldCheck, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const COPY = {
  ar: { eyebrow: 'العمليات المالية', title: 'مركز العمليات المحاسبية', description: 'سجّل المستندات التشغيلية من خلال عقود المحاسبة المحددة، ثم رحّلها عبر ملفات الترحيل المعتمدة.', noEntity: 'اختر كياناً قانونياً قبل تسجيل العمليات.', receivables: 'العملاء والتحصيل', payables: 'الموردون والمدفوعات', expenses: 'الأدلة والمصروفات', inventory: 'المخزون', treasury: 'الخزينة والبنوك', tax: 'الضرائب', assets: 'الأصول', budgets: 'الميزانيات' },
  en: { eyebrow: 'Financial operations', title: 'Accounting operations center', description: 'Record bounded operational documents, then post them through configured posting profiles.', noEntity: 'Select a legal entity before recording operations.', receivables: 'Receivables', payables: 'Payables', expenses: 'Evidence & expenses', inventory: 'Inventory', treasury: 'Treasury', tax: 'Tax', assets: 'Assets', budgets: 'Budgets' },
};

const field = (name, ar, en, type = 'text', extra = {}) => ({ name, label: { ar, en }, type, ...extra });
const options = (items) => items.map(([value, ar, en = ar]) => ({ value, label: { ar, en } }));
const key = () => globalThis.crypto?.randomUUID?.() || `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const withoutKey = (payload) => { const { idempotencyKey, ...body } = payload; return [body, idempotencyKey]; };

const commonEntity = (legalEntityId) => field('legalEntityId', 'الكيان القانوني', 'Legal entity', 'number', { required: true, defaultValue: legalEntityId || '' });
const profile = () => field('postingProfileCode', 'ملف الترحيل', 'Posting profile code', 'text', { required: true, dir: 'ltr' });
const idempotencyField = () => field('idempotencyKey', 'مفتاح عدم التكرار', 'Idempotency key', 'text', { required: true, defaultValue: key(), dir: 'ltr', full: true });

export default function AccountingOperationsPage({ initialModuleId = 'receivables' }) {
  const { isRtl } = useAccountingI18n();
  const { legalEntityId } = useAccountingWorkspace();
  const text = isRtl ? COPY.ar : COPY.en;
  const [moduleId, setModuleId] = useState(initialModuleId);
  const [actionIds, setActionIds] = useState({});

  useEffect(() => {
    setModuleId(initialModuleId);
  }, [initialModuleId]);

  const modules = useMemo(() => [
    { id: 'receivables', label: { ar: COPY.ar.receivables, en: COPY.en.receivables }, icon: UsersRound },
    { id: 'payables', label: { ar: COPY.ar.payables, en: COPY.en.payables }, icon: Building2 },
    { id: 'expenses', label: { ar: COPY.ar.expenses, en: COPY.en.expenses }, icon: ReceiptText },
    { id: 'inventory', label: { ar: COPY.ar.inventory, en: COPY.en.inventory }, icon: Boxes },
    { id: 'treasury', label: { ar: COPY.ar.treasury, en: COPY.en.treasury }, icon: Landmark },
    { id: 'tax', label: { ar: COPY.ar.tax, en: COPY.en.tax }, icon: ShieldCheck },
    { id: 'assets', label: { ar: COPY.ar.assets, en: COPY.en.assets }, icon: PackageCheck },
    { id: 'budgets', label: { ar: COPY.ar.budgets, en: COPY.en.budgets }, icon: ScrollText },
  ], []);

  const resourceGroups = useMemo(() => ({
    receivables: [
      { id: 'customers', label: { ar: 'العملاء', en: 'Customers' }, load: () => accountingApi.operations.receivables.listCustomers({ legalEntityId }), get: accountingApi.operations.receivables.getCustomer, idOf: (row) => row.customerAccountId ?? row.id },
      { id: 'invoices', label: { ar: 'فواتير العملاء', en: 'Customer invoices' }, load: () => accountingApi.operations.receivables.listInvoices({ legalEntityId }), get: accountingApi.operations.receivables.getInvoice, idOf: (row) => row.customerInvoiceId ?? row.invoiceId ?? row.id },
      { id: 'receipts', label: { ar: 'سندات القبض', en: 'Receipts' }, load: () => accountingApi.operations.receivables.listReceipts({ legalEntityId }), get: accountingApi.operations.receivables.getReceipt, idOf: (row) => row.customerReceiptId ?? row.receiptId ?? row.id },
      { id: 'settlements', label: { ar: 'تسويات المنصات', en: 'Platform settlements' }, load: () => accountingApi.operations.receivables.listPlatformSettlements({ legalEntityId }), get: accountingApi.operations.receivables.getPlatformSettlement, idOf: (row) => row.platformSettlementId ?? row.settlementId ?? row.id },
    ],
    payables: [
      { id: 'suppliers', label: { ar: 'الموردون', en: 'Suppliers' }, load: () => accountingApi.operations.payables.listSuppliers({ legalEntityId }), get: accountingApi.operations.payables.getSupplier, idOf: (row) => row.supplierAccountId ?? row.id },
      { id: 'invoices', label: { ar: 'فواتير الموردين', en: 'Supplier invoices' }, load: () => accountingApi.operations.payables.listInvoices({ legalEntityId }), get: accountingApi.operations.payables.getInvoice, idOf: (row) => row.supplierInvoiceId ?? row.invoiceId ?? row.id },
      { id: 'payments', label: { ar: 'مدفوعات الموردين', en: 'Supplier payments' }, load: () => accountingApi.operations.payables.listPayments({ legalEntityId }), get: accountingApi.operations.payables.getPayment, idOf: (row) => row.supplierPaymentId ?? row.paymentId ?? row.id },
    ],
    expenses: [
      { id: 'evidence', label: { ar: 'الأدلة المالية', en: 'Source evidence' }, load: () => accountingApi.operations.expenses.listEvidence({ legalEntityId }), get: accountingApi.operations.expenses.getEvidence, idOf: (row) => row.sourceEvidenceId ?? row.evidenceId ?? row.id },
      { id: 'claims', label: { ar: 'مطالبات المصروفات', en: 'Expense claims' }, load: () => accountingApi.operations.expenses.listClaims({ legalEntityId }), get: accountingApi.operations.expenses.getClaim, idOf: (row) => row.expenseClaimId ?? row.claimId ?? row.id },
    ],
    inventory: [
      { id: 'items', label: { ar: 'أصناف المخزون', en: 'Inventory items' }, load: () => accountingApi.operations.inventory.listItems({ legalEntityId }), get: accountingApi.operations.inventory.getItem, idOf: (row) => row.inventoryItemId ?? row.id },
      { id: 'movements', label: { ar: 'حركات المخزون', en: 'Inventory movements' }, load: () => accountingApi.operations.inventory.listMovements({ legalEntityId }), get: accountingApi.operations.inventory.getMovement, idOf: (row) => row.inventoryMovementId ?? row.movementId ?? row.id },
      { id: 'balances', label: { ar: 'أرصدة المخزون', en: 'Stock balances' }, load: () => accountingApi.operations.inventory.getStockBalances({ legalEntityId }), idOf: (row) => `${row.inventoryItemId ?? row.itemId}-${row.bin ?? row.location ?? ''}` },
    ],
    treasury: [
      { id: 'accounts', label: { ar: 'الحسابات البنكية', en: 'Bank accounts' }, load: () => accountingApi.operations.treasury.listBankAccounts({ legalEntityId }), get: accountingApi.operations.treasury.getBankAccount, idOf: (row) => row.bankAccountId ?? row.id },
      { id: 'statements', label: { ar: 'حركات الكشوف', en: 'Statement lines' }, load: () => accountingApi.operations.treasury.listStatementLines({ legalEntityId }), get: accountingApi.operations.treasury.getStatementLine, idOf: (row) => row.bankStatementLineId ?? row.statementLineId ?? row.id },
    ],
    tax: [
      { id: 'codes', label: { ar: 'الرموز الضريبية', en: 'Tax codes' }, load: () => accountingApi.operations.tax.listCodes({ legalEntityId }), get: accountingApi.operations.tax.getCode, idOf: (row) => row.taxCodeId ?? row.id },
      { id: 'returns', label: { ar: 'الإقرارات الضريبية', en: 'Tax returns' }, load: () => accountingApi.operations.tax.listReturns({ legalEntityId }), get: accountingApi.operations.tax.getReturn, idOf: (row) => row.taxReturnId ?? row.id },
    ],
    assets: [
      { id: 'assets', label: { ar: 'الأصول الثابتة', en: 'Fixed assets' }, load: () => accountingApi.operations.assets.list({ legalEntityId }), get: accountingApi.operations.assets.get, idOf: (row) => row.fixedAssetId ?? row.assetId ?? row.id },
    ],
    budgets: [
      { id: 'budgets', label: { ar: 'الميزانيات', en: 'Budgets' }, load: () => accountingApi.operations.budgets.list({ legalEntityId }), get: accountingApi.operations.budgets.get, idOf: (row) => row.budgetId ?? row.id },
    ],
  }), [legalEntityId]);

  const configs = {
    receivables: {
      customer: { title: { ar: 'إضافة حساب عميل', en: 'Create customer account' }, fields: [commonEntity(legalEntityId), field('code', 'رمز العميل', 'Customer code', 'text', { required: true, dir: 'ltr' }), field('name', 'اسم العميل', 'Customer name', 'text', { required: true }), field('taxRegistrationNumber', 'الرقم الضريبي', 'Tax registration number', 'text', { dir: 'ltr' })], submit: (payload) => accountingApi.operations.receivables.createCustomer(payload) },
      invoice: { title: { ar: 'إنشاء فاتورة عميل', en: 'Create customer invoice' }, fields: [commonEntity(legalEntityId), field('customerAccountId', 'معرف العميل', 'Customer account ID', 'text', { required: true, dir: 'ltr' }), field('sourceEvidenceId', 'معرف الدليل (اختياري)', 'Evidence ID (optional)', 'text', { dir: 'ltr' }), field('invoiceNumber', 'رقم الفاتورة', 'Invoice number', 'text', { required: true, dir: 'ltr' }), field('invoiceDate', 'تاريخ الفاتورة', 'Invoice date', 'date', { required: true }), field('dueDate', 'تاريخ الاستحقاق', 'Due date', 'date', { required: true }), field('currencyCode', 'العملة', 'Currency', 'text', { required: true, defaultValue: 'SAR', dir: 'ltr' }), field('exchangeRate', 'سعر الصرف', 'Exchange rate', 'number', { required: true, defaultValue: 1, step: '0.000001' }), profile(), field('lines', 'بنود الفاتورة بصيغة JSON', 'Invoice lines as JSON', 'json', { required: true, full: true, defaultValue: '[\n  {"description":"", "quantity":1, "unitPrice":0, "taxCodeId":null}\n]' })], submit: (payload) => accountingApi.operations.receivables.createInvoice(payload) },
      issue: { title: { ar: 'إصدار فاتورة عميل', en: 'Issue customer invoice' }, fields: [field('invoiceId', 'معرف الفاتورة', 'Invoice ID', 'text', { required: true, dir: 'ltr' }), idempotencyField()], submit: ({ invoiceId, idempotencyKey }) => accountingApi.operations.receivables.issueInvoice(invoiceId, idempotencyKey) },
      receipt: { title: { ar: 'تسجيل سند قبض', en: 'Record customer receipt' }, fields: [commonEntity(legalEntityId), field('customerAccountId', 'معرف العميل', 'Customer account ID', 'text', { required: true, dir: 'ltr' }), field('receiptNumber', 'رقم السند', 'Receipt number', 'text', { required: true, dir: 'ltr' }), field('externalReference', 'المرجع الخارجي', 'External reference', 'text', { required: true, dir: 'ltr' }), field('receiptDate', 'تاريخ القبض', 'Receipt date', 'date', { required: true }), field('currencyCode', 'العملة', 'Currency', 'text', { required: true, defaultValue: 'SAR', dir: 'ltr' }), field('exchangeRate', 'سعر الصرف', 'Exchange rate', 'number', { required: true, defaultValue: 1, step: '0.000001' }), field('amount', 'المبلغ', 'Amount', 'number', { required: true, min: 0.01, step: '0.01' }), profile(), idempotencyField()], submit: (payload) => accountingApi.operations.receivables.recordReceipt(...withoutKey(payload)) },
      allocate: { title: { ar: 'تخصيص سند قبض', en: 'Allocate customer receipt' }, fields: [field('receiptId', 'معرف سند القبض', 'Receipt ID', 'text', { required: true, dir: 'ltr' }), field('customerInvoiceId', 'معرف الفاتورة', 'Invoice ID', 'text', { required: true, dir: 'ltr' }), field('amount', 'المبلغ', 'Amount', 'number', { required: true, min: 0.01, step: '0.01' })], submit: ({ receiptId, ...payload }) => accountingApi.operations.receivables.allocateReceipt(receiptId, payload) },
      settlement: { title: { ar: 'تسجيل تسوية منصة', en: 'Record platform settlement' }, fields: [commonEntity(legalEntityId), field('sourceEvidenceId', 'معرف الدليل', 'Evidence ID', 'text', { required: true, dir: 'ltr' }), field('settlementReference', 'مرجع التسوية', 'Settlement reference', 'text', { required: true, dir: 'ltr' }), field('settlementDate', 'تاريخ التسوية', 'Settlement date', 'date', { required: true }), field('grossRevenue', 'إجمالي الإيراد', 'Gross revenue', 'number', { required: true, min: 0, step: '0.01' }), field('commissionAmount', 'العمولة', 'Commission amount', 'number', { required: true, min: 0, step: '0.01' }), field('netSettlementAmount', 'صافي التسوية', 'Net settlement', 'number', { required: true, min: 0, step: '0.01' }), profile(), idempotencyField()], submit: (payload) => accountingApi.operations.receivables.recordPlatformSettlement(...withoutKey(payload)) },
    },
    payables: {
      supplier: { title: { ar: 'إضافة حساب مورد', en: 'Create supplier account' }, fields: [commonEntity(legalEntityId), field('code', 'رمز المورد', 'Supplier code', 'text', { required: true, dir: 'ltr' }), field('name', 'اسم المورد', 'Supplier name', 'text', { required: true }), field('taxRegistrationNumber', 'الرقم الضريبي', 'Tax registration number', 'text', { dir: 'ltr' })], submit: (payload) => accountingApi.operations.payables.createSupplier(payload) },
      invoice: { title: { ar: 'إنشاء فاتورة مورد', en: 'Create supplier invoice' }, fields: [commonEntity(legalEntityId), field('supplierAccountId', 'معرف المورد', 'Supplier account ID', 'text', { required: true, dir: 'ltr' }), field('sourceEvidenceId', 'معرف الدليل (اختياري)', 'Evidence ID (optional)', 'text', { dir: 'ltr' }), field('invoiceNumber', 'رقم الفاتورة', 'Invoice number', 'text', { required: true, dir: 'ltr' }), field('invoiceDate', 'تاريخ الفاتورة', 'Invoice date', 'date', { required: true }), field('dueDate', 'تاريخ الاستحقاق', 'Due date', 'date', { required: true }), field('currencyCode', 'العملة', 'Currency', 'text', { required: true, defaultValue: 'SAR', dir: 'ltr' }), field('exchangeRate', 'سعر الصرف', 'Exchange rate', 'number', { required: true, defaultValue: 1, step: '0.000001' }), profile(), field('lines', 'بنود الفاتورة بصيغة JSON', 'Invoice lines as JSON', 'json', { required: true, full: true, defaultValue: '[\n  {"description":"", "quantity":1, "unitPrice":0, "taxCodeId":null}\n]' })], submit: (payload) => accountingApi.operations.payables.createInvoice(payload) },
      record: { title: { ar: 'إثبات فاتورة مورد', en: 'Record supplier invoice' }, fields: [field('invoiceId', 'معرف الفاتورة', 'Invoice ID', 'text', { required: true, dir: 'ltr' }), idempotencyField()], submit: ({ invoiceId, idempotencyKey }) => accountingApi.operations.payables.recordInvoice(invoiceId, idempotencyKey) },
      payment: { title: { ar: 'تسجيل دفعة مورد', en: 'Record supplier payment' }, fields: [commonEntity(legalEntityId), field('supplierAccountId', 'معرف المورد', 'Supplier account ID', 'text', { required: true, dir: 'ltr' }), field('paymentNumber', 'رقم الدفعة', 'Payment number', 'text', { required: true, dir: 'ltr' }), field('externalReference', 'المرجع الخارجي', 'External reference', 'text', { required: true, dir: 'ltr' }), field('paymentDate', 'تاريخ الدفع', 'Payment date', 'date', { required: true }), field('amount', 'المبلغ', 'Amount', 'number', { required: true, min: 0.01, step: '0.01' }), profile(), idempotencyField()], submit: (payload) => accountingApi.operations.payables.recordPayment(...withoutKey(payload)) },
      allocate: { title: { ar: 'تخصيص دفعة مورد', en: 'Allocate supplier payment' }, fields: [field('paymentId', 'معرف الدفعة', 'Payment ID', 'text', { required: true, dir: 'ltr' }), field('supplierInvoiceId', 'معرف الفاتورة', 'Invoice ID', 'text', { required: true, dir: 'ltr' }), field('amount', 'المبلغ', 'Amount', 'number', { required: true, min: 0.01, step: '0.01' })], submit: ({ paymentId, ...payload }) => accountingApi.operations.payables.allocatePayment(paymentId, payload) },
    },
    expenses: {
      evidence: { title: { ar: 'ربط دليل مالي', en: 'Create source evidence' }, fields: [commonEntity(legalEntityId), field('platformAccountId', 'حساب المنصة (اختياري)', 'Platform account ID (optional)', 'number'), field('evidenceType', 'نوع الدليل', 'Evidence type', 'text', { required: true }), field('externalReference', 'المرجع الخارجي', 'External reference', 'text', { required: true, dir: 'ltr' }), field('storedFileId', 'معرف الملف الخاص', 'Stored file ID', 'text', { required: true, dir: 'ltr' }), field('metadataJson', 'بيانات إضافية JSON', 'Metadata JSON', 'json', { required: true, full: true, defaultValue: '{}' })], submit: (payload) => accountingApi.operations.expenses.createEvidence({ ...payload, metadataJson: JSON.stringify(payload.metadataJson) }) },
      review: { title: { ar: 'مراجعة دليل', en: 'Review evidence' }, fields: [field('evidenceId', 'معرف الدليل', 'Evidence ID', 'text', { required: true, dir: 'ltr' }), field('accept', 'قبول الدليل', 'Accept evidence', 'checkbox'), field('comment', 'تعليق', 'Comment', 'textarea', { full: true })], submit: ({ evidenceId, ...payload }) => accountingApi.operations.expenses.reviewEvidence(evidenceId, payload) },
      claim: { title: { ar: 'تسجيل مطالبة مصروف', en: 'Create expense claim' }, fields: [commonEntity(legalEntityId), field('employeeIqamaNo', 'إقامة الموظف', 'Employee Iqama', 'number', { required: true }), field('sourceEvidenceId', 'معرف الدليل (اختياري)', 'Evidence ID (optional)', 'text', { dir: 'ltr' }), field('claimNumber', 'رقم المطالبة', 'Claim number', 'text', { required: true, dir: 'ltr' }), field('claimDate', 'تاريخ المطالبة', 'Claim date', 'date', { required: true }), field('description', 'الوصف', 'Description', 'textarea', { required: true, full: true }), field('netAmount', 'صافي المبلغ', 'Net amount', 'number', { required: true, min: 0.01, step: '0.01' }), field('taxCodeId', 'رقم الضريبة (اختياري)', 'Tax code ID (optional)', 'number'), profile(), idempotencyField()], submit: (payload) => accountingApi.operations.expenses.createClaim(...withoutKey(payload)) },
    },
    inventory: {
      item: { title: { ar: 'إضافة صنف مخزون', en: 'Create inventory item' }, fields: [commonEntity(legalEntityId), field('sku', 'رمز الصنف', 'SKU', 'text', { required: true, dir: 'ltr' }), field('name', 'اسم الصنف', 'Item name', 'text', { required: true }), field('unitOfMeasure', 'وحدة القياس', 'Unit of measure', 'text', { required: true })], submit: (payload) => accountingApi.operations.inventory.createItem(payload) },
      movement: { title: { ar: 'تسجيل حركة مخزون', en: 'Record inventory movement' }, fields: [commonEntity(legalEntityId), field('inventoryItemId', 'معرف الصنف', 'Inventory item ID', 'text', { required: true, dir: 'ltr' }), field('movementType', 'نوع الحركة', 'Movement type', 'select', { required: true, options: options([[1, 'استلام', 'Receipt'], [2, 'صرف', 'Issue'], [3, 'تحويل', 'Transfer'], [4, 'تسوية', 'Adjustment']]) }), field('movementDate', 'تاريخ الحركة', 'Movement date', 'date', { required: true }), field('reference', 'المرجع', 'Reference', 'text', { required: true, dir: 'ltr' }), field('fromBin', 'من موقع', 'From bin', 'text'), field('toBin', 'إلى موقع', 'To bin', 'text'), field('quantity', 'الكمية', 'Quantity', 'number', { required: true, min: 0.0001, step: '0.0001' }), field('unitCost', 'تكلفة الوحدة', 'Unit cost', 'number', { required: true, min: 0, step: '0.01' }), profile(), idempotencyField()], submit: (payload) => accountingApi.operations.inventory.recordMovement(...withoutKey(payload)) },
    },
    treasury: {
      bank: { title: { ar: 'إضافة حساب بنكي', en: 'Create bank account' }, fields: [commonEntity(legalEntityId), field('code', 'الرمز', 'Code', 'text', { required: true, dir: 'ltr' }), field('name', 'اسم الحساب', 'Account name', 'text', { required: true }), field('currencyCode', 'العملة', 'Currency', 'text', { required: true, defaultValue: 'SAR', dir: 'ltr' }), field('ledgerAccountId', 'رقم حساب الأستاذ', 'Ledger account ID', 'number', { required: true })], submit: (payload) => accountingApi.operations.treasury.createBankAccount(payload) },
      statement: { title: { ar: 'إضافة حركة كشف بنكي', en: 'Record bank statement line' }, fields: [field('bankAccountId', 'معرف الحساب البنكي', 'Bank account ID', 'text', { required: true, dir: 'ltr' }), field('externalReference', 'المرجع الخارجي', 'External reference', 'text', { required: true, dir: 'ltr' }), field('transactionDate', 'تاريخ العملية', 'Transaction date', 'date', { required: true }), field('amount', 'المبلغ', 'Amount', 'number', { required: true, step: '0.01' }), field('description', 'الوصف', 'Description', 'textarea', { required: true, full: true })], submit: (payload) => accountingApi.operations.treasury.createStatementLine(payload) },
      reconcile: { title: { ar: 'مطابقة حركة بنكية', en: 'Reconcile statement line' }, fields: [field('statementLineId', 'معرف حركة الكشف', 'Statement line ID', 'text', { required: true, dir: 'ltr' }), field('financialDocumentId', 'معرف المستند المالي', 'Financial document ID', 'text', { required: true, dir: 'ltr' })], submit: ({ statementLineId, ...payload }) => accountingApi.operations.treasury.reconcileStatementLine(statementLineId, payload) },
    },
    tax: {
      code: { title: { ar: 'إضافة رمز ضريبي', en: 'Create tax code' }, fields: [commonEntity(legalEntityId), field('code', 'الرمز', 'Code', 'text', { required: true, dir: 'ltr' }), field('name', 'الاسم', 'Name', 'text', { required: true }), field('direction', 'الاتجاه', 'Direction', 'select', { required: true, options: options([[1, 'مخرجات', 'Output'], [2, 'مدخلات', 'Input']]) }), field('rate', 'النسبة', 'Rate', 'number', { required: true, min: 0, step: '0.01' }), field('taxAccountId', 'رقم حساب الضريبة', 'Tax account ID', 'number', { required: true }), field('effectiveFrom', 'بداية السريان', 'Effective from', 'date', { required: true }), field('effectiveTo', 'نهاية السريان', 'Effective to', 'date')], submit: (payload) => accountingApi.operations.tax.createCode(payload) },
      return: { title: { ar: 'إعداد إقرار ضريبي', en: 'Prepare tax return' }, fields: [commonEntity(legalEntityId), field('periodStart', 'بداية الفترة', 'Period start', 'date', { required: true }), field('periodEnd', 'نهاية الفترة', 'Period end', 'date', { required: true })], submit: (payload) => accountingApi.operations.tax.createReturn(payload) },
      submit: { title: { ar: 'تقديم الإقرار', en: 'Submit tax return' }, fields: [field('taxReturnId', 'معرف الإقرار', 'Tax return ID', 'text', { required: true, dir: 'ltr' }), field('submissionReference', 'مرجع التقديم', 'Submission reference', 'text', { required: true, dir: 'ltr' })], submit: ({ taxReturnId, ...payload }) => accountingApi.operations.tax.submitReturn(taxReturnId, payload) },
    },
    assets: {
      create: { title: { ar: 'إضافة أصل ثابت', en: 'Create fixed asset' }, fields: [commonEntity(legalEntityId), field('assetNumber', 'رقم الأصل', 'Asset number', 'text', { required: true, dir: 'ltr' }), field('description', 'الوصف', 'Description', 'textarea', { required: true, full: true }), field('acquisitionDate', 'تاريخ الاقتناء', 'Acquisition date', 'date', { required: true }), field('acquisitionCost', 'تكلفة الاقتناء', 'Acquisition cost', 'number', { required: true, min: 0, step: '0.01' }), field('residualValue', 'القيمة المتبقية', 'Residual value', 'number', { required: true, min: 0, step: '0.01' }), field('usefulLifeMonths', 'العمر بالأشهر', 'Useful life months', 'number', { required: true, min: 1 }), field('assetAccountId', 'حساب الأصل', 'Asset account ID', 'number', { required: true }), field('accumulatedDepreciationAccountId', 'مجمع الإهلاك', 'Accumulated depreciation account', 'number', { required: true }), field('depreciationExpenseAccountId', 'مصروف الإهلاك', 'Depreciation expense account', 'number', { required: true })], submit: (payload) => accountingApi.operations.assets.create(payload) },
    },
    budgets: {
      create: { title: { ar: 'إنشاء ميزانية', en: 'Create budget' }, fields: [commonEntity(legalEntityId), field('name', 'اسم الميزانية', 'Budget name', 'text', { required: true }), field('startDate', 'تاريخ البداية', 'Start date', 'date', { required: true }), field('endDate', 'تاريخ النهاية', 'End date', 'date', { required: true }), field('lines', 'بنود الميزانية بصيغة JSON', 'Budget lines as JSON', 'json', { required: true, full: true, defaultValue: '[\n  {"accountId":0, "financialDimensionValueId":null, "amount":0}\n]' })], submit: (payload) => accountingApi.operations.budgets.create(payload) },
    },
  };

  const moduleConfigs = configs[moduleId];
  const actionId = actionIds[moduleId] || Object.keys(moduleConfigs)[0];
  const action = moduleConfigs[actionId];
  const setAction = (value) => setActionIds((current) => ({ ...current, [moduleId]: value }));

  return (
    <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'}>
      <PageHeader eyebrow={text.eyebrow} title={text.title} description={text.description} />
      <FinanceTabs tabs={modules} activeId={moduleId} onChange={setModuleId} label={text.title} />
      {!legalEntityId ? <EmptyState icon={Landmark} title={text.noEntity} /> : (
        <>
          <div className="flex justify-end">
            <select className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold" value={actionId} onChange={(event) => setAction(event.target.value)}>
              {Object.entries(moduleConfigs).map(([id, config]) => <option value={id} key={id}>{isRtl ? config.title.ar : config.title.en}</option>)}
            </select>
          </div>
          <FinanceActionForm key={`${moduleId}-${actionId}`} title={action.title} fields={action.fields} onSubmit={action.submit} />
          <AccountingResourceBrowser resources={resourceGroups[moduleId] ?? []} />
        </>
      )}
    </div>
  );
}
