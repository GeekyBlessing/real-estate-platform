"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useSelectedLocation } from "@/lib/location-context";
import { cn } from "@/lib/utils";
import { MapPinIcon as PinIcon, CheckIcon, ChevronDownIcon } from "@/components/ui/icons";

/**
 * The trigger and the sheet both live in this one component since
 * they only ever appear together. Only LAUNCH_CITIES (lib/locations.ts)
 * are offered, on purpose: with two markets at launch, "change
 * location" should feel like a real, complete choice, not a search
 * box in front of a list that is mostly empty.
 */
export function LocationPicker({ className }: { className?: string }) {
  const { city, cities, setCitySlug } = useSelectedLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("inline-flex items-center gap-1.5 text-left", className)}
      >
        <PinIcon size={14} className="flex-none text-patina" />
        <span className="text-h3 font-semibold text-ink">{city.city}</span>
        <ChevronDownIcon size={14} className="text-bark" />
      </button>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Change location">
        <p className="text-body-sm text-ink-soft">
          OWNIT is live in two markets right now. More cities are on the way as real listings and verified sellers come on board there.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          {cities.map((option) => {
            const active = option.citySlug === city.citySlug;
            return (
              <button
                key={option.citySlug}
                type="button"
                onClick={() => {
                  setCitySlug(option.citySlug);
                  setOpen(false);
                }}
                aria-pressed={active}
                className={cn(
                  "flex items-center justify-between rounded-sm border px-4 py-3.5 text-left transition-colors",
                  active ? "border-ink bg-paper-deep" : "border-line hover:border-line-strong"
                )}
              >
                <span>
                  <span className="block text-h3 font-semibold text-ink">{option.city}</span>
                  <span className="block text-caption text-ink-soft">
                    {option.stateSlug === "ogun" ? "Ogun State" : "Lagos State"}
                  </span>
                </span>
                {active && <CheckIcon size={16} active />}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}
