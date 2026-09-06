"use client";

import { useMemo, useState } from "react";
import { useFavorites } from "@/lib/favorites-context";
import { properties } from "@/lib/mock-data";
import { vehicles } from "@/lib/vehicles";
import { PropertyCard } from "@/components/property/PropertyCard";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

/**
 * A saved listing's status can change after the fact: the price drops,
 * it goes off market, or it finishes verification after being saved
 * unverified. There is no real price-history or listing-lifecycle
 * backend behind this yet, so this is an illustrative, deterministic
 * stand-in (derived from the slug, not stored anywhere) purely to show
 * the intended UI treatment, the same "mock the UI, not the feature"
 * approach used elsewhere in this build until that lifecycle data is
 * real.
 */
function savedStatusFor(slug: string, verified: boolean): { label: string; tone: "price" | "gone" | "verified" } | null {
  const hash = Array.from(slug).reduce((total, char) => total + char.charCodeAt(0), 0);
  if (hash % 5 === 0) return { label: "Price dropped ₦2,000,000", tone: "price" };
  if (hash % 7 === 0) return { label: "No longer available", tone: "gone" };
  if (hash % 6 === 0 && verified) return { label: "Now verified", tone: "verified" };
  return null;
}

const STATUS_STYLES: Record<string, string> = {
  price: "bg-verified-bg text-verified",
  gone: "bg-danger-bg text-danger",
  verified: "bg-verified-bg text-verified",
};

/**
 * Properties and cars behind a real tab switch, not two long sections
 * stacked on one scroll, so "Saved" reads as one screen with a
 * category choice the way the rest of the app makes that choice
 * (Explore, the home category tiles), rather than a report with two
 * headings. Reads the shared FavoritesProvider directly rather than
 * keeping its own list, so a save made from any card or from a detail
 * page's gallery overlay shows up here immediately.
 */
export default function SavedPage() {
  const { favoriteSlugs } = useFavorites();
  const [tab, setTab] = useState<"property" | "vehicle">("property");

  const savedProperties = useMemo(
    () => properties.filter((property) => favoriteSlugs.property.includes(property.slug)),
    [favoriteSlugs.property]
  );
  const savedVehicles = useMemo(
    () => vehicles.filter((vehicle) => favoriteSlugs.vehicle.includes(vehicle.slug)),
    [favoriteSlugs.vehicle]
  );

  const items = tab === "property" ? savedProperties : savedVehicles;

  return (
    <main className="px-5 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-h1 font-semibold text-ink">Saved</h1>

        <div role="tablist" aria-label="Saved category" className="mt-5 flex gap-2">
          {[
            { value: "property" as const, label: `Properties (${savedProperties.length})` },
            { value: "vehicle" as const, label: `Cars (${savedVehicles.length})` },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={tab === option.value}
              onClick={() => setTab(option.value)}
              className={cn(
                "rounded-sm border px-4 py-1.5 text-body-sm font-semibold",
                tab === option.value ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {items.length === 0 ? (
            <EmptyState
              title={tab === "property" ? "No saved properties yet" : "No saved cars yet"}
              description={tab === "property" ? "Save properties you like and we'll keep them here." : "Save cars you like and we'll keep them here."}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const status = savedStatusFor(item.slug, item.verificationState === "verified");
                return (
                  <div key={item.slug} className="relative">
                    {tab === "property" ? <PropertyCard property={item as (typeof savedProperties)[number]} /> : <VehicleCard vehicle={item as (typeof savedVehicles)[number]} />}
                    {status && (
                      <span className={cn("mt-2 block rounded-sm px-2.5 py-1 text-center text-caption font-semibold", STATUS_STYLES[status.tone])}>
                        {status.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
