'use client';

import { useParams } from 'next/navigation';
import AccountingOperationsPage from '../page';

const MODULE_BY_ROUTE = Object.freeze({
  receivables: 'receivables',
  payables: 'payables',
  expenses: 'expenses',
  inventory: 'inventory',
  treasury: 'treasury',
  compliance: 'tax',
  tax: 'tax',
  assets: 'assets',
  budgets: 'budgets',
});

export default function AccountingOperationSectionPage() {
  const params = useParams();
  const section = Array.isArray(params?.section) ? params.section[0] : params?.section;
  return <AccountingOperationsPage initialModuleId={MODULE_BY_ROUTE[section] ?? 'receivables'} />;
}
