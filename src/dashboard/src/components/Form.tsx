import React, { useState } from 'react';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';

type FieldErrors = Record<string, string[]>;

interface UseFormOptions<T extends z.ZodType> {
  schema: T;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
}

export function useForm<T extends z.ZodType>({ schema, onSubmit }: UseFormOptions<T>) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (data: unknown): data is z.infer<T> => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: FieldErrors = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(err.message);
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (validate(data)) {
      setIsSubmitting(true);
      try {
        await onSubmit(data as z.infer<T>);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    handleSubmit,
    errors,
    isSubmitting,
    clearError,
    clearAllErrors,
    validate,
  };
}

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  errors?: string[];
  className?: string;
  children?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  required,
  errors,
  className = '',
  children,
}) => {
  const hasError = errors && errors.length > 0;

  return (
    <div className={lex flex-col gap-1.5 }>
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children || (
        <input
          type={type}
          id={name}
          name={name}
          placeholder={placeholder}
          className={
            px-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            transition-colors
            
          }
        />
      )}
      {hasError && (
        <div className="flex items-start gap-1.5 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            {errors.map((error, idx) => (
              <span key={idx}>{error}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
