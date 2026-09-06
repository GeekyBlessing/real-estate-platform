import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { SearchIcon, CloseIcon } from "@/components/ui/icons";

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { onClear, value, className, ...props },
  ref
) {
  return (
    <div className="relative w-full">
      <SearchIcon
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bark"
      />
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
          <CloseIcon size={13} />
        </button>
      ) : null}
    </div>
  );
});
