'use client';

import { API_BASE_URL, ApiService } from './apiService';
import { TokenManager } from '../auth/tokenManager';

const jsonRequest = (endpoint, method, payload, headers = {}) => {
  const options = { method, headers };

  if (payload !== undefined) {
    options.body = JSON.stringify(payload);
  }

  return ApiService.request(endpoint, options);
};

const get = (endpoint, params) => ApiService.get(endpoint, compactParams(params));
const post = (endpoint, payload, headers) => jsonRequest(endpoint, 'POST', payload, headers);
const put = (endpoint, payload, headers) => jsonRequest(endpoint, 'PUT', payload, headers);
const remove = (endpoint) => jsonRequest(endpoint, 'DELETE');

const compactParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

const routeValue = (value) => encodeURIComponent(String(value));

const requireIdempotencyKey = (value) => {
  const key = String(value ?? '').trim();

  if (!key) {
    const error = new Error('Idempotency-Key is required for this accounting operation.');
    error.status = 400;
    throw error;
  }

  return key;
};

const idempotentPost = (endpoint, payload, idempotencyKey, includeKeyInBody = false) => {
  const key = requireIdempotencyKey(idempotencyKey);
  const { idempotencyKey: _bodyKey, ...payloadWithoutKey } = payload ?? {};
  const body = includeKeyInBody
    ? { ...payloadWithoutKey, idempotencyKey: key }
    : payloadWithoutKey;

  return post(endpoint, body, { 'Idempotency-Key': key });
};

const createFormData = (values) => {
  const formData = new FormData();

  Object.entries(values).forEach(([name, value]) => {
    if (value === undefined || value === null) return;

    if (name === 'file') {
      formData.append(name, value);
      return;
    }

    formData.append(name, value instanceof Date ? value.toISOString() : String(value));
  });

  return formData;
};

const uploadForm = (endpoint, values) =>
  ApiService.uploadFormData(
    endpoint,
    typeof FormData !== 'undefined' && values instanceof FormData
      ? values
      : createFormData(values)
  );

const getCurrentLoginPath = () => {
  if (typeof window === 'undefined') return '/admin/login';

  const { pathname } = window.location;
  if (pathname.startsWith('/accountant')) return '/accountant/login';
  if (pathname.startsWith('/member')) return '/member/login';
  return '/admin/login';
};

const redirectAfterUnauthorized = () => {
  TokenManager.clearToken();

  if (typeof window === 'undefined') return;

  const loginPath = getCurrentLoginPath();
  if (window.location.pathname !== loginPath) {
    window.location.href = loginPath;
  }
};

const readErrorPayload = async (response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('json')) {
    return response.json().catch(() => null);
  }

  const detail = await response.text().catch(() => '');
  return detail ? { detail } : null;
};

const toApiError = (response, payload) => {
  const message =
    payload?.title ||
    payload?.error?.description ||
    payload?.error?.code ||
    payload?.detail ||
    `Accounting request failed: ${response.status}`;
  const error = new Error(message);
  error.status = response.status;
  error.detail = payload?.detail;
  error.errorCode = payload?.error?.code;
  error.errorDescription = payload?.error?.description;
  error.fullError = payload;
  return error;
};

const getDownloadFileName = (contentDisposition, fallback) => {
  if (!contentDisposition) return fallback;

  const encodedMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedMatch) {
    try {
      return decodeURIComponent(encodedMatch[1].replace(/^"|"$/g, ''));
    } catch {
      return encodedMatch[1].replace(/^"|"$/g, '');
    }
  }

  const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return plainMatch?.[1] || fallback;
};

const downloadAuthenticatedFile = async (endpoint, fallbackFileName) => {
  const token = TokenManager.getToken();

  if (!token) {
    const error = new Error('Authentication is required to download this accounting file.');
    error.status = 401;
    throw error;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const payload = await readErrorPayload(response);

    if (response.status === 401) {
      redirectAfterUnauthorized();
    }

    throw toApiError(response, payload);
  }

  const blob = await response.blob();
  return {
    blob,
    fileName: getDownloadFileName(
      response.headers.get('content-disposition'),
      fallbackFileName
    ),
    contentType: response.headers.get('content-type') || blob.type || 'application/octet-stream',
  };
};

