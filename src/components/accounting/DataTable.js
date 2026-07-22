'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/context/LanguageContext';
import { accountingT } from '@/lib/accounting/i18n';
import { EmptyState } from './AsyncStates';
import { cn } from './utils';

function valueAtPath(source, path) {
  if (!path) return undefined;
  return String(path).split('.').reduce((value, key) => value?.[key], source);
}

function cellValue(column, row) {
  if (typeof column.accessor === 'function') return column.accessor(row);
  return valueAtPath(row, column.accessor ?? column.key);
}

function rowIdentifier(row, index, rowKey) {
  if (typeof rowKey === 'function') return rowKey(row, index);
  return valueAtPath(row, rowKey) ?? index;
}

export default function DataTable({
  columns = [],
  data = [],
  rows: rowsProp,
  rowKey = 'id',
  getRowKey,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  caption,
  getRowHref,
  onRowClick,
  rowClassName,
  className,
  ariaLabel,
}) {
  const router = useRouter();
  const { locale } = useLanguage();
  const rowData = rowsProp ?? data;
  const rows = Array.isArray(rowData) ? rowData : [];
  const resolvedRowKey = getRowKey ?? rowKey;

  const activateRow = (row, event) => {
    if (event.target.closest?.('a, button, input, select, textarea, [role="button"], [role="link"]')) {
      return;
    }
    onRowClick?.(row, event);
    const href = getRowHref?.(row);
    if (href && !event.defaultPrevented) router.push(href);
  };

  return (
    <div className={cn('accounting-table-wrap', className)} aria-busy={loading || undefined}>
      <table className="accounting-table" aria-label={ariaLabel}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key ?? column.accessor ?? index}
                scope="col"
                className={cn(
                  column.align === 'end' && 'text-end',
                  column.align === 'center' && 'text-center',
                  column.headerClassName
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && Array.from({ length: 5 }).map((_, rowIndex) => (
            <tr key={`loading-${rowIndex}`} aria-hidden="true">
              {columns.map((column, columnIndex) => (
                <td key={column.key ?? column.accessor ?? columnIndex}>
                  <div className="h-4 animate-pulse rounded bg-slate-200" style={{ width: `${55 + ((rowIndex + columnIndex) % 4) * 10}%` }} />
                </td>
              ))}
            </tr>
          ))}

          {!loading && rows.map((row, index) => {
            const interactive = Boolean(onRowClick || getRowHref);
            return (
              <tr
                key={rowIdentifier(row, index, resolvedRowKey)}
                className={cn(interactive && 'accounting-table__interactive-row', typeof rowClassName === 'function' ? rowClassName(row, index) : rowClassName)}
                tabIndex={interactive ? 0 : undefined}
                onClick={interactive ? (event) => activateRow(row, event) : undefined}
                onKeyDown={interactive ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    activateRow(row, event);
                  }
                } : undefined}
              >
                {columns.map((column, columnIndex) => {
                  const value = cellValue(column, row);
                  return (
                    <td
                      key={column.key ?? column.accessor ?? columnIndex}
                      className={cn(
                        (column.align === 'end' || column.numeric) && 'text-end tabular-nums',
                        column.align === 'center' && 'text-center',
                        column.className
                      )}
                    >
                      {column.render ? column.render(row, index, value) : value ?? accountingT(locale, 'common.noValue')}
                    </td>
                  );
                })}
              </tr>
            );
          })}

          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={Math.max(columns.length, 1)} className="p-0">
                <EmptyState
                  compact
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                  className="border-0 bg-transparent"
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
