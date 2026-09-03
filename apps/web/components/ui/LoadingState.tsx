import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-sm bg-gradient-to-r from-paper-deep via-line to-paper-deep bg-[length:400%_100%]",
        className
      )}
      aria-hidden="true"
    />
  );
}

/**
 * A skeleton, not a spinner, for content that has a known shape
 * (a list of property cards, a table). Reserve a bare spinner for
 * places with no layout to preview yet, e.g. inside a button.
 */
export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 rounded border border-line bg-parchment px-6 py-10">
      <Skeleton className="h-3.5 w-2/3" />
      <Skeleton className="h-2.5 w-1/2" />
      <Skeleton className="h-2.5 w-3/5" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
