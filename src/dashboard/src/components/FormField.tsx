import React, { type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={space-y-2 }>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {label}
        {required && (
          <span className="ml-1" style={{ color: 'oklch(0.55 0.15 25)' }}>
            *
          </span>
        )}
      </label>
      
      {children}
      
      {error && (
        <div className="flex items-start gap-2 text-sm" style={{ color: 'oklch(0.55 0.15 25)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      
      {hint && !error && (
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {hint}
        </p>
      )}
    </div>
  );
}

interface FormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  className?: string;
}

export function Form({ onSubmit, children, className = '' }: FormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={space-y-6 }
      noValidate
    >
      {children}
    </form>
  );
}
