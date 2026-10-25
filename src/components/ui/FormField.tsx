/**
 * @file src/components/ui/FormField.tsx
 * @description Reusable labeled input wrapper with error state and Tailwind styling.
 */

import React, { ReactNode } from "react";
import { clsx } from "clsx";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span aria-hidden>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// ─── Shared input / select class strings ────────────────────────────────────

export const inputCls = (hasError = false) =>
  clsx(
    "w-full rounded-lg border px-3 py-2.5 text-sm text-slate-800",
    "placeholder:text-slate-400 focus:outline-none focus:ring-2 transition",
    hasError
      ? "border-red-400 focus:ring-red-300 bg-red-50"
      : "border-slate-300 focus:ring-blue-400 bg-white"
  );

export const selectCls = (hasError = false) =>
  clsx(inputCls(hasError), "cursor-pointer appearance-none pr-8");
