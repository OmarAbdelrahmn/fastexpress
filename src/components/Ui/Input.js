'use client';
import { useId } from 'react';

export default function Input({ 
  label, 
  error, 
  className = '', 
  required = false,
  id,
  compact = false,
  labelClassName = '',
  ...props 
}) {
  const generatedId = useId();
  const inputId = id || `input-${generatedId.replace(/:/g, '')}`;
  const errorId = `${inputId}-error`;

  const sizeClasses = compact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2';
  const labelSize = compact ? 'text-xs mb-1' : 'text-sm mb-1';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={`block font-medium text-gray-700 ${labelSize} ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b428e] focus:border-transparent ${sizeClasses} ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
