"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InspectionRequestModal } from "@/components/property/InspectionRequestModal";
import { useToast } from "@/components/ui/Toast";

export interface VehicleActionsProps {
  vehicleTitle: string;
  vehicleSlug: string;
  layout?: "inline" | "sticky-mobile";
}

/**
 * The vehicle equivalent of PropertyActions (components/property/PropertyActions.tsx):
 * exactly two actions, Message (secondary) and Request inspection
 * (primary), not four of equal weight. Saving lives on the gallery's
 * own overlay controls (VehicleGallery, Back/Share/Save). Shares
 * InspectionRequestModal with the property flow rather than
 * duplicating that logic for a second category.
 *
 * Below md, BottomNav (components/navigation/BottomNav.tsx) is also
 * fixed to the viewport bottom, so this bar sits stacked above it
 * rather than sharing the same inset-x-0 bottom-0 slot; from md up
 * BottomNav is hidden, so this reverts to sitting flush at the
 * bottom for the md-to-lg range where it's still the sticky variant.
 */
export function VehicleActions({ vehicleTitle, vehicleSlug: _vehicleSlug, layout = "inline" }: VehicleActionsProps) {
  const { showToast } = useToast();
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
      <InspectionRequestModal isOpen={inspectionOpen} onClose={() => setInspectionOpen(false)} assetTitle={vehicleTitle} />
    </>
  );
}
