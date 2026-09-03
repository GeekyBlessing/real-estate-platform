import { useEffect, useRef } from "react";

/**
 * Shared Escape-to-close and focus-return behavior for Modal and
 * Drawer, so both stay keyboard accessible without duplicating the
 * same effect twice. Does not implement a full focus trap (tabbing
 * out of the overlay is still possible); add one before shipping if
 * an accessibility audit flags it as necessary for this product.
 */
export function useDismissableOverlay(isOpen: boolean, onClose: () => void) {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    } else {
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
}
