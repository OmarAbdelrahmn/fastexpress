import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './utils';

export default function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumbs = [],
  actions,
  meta,
  className,
}) {
  return (
    <header className={cn('accounting-page-header', className)}>
      <div className="min-w-0 flex-1">
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex flex-wrap items-center gap-1 text-xs font-medium text-slate-500">
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={`${item.href ?? item.label}-${index}`} className="flex items-center gap-1">
                    {index > 0 && (
                      <span className="text-slate-300" aria-hidden="true">
                        <ChevronLeft className="hidden rtl:block" size={14} />
                        <ChevronRight className="rtl:hidden" size={14} />
                      </span>
                    )}
                    {item.href && !isLast ? (
                      <Link href={item.href} className="rounded-sm transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                        {item.label}
                      </Link>
                    ) : (
                      <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-slate-700' : undefined}>
                        {item.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {eyebrow && <p className="accounting-eyebrow">{eyebrow}</p>}
        <h1 className="accounting-page-title">{title}</h1>
        {description && <p className="accounting-page-description">{description}</p>}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>

      {actions && <div className="accounting-page-actions" aria-label="Page actions">{actions}</div>}
    </header>
  );
}
