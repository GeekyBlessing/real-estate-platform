import { SelectHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, error, id, className, ...props },
  ref
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="flex max-w-xs flex-col gap-1.5">
      <label htmlFor={selectId} className="text-xs font-semibold text-ink">
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={errorId}
        className={cn(
          "w-full rounded-sm border border-line-strong bg-white px-3 py-2.5 text-sm text-ink",
          "focus:border-patina-deep focus:outline-none focus:ring-2 focus:ring-patina-deep/15",
          "disabled:cursor-not-allowed disabled:bg-paper-deep disabled:text-clay",
          error && "border-danger focus:border-danger focus:ring-danger/15",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
});
