'use client';

import { LoaderCircle } from 'lucide-react';
import { cn } from './utils';

const variantClasses = {
  primary: 'accounting-button accounting-button--primary',
  secondary: 'accounting-button accounting-button--secondary',
  outline: 'accounting-button accounting-button--outline',
  ghost: 'accounting-button accounting-button--ghost',
  danger: 'accounting-button accounting-button--danger',
};

const sizeClasses = {
  sm: 'accounting-button--sm',
  md: 'accounting-button--md',
  lg: 'accounting-button--lg',
  icon: 'accounting-button--icon',
};

export default function ActionButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel,
  icon: Icon,
  iconPosition = 'start',
  children,
  className,
  disabled,
  type = 'button',
  ...buttonProps
}) {
  const icon = loading
    ? <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
    : Icon
      ? <Icon aria-hidden="true" size={17} strokeWidth={1.9} />
      : null;

  return (
    <button
      type={type}
      className={cn(variantClasses[variant] ?? variantClasses.primary, sizeClasses[size] ?? sizeClasses.md, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...buttonProps}
    >
      {iconPosition === 'start' && icon}
      {children && <span>{loading && loadingLabel ? loadingLabel : children}</span>}
      {iconPosition === 'end' && icon}
    </button>
  );
}
