"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InspectionRequestModal } from "./InspectionRequestModal";
import { useToast } from "@/components/ui/Toast";
import { useRentalLifecycle } from "@/lib/rental-lifecycle-context";

export interface PropertyActionsProps {
  propertyTitle: string;
  propertySlug: string;
  layout?: "inline" | "sticky-mobile";
}

/**
 * Exactly two actions, not four of equal weight: Message (secondary,
 * reaches the agent or landlord) and Request inspection (primary, the
 * action that actually moves a serious buyer or tenant forward).
 * Saving now lives on the gallery's own overlay controls
 * (PropertyGallery, Back/Share/Save), so it isn't duplicated here.
 * Rendered twice on the detail page: inline beside the price on
 * desktop, and again as a sticky bar on mobile, both instances of
 * this one component so behavior never drifts between the two.
 *
 * Below md, BottomNav (components/navigation/BottomNav.tsx) is also
 * fixed to the viewport bottom, so this bar sits stacked above it
 * rather than sharing the same inset-x-0 bottom-0 slot; from md up
 * BottomNav is hidden, so this reverts to sitting flush at the
 * bottom for the md-to-lg range where it's still the sticky variant.
 */
export function PropertyActions({ propertyTitle, propertySlug, layout = "inline" }: PropertyActionsProps) {
  const { showToast } = useToast();
  const { recordStage } = useRentalLifecycle();
  const [inspectionOpen, setInspectionOpen] = useState(false);

  const wrapperClass =
    layout === "sticky-mobile"
      ? "fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 flex gap-3 border-t border-line bg-parchment p-3 shadow-modal md:bottom-0 lg:hidden"
      : "flex gap-3";

  return (
    <>
      <div className={wrapperClass}>
        <Button variant="secondary" size="lg" className="flex-1" onClick={() => showToast("Opening conversation.")}>
          Message
        </Button>
        <Button size="lg" className="flex-[1.4]" onClick={() => setInspectionOpen(true)}>
          Request inspection
        </Button>
      </div>
      <InspectionRequestModal
        isOpen={inspectionOpen}
        onClose={() => setInspectionOpen(false)}
        assetTitle={propertyTitle}
        onSubmitted={() => recordStage(propertySlug, "inspection_requested")}
      />
    </>
  );
}
