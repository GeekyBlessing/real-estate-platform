"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { AMENITIES, FURNISHING_OPTIONS, PROPERTY_TYPES, PropertyType, propertyTypeLabel } from "@/lib/listings";

const FURNISHING = ["Any", ...FURNISHING_OPTIONS];
const PRICE_CEILINGS = [
  { value: "", label: "Any price" },
  { value: "5000000", label: "Up to 5m" },
  { value: "20000000", label: "Up to 20m" },
  { value: "50000000", label: "Up to 50m" },
  { value: "150000000", label: "Up to 150m" },
];

export interface FilterValues {
  transactionType: "rent" | "sale" | "";
  maxPrice: string;
  propertyType: string;
  minBedrooms: string;
  minBathrooms: string;
  furnishing: string;
  amenities: string[];
  verifiedOnly: boolean;
}

export const DEFAULT_FILTERS: FilterValues = {
  transactionType: "",
  maxPrice: "",
  propertyType: "",
  minBedrooms: "",
  minBathrooms: "",
  furnishing: "Any",
  amenities: [],
  verifiedOnly: false,
};

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  values: FilterValues;
  onApply: (values: FilterValues) => void;
}

/**
 * Every property filter the brief calls for lives in this one bottom
 * sheet, opened from a single Filters control on the results page,
 * including Buy/Rent and Price, which used to live in a desktop-style
 * search form pinned above the results grid. That bar is gone; a
 * results page now only ever shows a compact summary row
 * (SearchSummaryBar) plus this sheet.
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
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" className="w-full" onClick={() => setDraft(DEFAULT_FILTERS)}>
            Clear all
          </Button>
          <Button
            className="w-full"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Show results
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs font-semibold text-ink">Rent or buy</p>
          <div className="mt-2 flex gap-2">
            {[
              { value: "" as const, label: "Any" },
              { value: "rent" as const, label: "Rent" },
              { value: "sale" as const, label: "Buy" },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, transactionType: option.value }))}
                className={cn(
                  "flex-1 rounded-sm border px-3 py-2 text-xs font-semibold",
                  draft.transactionType === option.value ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-ink">Maximum price</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRICE_CEILINGS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, maxPrice: option.value }))}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-xs font-semibold",
                  draft.maxPrice === option.value ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-ink">Property type</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Any", ...PROPERTY_TYPES].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, propertyType: option === "Any" ? "" : option }))}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-xs font-semibold",
                  (draft.propertyType || "Any") === option ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
                )}
              >
                {option === "Any" ? "Any" : propertyTypeLabel(option as PropertyType)}
              </button>
            ))}
          </div>
        </div>

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

        <div>
          <button
            type="button"
            onClick={() => setDraft((current) => ({ ...current, verifiedOnly: !current.verifiedOnly }))}
            aria-pressed={draft.verifiedOnly}
            className={cn(
              "rounded-sm border px-3 py-1.5 text-xs font-semibold",
              draft.verifiedOnly ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
            )}
          >
            Verified only
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