export const accountingApi = {
  organization: {
    // Backend handoff: live workspace bootstrap route backed by existing entities.
    getCurrent: () => get('/api/organization-settings/current'),
    listLegalEntities: (params = {}) => get('/api/organization-settings/legal-entities', params),
    getLegalEntity: (id) => get(`/api/organization-settings/legal-entities/${routeValue(id)}`),
    createLegalEntity: (payload) => post('/api/organization-settings/legal-entities', payload),
    updateLegalEntity: (id, payload) => put(`/api/organization-settings/legal-entities/${routeValue(id)}`, payload),
    deleteLegalEntity: (id) => remove(`/api/organization-settings/legal-entities/${routeValue(id)}`),
    listPlatformAccounts: (params = {}) => get('/api/organization-settings/platform-accounts', params),
    getPlatformAccount: (id) => get(`/api/organization-settings/platform-accounts/${routeValue(id)}`),
    createPlatformAccount: (payload) => post('/api/organization-settings/platform-accounts', payload),
    updatePlatformAccount: (id, payload) => put(`/api/organization-settings/platform-accounts/${routeValue(id)}`, payload),
    deletePlatformAccount: (id) => remove(`/api/organization-settings/platform-accounts/${routeValue(id)}`),
  },

  files: {
    // Backend handoff: live thin query route
    list: (params = {}) => get('/api/accounting/files', params),
    upload: ({ legalEntityId, retainUntil, file }) =>
      uploadForm('/api/accounting/files', { legalEntityId, retainUntil, file }),
    download: (fileId) =>
      downloadAuthenticatedFile(
        `/api/accounting/files/${routeValue(fileId)}`,
        `accounting-file-${fileId}`
      ),
  },

  imports: {
    // Backend handoff: live thin query route
    listTemplates: (params = {}) => get('/api/accounting/platform-templates', params),
    // Backend handoff: live thin query route
    getTemplate: (templateId) =>
      get(`/api/accounting/platform-templates/${routeValue(templateId)}`),
    createTemplate: (payload) => post('/api/accounting/platform-templates', payload),
    activateTemplate: (templateId, payload) =>
      post(`/api/accounting/platform-templates/${routeValue(templateId)}/activate`, payload),
    upload: ({
      legalEntityId,
      platformAccountId,
      templateId,
      externalReference,
      periodStart,
      periodEnd,
      sourceControlTotal,
      file,
    }) =>
      uploadForm('/api/accounting/platform-imports', {
        legalEntityId,
        platformAccountId,
        templateId,
        externalReference,
        periodStart,
        periodEnd,
        sourceControlTotal,
        file,
      }),
    // Backend handoff: live thin query route
    list: (params = {}) => get('/api/accounting/platform-imports', params),
    getBatch: (importId) =>
      get(`/api/accounting/platform-imports/${routeValue(importId)}`),
    getIssues: (importId) =>
      get(`/api/accounting/platform-imports/${routeValue(importId)}/issues`),
    // Backend handoff: live thin query route
    getFacts: (importId, params = {}) =>
      get(`/api/accounting/platform-imports/${routeValue(importId)}/facts`, params),
    // Backend handoff: live thin query route
    getRows: (importId, params = {}) =>
      get(`/api/accounting/platform-imports/${routeValue(importId)}/rows`, params),
    resolveIssue: (issueId, payload) =>
      post(`/api/accounting/import-issues/${routeValue(issueId)}/resolve`, payload),
    remapWorker: (importId, payload) =>
      post(`/api/accounting/platform-imports/${routeValue(importId)}/worker-remaps`, payload),
    overrideFactValidity: (factId, payload) =>
      post(`/api/accounting/platform-facts/${routeValue(factId)}/validity-override`, payload),
    approve: (importId, payload) =>
      post(`/api/accounting/platform-imports/${routeValue(importId)}/approve`, payload),
    reject: (importId, payload) =>
      post(`/api/accounting/platform-imports/${routeValue(importId)}/reject`, payload),
    // Backend handoff: live thin query route
    reprocess: (importId, payload) =>
      post(`/api/accounting/platform-imports/${routeValue(importId)}/reprocess`, payload),
    // Backend handoff: live thin query route
    retireTemplate: (templateId, payload) =>
      post(`/api/accounting/platform-templates/${routeValue(templateId)}/retire`, payload),
    // Backend handoff: live thin query route
    supersede: (importId, payload) =>
      post(`/api/accounting/platform-imports/${routeValue(importId)}/supersede`, payload),
    downloadSourceFile: (importId) =>
      downloadAuthenticatedFile(
        `/api/accounting/platform-imports/${routeValue(importId)}/file`,
        `platform-import-${importId}`
      ),
  },

  compensation: {
    // Backend handoff: live thin query route
    listPolicies: (params = {}) => get('/api/accounting/compensation-policies', params),
    createPolicy: (payload) => post('/api/accounting/compensation-policies', payload),
    getPolicy: (policyId) =>
      get(`/api/accounting/compensation-policies/${routeValue(policyId)}`),
    activatePolicy: (policyId, payload) =>
      post(`/api/accounting/compensation-policies/${routeValue(policyId)}/activate`, payload),
    simulatePolicy: (policyId, payload) =>
      post(`/api/accounting/compensation-policies/${routeValue(policyId)}/simulate`, payload),
    // Backend handoff: live thin query route
    createVersion: (policyId, payload) =>
      post(`/api/accounting/compensation-policies/${routeValue(policyId)}/versions`, payload),
    // Backend handoff: live thin query route
    retire: (policyId, payload) =>
      post(`/api/accounting/compensation-policies/${routeValue(policyId)}/retire`, payload),
  },

  payroll: {
    // Backend handoff: live thin query route
    listRuns: (params = {}) => get('/api/accounting/payroll-runs', params),
    createRun: (payload) => post('/api/accounting/payroll-runs', payload),
    getRun: (runId) => get(`/api/accounting/payroll-runs/${routeValue(runId)}`),
    calculateRun: (runId, payload) =>
      post(`/api/accounting/payroll-runs/${routeValue(runId)}/calculate`, payload),
    addAdjustment: (runId, payload) =>
      post(`/api/accounting/payroll-runs/${routeValue(runId)}/adjustments`, payload),
    approveRun: (runId, payload, idempotencyKey = payload?.idempotencyKey) =>
      idempotentPost(
        `/api/accounting/payroll-runs/${routeValue(runId)}/approve`,
        payload,
        idempotencyKey
      ),
    reverseRun: (runId, payload, idempotencyKey = payload?.idempotencyKey) =>
      idempotentPost(
        `/api/accounting/payroll-runs/${routeValue(runId)}/reverse`,
        payload,
        idempotencyKey
      ),
    createFinancialItemType: (payload) =>
      post('/api/accounting/rider-financial-item-types', payload),
    // Backend handoff: live thin query route
    listItemTypes: (params = {}) =>
      get('/api/accounting/rider-financial-item-types', params),
    createFinancialItem: (payload) =>
      post('/api/accounting/rider-financial-items', payload),
    // Backend handoff: live thin query route
    listItems: (params = {}) => get('/api/accounting/rider-financial-items', params),
    // Backend handoff: live thin query route
    getItem: (itemId) =>
      get(`/api/accounting/rider-financial-items/${routeValue(itemId)}`),
    getRiderFinancialProfile: (riderIqamaNo, legalEntityId) =>
      get(`/api/accounting/riders/${routeValue(riderIqamaNo)}/financial-profile`, {
        legalEntityId,
      }),
  },

  payments: {
    // Backend handoff: live thin query route
    list: (params = {}) => get('/api/accounting/payment-batches', params),
    // Backend handoff: live thin query route
    get: (batchId) => get(`/api/accounting/payment-batches/${routeValue(batchId)}`),
    createBatch: (runId, payload) =>
      post(`/api/accounting/payroll-runs/${routeValue(runId)}/payment-batches`, payload),
    exportBatch: (batchId, payload) =>
      post(`/api/accounting/payment-batches/${routeValue(batchId)}/export`, payload),
    confirmBatch: (batchId, payload, idempotencyKey = payload?.idempotencyKey) =>
      idempotentPost(
        `/api/accounting/payment-batches/${routeValue(batchId)}/confirm`,
        payload,
        idempotencyKey
      ),
    reverseBatch: (batchId, payload, idempotencyKey = payload?.idempotencyKey) =>
      idempotentPost(
        `/api/accounting/payment-batches/${routeValue(batchId)}/reverse`,
        payload,
        idempotencyKey
      ),
    // Backend handoff: live thin query route
    rejectLine: (batchId, lineId, payload) =>
      post(
        `/api/accounting/payment-batches/${routeValue(batchId)}/lines/${routeValue(
          lineId
        )}/reject`,
        payload
      ),
  },

  ledger: {
    // Backend handoff: live thin query route
    listCurrencies: (params = {}) => get('/api/ledger/currencies', params),
    createCurrency: (payload) => post('/api/ledger/currencies', payload),
    // Backend handoff: live thin query route
    listExchangeRates: (legalEntityId, params = {}) =>
      get(`/api/ledger/legal-entities/${routeValue(legalEntityId)}/exchange-rates`, params),
    createExchangeRate: (payload) => post('/api/ledger/exchange-rates', payload),
    // Backend handoff: live thin query route
    listDimensions: (legalEntityId, params = {}) =>
      get(`/api/ledger/legal-entities/${routeValue(legalEntityId)}/dimensions`, params),
    createDimension: (payload) => post('/api/ledger/dimensions', payload),
    // Backend handoff: live thin query route
    listDimensionValues: (financialDimensionId, params = {}) =>
      get(`/api/ledger/dimensions/${routeValue(financialDimensionId)}/values`, params),
    createDimensionValue: (payload) => post('/api/ledger/dimension-values', payload),
    getAccounts: (legalEntityId) =>
      get(`/api/ledger/legal-entities/${routeValue(legalEntityId)}/accounts`),
    createAccount: (payload) => post('/api/ledger/accounts', payload),
    // Backend handoff: live thin query route
    listPostingProfiles: (legalEntityId, params = {}) =>
      get(
        `/api/ledger/legal-entities/${routeValue(legalEntityId)}/posting-profiles`,
        params
      ),
    // Backend handoff: live thin query route
    getPostingProfile: (postingProfileId) =>
      get(`/api/ledger/posting-profiles/${routeValue(postingProfileId)}`),
    createPostingProfile: (payload) => post('/api/ledger/posting-profiles', payload),
    // Backend handoff: live thin query route
    listFiscalYears: (legalEntityId, params = {}) =>
      get(`/api/ledger/legal-entities/${routeValue(legalEntityId)}/fiscal-years`, params),
    createFiscalYear: (payload) => post('/api/ledger/fiscal-years', payload),
    getFiscalYear: (fiscalYearId) =>
      get(`/api/ledger/fiscal-years/${routeValue(fiscalYearId)}`),
    softClosePeriod: (periodId, payload) =>
      post(`/api/ledger/fiscal-periods/${routeValue(periodId)}/soft-close`, payload),
    closePeriod: (periodId, payload) =>
      post(`/api/ledger/fiscal-periods/${routeValue(periodId)}/close`, payload),
    reopenPeriod: (periodId, payload) =>
      post(`/api/ledger/fiscal-periods/${routeValue(periodId)}/reopen`, payload),
    // Backend handoff: live thin query route
    listRecurringJournalSchedules: (legalEntityId, params = {}) =>
      get(
        `/api/ledger/legal-entities/${routeValue(
          legalEntityId
        )}/recurring-journal-schedules`,
        params
      ),
    // Backend handoff: live thin query route
    getRecurringSchedule: (scheduleId) =>
      get(`/api/ledger/recurring-journal-schedules/${routeValue(scheduleId)}`),
    createRecurringJournalSchedule: (payload) =>
      post('/api/ledger/recurring-journal-schedules', payload),
    generateRecurringJournalSchedules: (throughDate) =>
      post(`/api/ledger/recurring-journal-schedules/generate?${new URLSearchParams({
        throughDate,
      }).toString()}`),
    createManualJournal: (payload, idempotencyKey = payload?.idempotencyKey) =>
      idempotentPost('/api/ledger/manual-journals', payload, idempotencyKey, true),
    getDocument: (documentId) =>
      get(`/api/ledger/documents/${routeValue(documentId)}`),
    submitDocument: (documentId) =>
      post(`/api/ledger/documents/${routeValue(documentId)}/submit`),
    approveDocument: (documentId, payload) =>
      post(`/api/ledger/documents/${routeValue(documentId)}/approve`, payload),
    postDocument: (documentId) =>
      post(`/api/ledger/documents/${routeValue(documentId)}/post`),
    reverseDocument: (documentId, payload, idempotencyKey = payload?.idempotencyKey) =>
      idempotentPost(
        `/api/ledger/documents/${routeValue(documentId)}/reversals`,
        payload,
        idempotencyKey,
        true
      ),
    // Backend handoff: live thin query route
    listDocuments: (legalEntityId, params = {}) =>
      get(`/api/ledger/legal-entities/${routeValue(legalEntityId)}/documents`, params),
    // Backend handoff: live thin query route
    listJournalEntries: (legalEntityId, params = {}) =>
      get(`/api/ledger/legal-entities/${routeValue(legalEntityId)}/journal-entries`, params),
    getApprovalInbox: (legalEntityId) =>
      get(`/api/ledger/legal-entities/${routeValue(legalEntityId)}/approval-inbox`),
  },

  reports: {
    getTrialBalance: (legalEntityId, { fromDate, toDate }) =>
      get(`/api/ledger/legal-entities/${routeValue(legalEntityId)}/trial-balance`, {
        fromDate,
        toDate,
      }),
    getProfitAndLoss: (legalEntityId, { fromDate, toDate }) =>
      get(`/api/ledger/legal-entities/${routeValue(legalEntityId)}/profit-and-loss`, {
        fromDate,
        toDate,
      }),
    getBalanceSheet: (legalEntityId, asOfDate) =>
      get(`/api/ledger/legal-entities/${routeValue(legalEntityId)}/balance-sheet`, {
        asOfDate,
      }),
    getCashMovement: (legalEntityId, { fromDate, toDate }) =>
      get(`/api/ledger/legal-entities/${routeValue(legalEntityId)}/cash-movement`, {
        fromDate,
        toDate,
      }),
    getDimensionBalances: (
      legalEntityId,
      financialDimensionId,
      { fromDate, toDate }
    ) =>
      get(
        `/api/ledger/legal-entities/${routeValue(legalEntityId)}/dimensions/${routeValue(
          financialDimensionId
        )}/balances`,
        { fromDate, toDate }
      ),
    getAuditEvents: (legalEntityId, take) =>
      get(`/api/ledger/legal-entities/${routeValue(legalEntityId)}/audit-events`, { take }),
  },

  operations: {
    receivables: {
      // Backend handoff: live thin query route
      listCustomers: (params = {}) =>
        get('/api/accounting/receivables/customers', params),
      // Backend handoff: live thin query route
      getCustomer: (customerId) =>
        get(`/api/accounting/receivables/customers/${routeValue(customerId)}`),
      createCustomer: (payload) => post('/api/accounting/receivables/customers', payload),
      // Backend handoff: live thin query route
      listInvoices: (params = {}) =>
        get('/api/accounting/receivables/invoices', params),
      // Backend handoff: live thin query route
      getInvoice: (invoiceId) =>
        get(`/api/accounting/receivables/invoices/${routeValue(invoiceId)}`),
      createInvoice: (payload) => post('/api/accounting/receivables/invoices', payload),
      issueInvoice: (invoiceId, idempotencyKey) =>
        idempotentPost(
          `/api/accounting/receivables/invoices/${routeValue(invoiceId)}/issue`,
          {},
          idempotencyKey
        ),
      // Backend handoff: live thin query route
      listReceipts: (params = {}) =>
        get('/api/accounting/receivables/receipts', params),
      // Backend handoff: live thin query route
      getReceipt: (receiptId) =>
        get(`/api/accounting/receivables/receipts/${routeValue(receiptId)}`),
      recordReceipt: (payload, idempotencyKey) =>
        idempotentPost('/api/accounting/receivables/receipts', payload, idempotencyKey),
      allocateReceipt: (receiptId, payload) =>
        post(`/api/accounting/receivables/receipts/${routeValue(receiptId)}/allocations`, payload),
      recordPlatformSettlement: (payload, idempotencyKey) =>
        idempotentPost(
          '/api/accounting/receivables/platform-settlements',
          payload,
          idempotencyKey
        ),
      // Backend handoff: live thin query route
      listPlatformSettlements: (params = {}) =>
        get('/api/accounting/receivables/platform-settlements', params),
      // Backend handoff: live thin query route
      getPlatformSettlement: (settlementId) =>
        get(
          `/api/accounting/receivables/platform-settlements/${routeValue(settlementId)}`
        ),
    },
    payables: {
      // Backend handoff: live thin query route
      listSuppliers: (params = {}) => get('/api/accounting/payables/suppliers', params),
      // Backend handoff: live thin query route
      getSupplier: (supplierId) =>
        get(`/api/accounting/payables/suppliers/${routeValue(supplierId)}`),
      createSupplier: (payload) => post('/api/accounting/payables/suppliers', payload),
      // Backend handoff: live thin query route
      listInvoices: (params = {}) => get('/api/accounting/payables/invoices', params),
      // Backend handoff: live thin query route
      getInvoice: (invoiceId) =>
        get(`/api/accounting/payables/invoices/${routeValue(invoiceId)}`),
      createInvoice: (payload) => post('/api/accounting/payables/invoices', payload),
      recordInvoice: (invoiceId, idempotencyKey) =>
        idempotentPost(
          `/api/accounting/payables/invoices/${routeValue(invoiceId)}/record`,
          {},
          idempotencyKey
        ),
      // Backend handoff: live thin query route
      listPayments: (params = {}) => get('/api/accounting/payables/payments', params),
      // Backend handoff: live thin query route
      getPayment: (paymentId) =>
        get(`/api/accounting/payables/payments/${routeValue(paymentId)}`),
      recordPayment: (payload, idempotencyKey) =>
        idempotentPost('/api/accounting/payables/payments', payload, idempotencyKey),
      allocatePayment: (paymentId, payload) =>
        post(`/api/accounting/payables/payments/${routeValue(paymentId)}/allocations`, payload),
    },
    expenses: {
      // Backend handoff: live thin query route
      listEvidence: (params = {}) => get('/api/accounting/expenses/evidence', params),
      // Backend handoff: live thin query route
      getEvidence: (evidenceId) =>
        get(`/api/accounting/expenses/evidence/${routeValue(evidenceId)}`),
      createEvidence: (payload) => post('/api/accounting/expenses/evidence', payload),
      reviewEvidence: (evidenceId, payload) =>
        post(`/api/accounting/expenses/evidence/${routeValue(evidenceId)}/review`, payload),
      // Backend handoff: live thin query route
      listClaims: (params = {}) => get('/api/accounting/expenses/claims', params),
      // Backend handoff: live thin query route
      getClaim: (claimId) =>
        get(`/api/accounting/expenses/claims/${routeValue(claimId)}`),
      createClaim: (payload, idempotencyKey) =>
        idempotentPost('/api/accounting/expenses/claims', payload, idempotencyKey),
    },
    inventory: {
      // Backend handoff: live thin query route
      listItems: (params = {}) => get('/api/accounting/inventory/items', params),
      // Backend handoff: live thin query route
      getItem: (itemId) =>
        get(`/api/accounting/inventory/items/${routeValue(itemId)}`),
      createItem: (payload) => post('/api/accounting/inventory/items', payload),
      // Backend handoff: live thin query route
      listMovements: (params = {}) =>
        get('/api/accounting/inventory/movements', params),
      // Backend handoff: live thin query route
      getMovement: (movementId) =>
        get(`/api/accounting/inventory/movements/${routeValue(movementId)}`),
      recordMovement: (payload, idempotencyKey) =>
        idempotentPost('/api/accounting/inventory/movements', payload, idempotencyKey),
      // Backend handoff: live thin query route
      getStockBalances: (params = {}) =>
        get('/api/accounting/inventory/stock-balances', params),
    },
    treasury: {
      // Backend handoff: live thin query route
      listBankAccounts: (params = {}) =>
        get('/api/accounting/treasury/bank-accounts', params),
      // Backend handoff: live thin query route
      getBankAccount: (bankAccountId) =>
        get(`/api/accounting/treasury/bank-accounts/${routeValue(bankAccountId)}`),
      createBankAccount: (payload) =>
        post('/api/accounting/treasury/bank-accounts', payload),
      // Backend handoff: live thin query route
      listStatementLines: (params = {}) =>
        get('/api/accounting/treasury/statement-lines', params),
      // Backend handoff: live thin query route
      getStatementLine: (statementLineId) =>
        get(`/api/accounting/treasury/statement-lines/${routeValue(statementLineId)}`),
      createStatementLine: (payload) =>
        post('/api/accounting/treasury/statement-lines', payload),
      reconcileStatementLine: (statementLineId, payload) =>
        post(
          `/api/accounting/treasury/statement-lines/${routeValue(statementLineId)}/reconcile`,
          payload
        ),
    },
    tax: {
      // Backend handoff: live thin query route
      listCodes: (params = {}) => get('/api/accounting/tax/codes', params),
      // Backend handoff: live thin query route
      getCode: (taxCodeId) =>
        get(`/api/accounting/tax/codes/${routeValue(taxCodeId)}`),
      createCode: (payload) => post('/api/accounting/tax/codes', payload),
      // Backend handoff: live thin query route
      listReturns: (params = {}) => get('/api/accounting/tax/returns', params),
      // Backend handoff: live thin query route
      getReturn: (taxReturnId) =>
        get(`/api/accounting/tax/returns/${routeValue(taxReturnId)}`),
      createReturn: (payload) => post('/api/accounting/tax/returns', payload),
      submitReturn: (taxReturnId, payload) =>
        post(`/api/accounting/tax/returns/${routeValue(taxReturnId)}/submit`, payload),
    },
    assets: {
      // Backend handoff: live thin query route
      list: (params = {}) => get('/api/accounting/assets', params),
      // Backend handoff: live thin query route
      get: (assetId) => get(`/api/accounting/assets/${routeValue(assetId)}`),
      create: (payload) => post('/api/accounting/assets', payload),
    },
    budgets: {
      // Backend handoff: live thin query route
      list: (params = {}) => get('/api/accounting/budgets', params),
      // Backend handoff: live thin query route
      get: (budgetId) => get(`/api/accounting/budgets/${routeValue(budgetId)}`),
      create: (payload) => post('/api/accounting/budgets', payload),
    },
  },

  access: {
    grant: (payload) => post('/api/financial-access', payload),
    listByLegalEntity: (legalEntityId) =>
      get(`/api/financial-access/legal-entities/${routeValue(legalEntityId)}`),
    revoke: (legalEntityId, userId) =>
      remove(
        `/api/financial-access/legal-entities/${routeValue(legalEntityId)}/users/${routeValue(
          userId
        )}`
      ),
    grantCashDelivery: (payload) => post('/api/accounting/cash-delivery-access', payload),
    // Backend handoff: live thin query route
    listCashDelivery: (params = {}) =>
      get('/api/accounting/cash-delivery-access', params),
    // Backend handoff: live thin query route
    revokeCashDelivery: (accessId) =>
      remove(`/api/accounting/cash-delivery-access/${routeValue(accessId)}`),
  },

  cashDelivery: {
    // Backend handoff: live thin query route
    inbox: (params = {}) => get('/api/accounting/cash-deliveries/inbox', params),
    // Backend handoff: live thin query route
    getBatch: (batchId) =>
      get(`/api/accounting/cash-deliveries/payment-batches/${routeValue(batchId)}`),
    confirmPaymentBatch: (
      batchId,
      payload,
      idempotencyKey = payload?.idempotencyKey
    ) =>
      idempotentPost(
        `/api/accounting/cash-deliveries/payment-batches/${routeValue(batchId)}/confirm`,
        payload,
        idempotencyKey
      ),
  },
};

export default accountingApi;
