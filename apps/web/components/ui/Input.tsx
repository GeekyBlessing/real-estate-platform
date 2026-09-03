import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

/**
 * Label, hint, and error are structural, not optional add-ons. Every
 * field renders its own <label> for screen readers and wires the
 * error message to the input via aria-describedby, since the brief
 * requires accessible forms, not just visually attached error text.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, icon, id, className, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex max-w-xs flex-col gap-1.5">
      <label htmlFor={inputId} className="text-xs font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bark">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={cn(hintId, errorId) || undefined}
          className={cn(
            "w-full rounded-sm border border-line-strong bg-white px-3 py-2.5 text-sm text-ink",
            "placeholder:text-clay",
            "focus:border-patina-deep focus:outline-none focus:ring-2 focus:ring-patina-deep/15",
            "disabled:cursor-not-allowed disabled:bg-paper-deep disabled:text-clay",
            error && "border-danger focus:border-danger focus:ring-danger/15",
            Boolean(icon) && "pl-9",
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && (
        <span id={hintId} className="text-xs text-ink-soft">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
});
