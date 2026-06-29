import { ApiService } from './apiService';
import { API_ENDPOINTS } from './endpoints';

const { ACCOUNTING } = API_ENDPOINTS;

const compactParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

const withDayBounds = (fromDate, toDate) => ({
  fromDate: fromDate ? `${fromDate}T00:00:00` : fromDate,
  toDate: toDate ? `${toDate}T23:59:59` : toDate,
});

export const accountingService = {
  account: {
    getCurrent: () => ApiService.get(ACCOUNTING.ACCOUNT.ME),
    updateInfo: (payload) => ApiService.put(ACCOUNTING.ACCOUNT.UPDATE_INFO, payload),
    changePassword: (payload) => ApiService.put(ACCOUNTING.ACCOUNT.CHANGE_PASSWORD, payload),
  },

  suppliers: {
    list: () => ApiService.get(ACCOUNTING.SUPPLIERS.LIST),
    getById: (id) => ApiService.get(ACCOUNTING.SUPPLIERS.BY_ID(id)),
    create: (payload) => ApiService.post(ACCOUNTING.SUPPLIERS.CREATE, payload),
    update: (id, payload) => ApiService.put(ACCOUNTING.SUPPLIERS.UPDATE(id), payload),
    delete: (id) => ApiService.delete(ACCOUNTING.SUPPLIERS.DELETE(id)),
    toggleActive: (id) => ApiService.patch(ACCOUNTING.SUPPLIERS.TOGGLE_ACTIVE(id)),
    search: (search) => ApiService.get(ACCOUNTING.SUPPLIERS.SEARCH, compactParams({ search })),
  },

  spareParts: {
    list: () => ApiService.get(ACCOUNTING.SPARE_PARTS.LIST),
    listAvailable: () => ApiService.get(ACCOUNTING.SPARE_PARTS.AVAILABLE),
    getById: (id) => ApiService.get(ACCOUNTING.SPARE_PARTS.BY_ID(id)),
    create: (payload) => ApiService.post(ACCOUNTING.SPARE_PARTS.CREATE, payload),
    update: (id, payload) => ApiService.put(ACCOUNTING.SPARE_PARTS.UPDATE(id), payload),
    delete: (id) => ApiService.delete(ACCOUNTING.SPARE_PARTS.DELETE(id)),
    search: (search) => ApiService.get(ACCOUNTING.SPARE_PARTS.SEARCH, compactParams({ search })),
    recordUsage: (payload, date) =>
      ApiService.post(ACCOUNTING.SPARE_PARTS.RECORD_USAGE, payload, compactParams({ date })),
    getHistory: (id) => ApiService.get(ACCOUNTING.SPARE_PARTS.HISTORY(id)),
    getVehicleHistory: (vehicleNumber) =>
      ApiService.get(ACCOUNTING.SPARE_PARTS.VEHICLE_HISTORY(vehicleNumber)),
    updateUsage: (usageId, payload) => ApiService.put(ACCOUNTING.SPARE_PARTS.UPDATE_USAGE(usageId), payload),
    deleteUsage: (usageId) => ApiService.delete(ACCOUNTING.SPARE_PARTS.DELETE_USAGE(usageId)),
  },

  riderAccessories: {
    list: () => ApiService.get(ACCOUNTING.RIDER_ACCESSORIES.LIST),
    listAvailable: () => ApiService.get(ACCOUNTING.RIDER_ACCESSORIES.AVAILABLE),
    getById: (id) => ApiService.get(ACCOUNTING.RIDER_ACCESSORIES.BY_ID(id)),
    create: (payload) => ApiService.post(ACCOUNTING.RIDER_ACCESSORIES.CREATE, payload),
    update: (id, payload) => ApiService.put(ACCOUNTING.RIDER_ACCESSORIES.UPDATE(id), payload),
    delete: (id) => ApiService.delete(ACCOUNTING.RIDER_ACCESSORIES.DELETE(id)),
    search: (search) => ApiService.get(ACCOUNTING.RIDER_ACCESSORIES.SEARCH, compactParams({ search })),
    recordUsage: (payload, date) =>
      ApiService.post(ACCOUNTING.RIDER_ACCESSORIES.RECORD_USAGE, payload, compactParams({ date })),
    getHistory: (id) => ApiService.get(ACCOUNTING.RIDER_ACCESSORIES.HISTORY(id)),
    getRiderHistory: (riderId) => ApiService.get(ACCOUNTING.RIDER_ACCESSORIES.BY_RIDER(riderId)),
  },

  bills: {
    list: () => ApiService.get(ACCOUNTING.BILLS.LIST),
    getById: (id) => ApiService.get(ACCOUNTING.BILLS.BY_ID(id)),
    create: (payload) => ApiService.post(ACCOUNTING.BILLS.CREATE, payload),
    update: (id, payload) => ApiService.put(ACCOUNTING.BILLS.UPDATE(id), payload),
    delete: (id) => ApiService.delete(ACCOUNTING.BILLS.DELETE(id)),
    getByDateRange: (fromDate, toDate) =>
      ApiService.get(ACCOUNTING.BILLS.BY_DATE_RANGE, compactParams({ fromDate, toDate })),
    getBySupplier: (supplierId) => ApiService.get(ACCOUNTING.BILLS.BY_SUPPLIER(supplierId)),
  },

  returns: {
    list: () => ApiService.get(ACCOUNTING.RETURNS.LIST),
    getById: (id) => ApiService.get(ACCOUNTING.RETURNS.BY_ID(id)),
    create: (payload) => ApiService.post(ACCOUNTING.RETURNS.CREATE, payload),
    update: (id, payload) => ApiService.put(ACCOUNTING.RETURNS.UPDATE(id), payload),
    delete: (id) => ApiService.delete(ACCOUNTING.RETURNS.DELETE(id)),
  },

  transfers: {
    list: () => ApiService.get(ACCOUNTING.TRANSFERS.LIST),
    getById: (id) => ApiService.get(ACCOUNTING.TRANSFERS.BY_ID(id)),
    create: (payload) => ApiService.post(ACCOUNTING.TRANSFERS.CREATE, payload),
    update: (id, payload) => ApiService.put(ACCOUNTING.TRANSFERS.UPDATE(id), payload),
    delete: (id) => ApiService.delete(ACCOUNTING.TRANSFERS.DELETE(id)),
    getByHousing: (housingId) => ApiService.get(ACCOUNTING.TRANSFERS.BY_HOUSING(housingId)),
  },

  reports: {
    getVehicleRiderCosts: (fromDate, toDate) =>
      ApiService.get(ACCOUNTING.REPORTS.VEHICLE_RIDER_COSTS, compactParams({ fromDate, toDate })),
    getAllHousingCosts: (fromDate, toDate) =>
      ApiService.get(ACCOUNTING.REPORTS.ALL_HOUSING_COSTS, compactParams({ fromDate, toDate })),
    getAllHousingCostDetails: (fromDate, toDate) =>
      ApiService.get(ACCOUNTING.REPORTS.ALL_HOUSING_COST_DETAILS, compactParams({ fromDate, toDate })),
    getSparePartsMovement: (fromDate, toDate) =>
      ApiService.get(ACCOUNTING.REPORTS.SPARE_PARTS_MOVEMENT, compactParams(withDayBounds(fromDate, toDate))),
    getRiderAccessoriesMovement: (fromDate, toDate) =>
      ApiService.get(ACCOUNTING.REPORTS.RIDER_ACCESSORIES_MOVEMENT, compactParams(withDayBounds(fromDate, toDate))),
    getHungerSummary: (startDate, endDate) =>
      ApiService.get(ACCOUNTING.REPORTS.HUNGER_SUMMARY, compactParams({ startDate, endDate })),
    getHungerDetailedDailyPerformance: (startDate, endDate) =>
      ApiService.get(ACCOUNTING.REPORTS.HUNGER_DETAILED_DAILY_PERFORMANCE, compactParams({ startDate, endDate })),
    getHungerRejection: (startDate, endDate) =>
      ApiService.get(ACCOUNTING.REPORTS.HUNGER_REJECTION, compactParams({ startDate, endDate })),
    getKetaRejection: (startDate, endDate) =>
      ApiService.get(ACCOUNTING.REPORTS.KETA_REJECTION, compactParams({ startDate, endDate })),
    getHungerMonthlyValidation: (year, month) =>
      ApiService.get(ACCOUNTING.REPORTS.HUNGER_MONTHLY_VALIDATION, compactParams({ year, month })),
    getKetaDailySummary: (reportDate) =>
      ApiService.get(ACCOUNTING.REPORTS.KETA_DAILY_SUMMARY, compactParams({ reportDate })),
    getKetaDailyRiderDetails: (reportDate) =>
      ApiService.get(ACCOUNTING.REPORTS.KETA_DAILY_RIDER_DETAILS, compactParams({ reportDate })),
    getKetaCumulativeStats: (startDate, endDate) =>
      ApiService.get(ACCOUNTING.REPORTS.KETA_CUMULATIVE_STATS, compactParams({ startDate, endDate })),
    getKetaValidationShifts: (from, to) =>
      ApiService.get(ACCOUNTING.REPORTS.KETA_VALIDATION_SHIFTS, compactParams({ from, to })),
    importKetaValidationShifts: (file, uploadedBy = 'system') => {
      const formData = new FormData();
      formData.append('file', file);
      return ApiService.uploadFormData(
        `${ACCOUNTING.REPORTS.KETA_VALIDATION_IMPORT}?${new URLSearchParams({ uploadedBy }).toString()}`,
        formData
      );
    },
    getCompanyPerformance: ({ startDate, endDate, companyId } = {}) =>
      ApiService.get(ACCOUNTING.REPORTS.COMPANY_PERFORMANCE, compactParams({ startDate, endDate, companyId })),
    compareCompanyPeriods: (params) =>
      ApiService.get(ACCOUNTING.REPORTS.COMPARE_COMPANY_PERIODS, compactParams(params)),
  },

  wallet: {
    importFile: (file, date) => {
      const formData = new FormData();
      formData.append('file', file);
      return ApiService.uploadFormData(
        `${ACCOUNTING.WALLET.IMPORT}?${new URLSearchParams(compactParams({ date })).toString()}`,
        formData
      );
    },
    list: () => ApiService.get(ACCOUNTING.WALLET.LIST),
  },

  dashboard: {
    getCompanies: ({ startDate, endDate, companyId } = {}) =>
      ApiService.get(
        ACCOUNTING.DASHBOARD.COMPANIES,
        compactParams({ StartDate: startDate, EndDate: endDate, CompanyId: companyId })
      ),
    getOverview: () => ApiService.get(ACCOUNTING.DASHBOARD.OVERVIEW),
    getOrdersByCompany: (year, month) =>
      ApiService.get(ACCOUNTING.DASHBOARD.ORDERS_BY_COMPANY, compactParams({ year, month })),
    getOrdersTrend: (months) =>
      ApiService.get(ACCOUNTING.DASHBOARD.ORDERS_TREND, compactParams({ months })),
    getDailyOrders: ({ days, companyId } = {}) =>
      ApiService.get(ACCOUNTING.DASHBOARD.DAILY_ORDERS, compactParams({ days, companyId })),
    getTopRiders: ({ year, month, top, companyId } = {}) =>
      ApiService.get(ACCOUNTING.DASHBOARD.TOP_RIDERS, compactParams({ year, month, top, companyId })),
    getRidersByCompany: () => ApiService.get(ACCOUNTING.DASHBOARD.RIDERS_BY_COMPANY),
  },

  lookups: {
    getHousing: () => ApiService.get(ACCOUNTING.LOOKUPS.HOUSING),
    getVehicles: () => ApiService.get(ACCOUNTING.LOOKUPS.VEHICLES),
    getRiders: () => ApiService.get(ACCOUNTING.LOOKUPS.RIDERS),
    getCompanies: () => ApiService.get(ACCOUNTING.LOOKUPS.COMPANIES),
  },

  companyBillImports: {
    importFile: ({ file, year, month, companyId, templateType, notes }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('year', year);
      formData.append('month', month);
      if (companyId) formData.append('companyId', companyId);
      if (templateType) formData.append('templateType', templateType);
      if (notes) formData.append('notes', notes);
      return ApiService.uploadFormData(ACCOUNTING.COMPANY_BILL_IMPORTS.IMPORT, formData);
    },
    getById: (importId) => ApiService.get(ACCOUNTING.COMPANY_BILL_IMPORTS.BY_ID(importId)),
    approve: (importId) => ApiService.post(ACCOUNTING.COMPANY_BILL_IMPORTS.APPROVE(importId), { importId }),
    reverse: (importId) => ApiService.post(ACCOUNTING.COMPANY_BILL_IMPORTS.REVERSE(importId), { importId }),
    getInfo: (companyId) => ApiService.get(ACCOUNTING.COMPANY_BILL_IMPORTS.COMPANY_INFO(companyId)),
    list: (companyId, params = {}) =>
      ApiService.get(ACCOUNTING.COMPANY_BILL_IMPORTS.COMPANY_LIST(companyId), compactParams(params)),
    importCompanyFile: ({ file, year, month, companyId, templateCode, uploadEndpoint, notes }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('year', year);
      formData.append('month', month);
      if (notes) formData.append('notes', notes);
      return ApiService.uploadFormData(
        uploadEndpoint || ACCOUNTING.COMPANY_BILL_IMPORTS.COMPANY_UPLOAD(companyId, templateCode),
        formData
      );
    },
    getCompanyImportById: (companyId, importId) =>
      ApiService.get(ACCOUNTING.COMPANY_BILL_IMPORTS.COMPANY_BY_ID(companyId, importId)),
    approveCompanyImport: (companyId, importId) =>
      ApiService.post(ACCOUNTING.COMPANY_BILL_IMPORTS.COMPANY_APPROVE(companyId, importId)),
    reverseCompanyImport: (companyId, importId) =>
      ApiService.post(ACCOUNTING.COMPANY_BILL_IMPORTS.COMPANY_REVERSE(companyId, importId)),
  },

  salaries: {
    generate: (payload) => ApiService.post(ACCOUNTING.SALARIES.GENERATE, payload),
    getById: (salaryId) => ApiService.get(ACCOUNTING.SALARIES.BY_ID(salaryId)),
    approve: (salaryId) => ApiService.post(ACCOUNTING.SALARIES.APPROVE(salaryId), { salaryId }),
    reverse: (salaryId) => ApiService.post(ACCOUNTING.SALARIES.REVERSE(salaryId), { salaryId }),
  },

  bonusRules: {
    list: (companyId) => ApiService.get(ACCOUNTING.BONUS_RULES.LIST, compactParams({ companyId })),
    create: (payload) => ApiService.post(ACCOUNTING.BONUS_RULES.CREATE, payload),
  },

  financialItemTypes: {
    create: (payload) => ApiService.post(ACCOUNTING.FINANCIAL_ITEM_TYPES.CREATE, payload),
  },

  financialItems: {
    create: (payload) => ApiService.post(ACCOUNTING.FINANCIAL_ITEMS.CREATE, payload),
    createInternetReplacementBulk: (payload) =>
      ApiService.post(ACCOUNTING.FINANCIAL_ITEMS.INTERNET_REPLACEMENT_BULK, payload),
  },

  fixedEarnings: {
    createMonthly: (payload) => ApiService.post(ACCOUNTING.FIXED_EARNINGS.MONTHLY, payload),
  },

  loans: {
    create: (payload) => ApiService.post(ACCOUNTING.LOANS.CREATE, payload),
  },

  payments: {
    createBankBatch: (payload) => ApiService.post(ACCOUNTING.PAYMENTS.BANK_BATCHES, payload),
    sendBankBatch: (batchId) => ApiService.post(ACCOUNTING.PAYMENTS.BANK_BATCH_SEND(batchId), { batchId }),
    confirmBankBatch: (batchId, payload) => ApiService.post(ACCOUNTING.PAYMENTS.BANK_BATCH_CONFIRM(batchId), payload),
    reversePayment: (paymentId) => ApiService.post(ACCOUNTING.PAYMENTS.REVERSE(paymentId), { paymentId }),
    createCashBatch: (payload) => ApiService.post(ACCOUNTING.PAYMENTS.CASH_BATCHES, payload),
    bankBatchExportUrl: (batchId) => ACCOUNTING.PAYMENTS.BANK_BATCH_EXPORT(batchId),
    cashBatchExportUrl: (batchId) => ACCOUNTING.PAYMENTS.CASH_BATCH_EXPORT(batchId),
  },

  riderAccounting: {
    getProfile: (riderId, from, to) =>
      ApiService.get(ACCOUNTING.RIDER_ACCOUNTING.PROFILE(riderId), compactParams({ from, to })),
  },

  accountingReports: {
    getTrialBalance: (from, to, companyId) =>
      ApiService.get(
        companyId ? ACCOUNTING.ACCOUNTING_REPORTS.COMPANY_TRIAL_BALANCE(companyId) : ACCOUNTING.ACCOUNTING_REPORTS.TRIAL_BALANCE,
        compactParams({ from, to })
      ),
    getGeneralLedger: (from, to, accountId, companyId) =>
      ApiService.get(
        companyId ? ACCOUNTING.ACCOUNTING_REPORTS.COMPANY_GENERAL_LEDGER(companyId) : ACCOUNTING.ACCOUNTING_REPORTS.GENERAL_LEDGER,
        compactParams({ from, to, accountId })
      ),
  },

  companyFinance: {
    getSummary: ({ year, month, companyId } = {}) =>
      ApiService.get(
        companyId ? ACCOUNTING.COMPANY_FINANCE.COMPANY_SUMMARY(companyId) : ACCOUNTING.COMPANY_FINANCE.SUMMARY,
        compactParams({ year, month })
      ),
    getIncome: ({ from, to, companyId } = {}) =>
      ApiService.get(ACCOUNTING.COMPANY_FINANCE.INCOME, compactParams({ from, to, companyId })),
    getExpenses: ({ from, to, companyId, category } = {}) =>
      ApiService.get(ACCOUNTING.COMPANY_FINANCE.EXPENSES, compactParams({ from, to, companyId, category })),
    createExpense: (payload) => ApiService.post(ACCOUNTING.COMPANY_FINANCE.CREATE_EXPENSE, payload),
    createReceipt: (payload) => ApiService.post(ACCOUNTING.COMPANY_FINANCE.RECEIPTS, payload),
    reverseReceipt: (receiptId) =>
      ApiService.post(ACCOUNTING.COMPANY_FINANCE.REVERSE_RECEIPT(receiptId), { receiptId }),
    getProfitLoss: ({ from, to, companyId } = {}) =>
      ApiService.get(
        companyId ? ACCOUNTING.COMPANY_FINANCE.COMPANY_PROFIT_LOSS(companyId) : ACCOUNTING.COMPANY_FINANCE.PROFIT_LOSS,
        compactParams({ from, to })
      ),
    getCostCenters: (from, to) =>
      ApiService.get(ACCOUNTING.COMPANY_FINANCE.COST_CENTERS, compactParams({ from, to })),
  },
};
