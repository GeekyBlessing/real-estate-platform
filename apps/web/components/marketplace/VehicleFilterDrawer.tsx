"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  VEHICLE_MAKES,
  VEHICLE_MODELS_BY_MAKE,
  VEHICLE_BODY_TYPES,
  VEHICLE_CONDITIONS,
  VEHICLE_TRANSMISSIONS,
  VEHICLE_FUEL_TYPES,
} from "@/lib/vehicles";

const CONDITIONS = ["Any", ...VEHICLE_CONDITIONS];
const TRANSMISSIONS = ["Any", ...VEHICLE_TRANSMISSIONS];
const FUEL_TYPES = ["Any", ...VEHICLE_FUEL_TYPES];
const MAX_MILEAGE_OPTIONS = [
  { value: "", label: "Any mileage" },
  { value: "20000", label: "Up to 20,000 km" },
  { value: "60000", label: "Up to 60,000 km" },
  { value: "100000", label: "Up to 100,000 km" },
];
const PRICE_CEILINGS = [
  { value: "", label: "Any price" },
  { value: "3000000", label: "Up to 3m" },
  { value: "10000000", label: "Up to 10m" },
  { value: "25000000", label: "Up to 25m" },
  { value: "60000000", label: "Up to 60m" },
];

export interface VehicleFilterValues {
  make: string;
  model: string;
  maxPrice: string;
  condition: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
  maxMileage: string;
  verifiedOnly: boolean;
}

export const DEFAULT_VEHICLE_FILTERS: VehicleFilterValues = {
  make: "",
  model: "",
  maxPrice: "",
  condition: "Any",
  transmission: "Any",
  fuelType: "Any",
  bodyType: "Any",
  maxMileage: "",
  verifiedOnly: false,
};

export interface VehicleFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  values: VehicleFilterValues;
  onApply: (values: VehicleFilterValues) => void;
}

/**
 * The car equivalent of FilterDrawer (components/marketplace/FilterDrawer.tsx).
 * Model only appears once a make is chosen in this same sheet, the
 * dependent pair the car search spec calls for.
 */
export function VehicleFilterDrawer({ isOpen, onClose, values, onApply }: VehicleFilterDrawerProps) {
  const [draft, setDraft] = useState<VehicleFilterValues>(values);
  const availableModels = draft.make ? VEHICLE_MODELS_BY_MAKE[draft.make] ?? [] : [];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" className="w-full" onClick={() => setDraft(DEFAULT_VEHICLE_FILTERS)}>
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
          <p className="text-xs font-semibold text-ink">Make</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Any", ...VEHICLE_MAKES].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setDraft((current) => ({ ...current, make: option === "Any" ? "" : option, model: "" }))
                }
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-xs font-semibold",
                  (draft.make || "Any") === option ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
                )}
              >
                {option}
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

        {availableModels.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-ink">Model</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Any", ...availableModels].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDraft((current) => ({ ...current, model: option === "Any" ? "" : option }))}
                  className={cn(
                    "rounded-sm border px-3 py-1.5 text-xs font-semibold",
                    (draft.model || "Any") === option ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-ink">Maximum mileage</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {MAX_MILEAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, maxMileage: option.value }))}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-xs font-semibold",
                  draft.maxMileage === option.value ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-ink">Transmission</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TRANSMISSIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, transmission: option }))}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-xs font-semibold",
                  draft.transmission === option ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-ink">Fuel type</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FUEL_TYPES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, fuelType: option }))}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-xs font-semibold",
                  draft.fuelType === option ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-ink">Body type</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Any", ...VEHICLE_BODY_TYPES].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, bodyType: option }))}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-xs font-semibold",
                  (draft.bodyType || "Any") === option ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-ink">Condition</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CONDITIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, condition: option }))}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-xs font-semibold",
                  draft.condition === option ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
                )}
              >
                {option}
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
            Verified sellers only
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
