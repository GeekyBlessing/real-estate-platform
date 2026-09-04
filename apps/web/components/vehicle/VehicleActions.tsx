"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InspectionRequestModal } from "@/components/property/InspectionRequestModal";
import { useToast } from "@/components/ui/Toast";

export interface VehicleActionsProps {
  vehicleTitle: string;
  layout?: "inline" | "sticky-mobile";
}

/**
 * The vehicle equivalent of PropertyActions (components/property/PropertyActions.tsx).
 * Contact, Message, Request inspection, and Favorite, always visible,
 * rendered inline on desktop and again as a sticky bar on mobile.
 * Shares InspectionRequestModal with the property flow rather than
 * duplicating that logic for a second category.
 */
export function VehicleActions({ vehicleTitle, layout = "inline" }: VehicleActionsProps) {
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
        <Button className="flex-1" onClick={() => showToast("Your enquiry was sent to the seller.")}>
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
          aria-label={favorited ? "Remove from saved vehicles" : "Save vehicle"}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-sm border border-line-strong text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1.2 4.5 2.5C12 6.2 13.5 5 15.5 5 19 5 21.5 8.5 19.5 12.5 17 16.65 12 21 12 21z" />
          </svg>
        </button>
      </div>
      <InspectionRequestModal isOpen={inspectionOpen} onClose={() => setInspectionOpen(false)} assetTitle={vehicleTitle} />
    </>
  );
}
