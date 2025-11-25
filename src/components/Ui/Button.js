'use client';
import { Loader2 } from 'lucide-react';

export default function Button({ 
  children, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  type = 'button',
  className = '',
  ...props 
}) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#ebb62b] text-white hover:bg-[#e08911]',
    secondary: 'bg-[#e08911] text-white hover:bg-[#ebb62b]',
    blue: 'bg-[#1b428e] text-white hover:bg-[#2563eb]',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-500 text-white hover:bg-green-600',
    outline: 'border-2 border-[#1b428e] text-[#1b428e] hover:bg-[#1b428e] hover:text-white',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={16} />}
      {children}
    </button>
  );
}