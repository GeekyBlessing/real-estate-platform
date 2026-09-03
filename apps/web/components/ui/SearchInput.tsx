import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { onClear, value, className, ...props },
  ref
) {
  return (
    <div className="relative w-full">
      <svg
        aria-hidden="true"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bark"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        ref={ref}
        type="search"
        value={value}
        role="searchbox"
        className={cn(
          "w-full rounded-sm border border-line-strong bg-white py-2.5 pl-9 pr-9 text-sm text-ink",
          "placeholder:text-clay focus:border-patina-deep focus:outline-none focus:ring-2 focus:ring-patina-deep/15",
          className
        )}
        {...props}
      />
      {onClear && value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-bark hover:bg-paper-deep hover:text-ink"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
});
