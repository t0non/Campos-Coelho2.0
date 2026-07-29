import React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  helpText?: string;
  className?: string;
}

export function FormField({
  id,
  label,
  required = false,
  error,
  children,
  helpText,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5 text-left", className)}>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-brand-heading"
      >
        {label}
        {required && <span className="text-brand-primary ml-1">*</span>}
      </label>

      {children}

      {helpText && !error && (
        <p className="text-xs text-brand-bodyText/70 font-sans">{helpText}</p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs font-medium text-red-600 font-sans flex items-center gap-1 mt-1"
        >
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
