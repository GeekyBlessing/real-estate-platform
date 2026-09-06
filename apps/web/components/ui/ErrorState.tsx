import { Button } from "./Button";
import { AlertCircleIcon } from "@/components/ui/icons";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

/**
 * For a failed fetch, not a validation error (that belongs on the
 * field via Input's `error` prop). Copy never surfaces a raw
 * exception or status code; that detail goes to structured logs.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "Check your connection and try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded border border-line bg-parchment px-6 py-10 text-center">
      <AlertCircleIcon size={32} className="text-danger" />
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="max-w-xs text-xs text-ink-soft">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}
