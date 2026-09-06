"use client";

import { PointerEvent, ReactNode, useRef, useState } from "react";
import { useDismissableOverlay } from "@/hooks/useDismissableOverlay";
import { cn } from "@/lib/utils";
import { CloseIcon } from "@/components/ui/icons";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Pinned below the scrolling content, full width, per the brief's thumb-friendly-actions rule rather than small justify-end buttons. */
  footer?: ReactNode;
}

const DISMISS_THRESHOLD_PX = 120;

/**
 * The mobile-native panel for wherever its job is to collect input before returning to what
 * the user was doing, filters foremost: rises from the bottom with a
 * real drag handle instead of sliding in from the side the way a
 * desktop panel would. Dragging the handle down past DISMISS_THRESHOLD_PX
 * closes it; releasing above that threshold springs back open, since
 * a filter sheet has one open state, not several snap points to rest
 * at partway. Backdrop tap and Escape (useDismissableOverlay) still
 * close it too, for anyone not using touch.
 */
export function BottomSheet({ isOpen, onClose, title, children, footer }: BottomSheetProps) {
  useDismissableOverlay(isOpen, onClose);
  const [dragOffset, setDragOffset] = useState(0);
  const dragging = useRef(false);
  const startY = useRef(0);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    startY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    setDragOffset(Math.max(0, event.clientY - startY.current));
  }

  function endDrag() {
    if (!dragging.current) return;
    dragging.current = false;
    if (dragOffset > DISMISS_THRESHOLD_PX) onClose();
    setDragOffset(0);
  }

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
        aria-labelledby="bottom-sheet-title"
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[88vh] w-full flex-col rounded-t-lg bg-parchment shadow-modal transition-transform sm:max-w-lg"
        style={{
          transform: isOpen ? `translateY(${dragOffset}px)` : "translateY(100%)",
          transitionDuration: dragging.current ? "0ms" : undefined,
        }}
      >
        <div
          className="flex flex-none touch-none cursor-grab flex-col items-center pb-1 pt-3 active:cursor-grabbing sm:hidden"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <span className="h-1.5 w-10 rounded-full bg-line-strong" aria-hidden="true" />
        </div>

        <div className="flex flex-none items-center justify-between px-6 pb-3 pt-2">
          <h3 id="bottom-sheet-title" className="text-lg font-semibold text-ink">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-bark hover:bg-paper-deep hover:text-ink"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4 text-sm text-ink-soft">{children}</div>

        {footer && <div className="flex-none border-t border-line px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>
  );
}
