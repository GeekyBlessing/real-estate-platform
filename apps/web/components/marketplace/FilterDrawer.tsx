"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const AMENITIES = ["Water treatment", "Backup power", "Parking", "Security", "Serviced", "Furnished kitchen", "Swimming pool", "Gym"];
const FURNISHING = ["Any", "Unfurnished", "Semi furnished", "Fully furnished"];

export interface FilterValues {
  minBedrooms: string;
  minBathrooms: string;
  furnishing: string;
  amenities: string[];
}

export const DEFAULT_FILTERS: FilterValues = {
  minBedrooms: "",
  minBathrooms: "",
  furnishing: "Any",
  amenities: [],
};

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  values: FilterValues;
  onApply: (values: FilterValues) => void;
}

/**
 * Everything beyond the three search essentials (Section 8 of the
 * blueprint) lives here, opened from a single Filters control on the
 * results page, so the page never shows ten dropdowns at once.
 */
export function FilterDrawer({ isOpen, onClose, values, onApply }: FilterDrawerProps) {
  const [draft, setDraft] = useState<FilterValues>(values);

  function toggleAmenity(amenity: string) {
    setDraft((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Filters">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-semibold text-ink">Bedrooms, minimum</p>
          <div className="mt-2 flex gap-2">
            {["Any", "1", "2", "3", "4+"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, minBedrooms: option === "Any" ? "" : option }))}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-xs font-semibold",
                  (draft.minBedrooms || "Any") === option ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-ink">Bathrooms, minimum</p>
          <div className="mt-2 flex gap-2">
            {["Any", "1", "2", "3+"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, minBathrooms: option === "Any" ? "" : option }))}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-xs font-semibold",
                  (draft.minBathrooms || "Any") === option ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-ink">Furnishing</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FURNISHING.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, furnishing: option }))}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-xs font-semibold",
                  draft.furnishing === option ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-ink">Amenities</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {AMENITIES.map((amenity) => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                aria-pressed={draft.amenities.includes(amenity)}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-xs font-semibold",
                  draft.amenities.includes(amenity) ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
                )}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Button
          variant="ghost"
          onClick={() => {
            setDraft(DEFAULT_FILTERS);
          }}
        >
          Clear all
        </Button>
        <Button
          onClick={() => {
            onApply(draft);
            onClose();
          }}
        >
          Show results
        </Button>
      </div>
    </Drawer>
  );
}
