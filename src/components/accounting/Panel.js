import { cn } from './utils';

export default function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  noPadding = false,
  as: Component = 'section',
}) {
  const hasHeader = title || description || actions;

  return (
    <Component className={cn('accounting-panel', className)}>
      {hasHeader && (
        <div className="accounting-panel__header">
          <div className="min-w-0">
            {title && <h2 className="text-base font-bold text-slate-950">{title}</h2>}
            {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn(!noPadding && 'accounting-panel__body', bodyClassName)}>{children}</div>
    </Component>
  );
}
