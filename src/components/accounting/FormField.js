'use client';

import { cloneElement, isValidElement, useId } from 'react';
import { cn } from './utils';

export default function FormField({
  label,
  name,
  required = false,
  hint,
  help,
  error,
  children,
  className,
}) {
  const generatedId = useId().replace(/:/g, '');
  const childId = isValidElement(children) ? children.props.id : undefined;
  const fieldId = childId ?? name ?? `accounting-field-${generatedId}`;
  const visibleHint = hint ?? help;
  const hintId = visibleHint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [
    isValidElement(children) ? children.props['aria-describedby'] : undefined,
    hintId,
    errorId,
  ].filter(Boolean).join(' ') || undefined;

  const controlProps = {
    id: fieldId,
    name: isValidElement(children) ? children.props.name ?? name : name,
    required: isValidElement(children) ? children.props.required ?? required : required,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
  };

  let control = children;
  if (typeof children === 'function') {
    control = children(controlProps);
  } else if (isValidElement(children)) {
    const isNativeControl = typeof children.type === 'string';
    control = cloneElement(children, {
      ...controlProps,
      ...(isNativeControl ? { className: cn('accounting-control', children.props.className) } : {}),
    });
  }

  return (
    <div className={cn('accounting-field', className)}>
      <label htmlFor={fieldId} className="accounting-field__label">
        <span>{label}</span>
        {required && <span className="text-red-600" aria-hidden="true">*</span>}
      </label>
      {control}
      {visibleHint && <p id={hintId} className="accounting-field__hint">{visibleHint}</p>}
      {error && <p id={errorId} className="accounting-field__error" role="alert">{error}</p>}
    </div>
  );
}
