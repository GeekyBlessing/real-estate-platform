"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InspectionRequestModal } from "./InspectionRequestModal";
import { useToast } from "@/components/ui/Toast";

export interface PropertyActionsProps {
  propertyTitle: string;
  layout?: "inline" | "sticky-mobile";
}

/**
 * Contact, Message, Request inspection, and Favorite, always visible,
 * per the blueprint's rule against hiding primary actions behind a
 * menu. Rendered twice on the detail page: inline beside the price on
 * desktop, and again as a sticky bar on mobile, both instances of
 * this one component so behavior never drifts between the two.
 */
export function PropertyActions({ propertyTitle, layout = "inline" }: PropertyActionsProps) {
  const { showToast } = useToast();
  const [inspectionOpen, setInspectionOpen] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const wrapperClass =
    layout === "sticky-mobile"
      ? "fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-parchment p-3 shadow-modal lg:hidden"
      : "flex flex-wrap gap-3";

  return (
    <>
      <div className={wrapperClass}>
        <Button className="flex-1" onClick={() => showToast("Your enquiry was sent to the agent.")}>
          Contact
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => showToast("Opening conversation.")}>
          Message
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => setInspectionOpen(true)}>
          Request inspection
        </Button>
        <button
          type="button"
          onClick={() => setFavorited((value) => !value)}
          aria-pressed={favorited}
          aria-label={favorited ? "Remove from saved properties" : "Save property"}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-sm border border-line-strong text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1.2 4.5 2.5C12 6.2 13.5 5 15.5 5 19 5 21.5 8.5 19.5 12.5 17 16.65 12 21 12 21z" />
          </svg>
        </button>
      </div>
      <InspectionRequestModal isOpen={inspectionOpen} onClose={() => setInspectionOpen(false)} propertyTitle={propertyTitle} />
    </>
  );
}
