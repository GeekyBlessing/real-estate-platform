import { ReactNode } from "react";
import { useDismissableOverlay } from "@/hooks/useDismissableOverlay";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: "left" | "right";
}

/** Used for filters on mobile search and secondary detail panels on desktop. */
export function Drawer({ isOpen, onClose, title, children, side = "right" }: DrawerProps) {
  useDismissableOverlay(isOpen, onClose);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-ink/45 transition-opacity",
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={cn(
          "absolute top-0 h-full w-full max-w-sm bg-parchment p-6 shadow-modal transition-transform",
          side === "right" ? "right-0" : "left-0",
          isOpen ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between">
          <h3 id="drawer-title" className="font-display text-lg font-semibold text-ink">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-bark hover:bg-paper-deep hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-4 text-sm text-ink-soft">{children}</div>
      </div>
    </div>
  );
}
