"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/marketplace/SearchBar";
import { FilterDrawer, DEFAULT_FILTERS, FilterValues } from "@/components/marketplace/FilterDrawer";
import { PropertyGrid } from "@/components/marketplace/PropertyGrid";
import { Button } from "@/components/ui/Button";
import { properties } from "@/lib/mock-data";

/**
 * Two column layout on desktop, list beside a map panel, collapsing
 * to a single scrollable list on mobile with a map toggle, per
 * Section 8 of the blueprint. The map panel here is a labeled
 * placeholder: real pins need Mapbox and geocoded listings, which is
 * Phase 5 work, not something to fake with static coordinates now.
 */
function SearchResults() {
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showMapOnMobile, setShowMapOnMobile] = useState(false);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);

  const location = searchParams.get("location") ?? "";
  const transactionType = searchParams.get("type") ?? "";
  const maxPrice = searchParams.get("maxPrice");

  const results = useMemo(() => {
    return properties.filter((property) => {
      if (location && !property.locationLabel.toLowerCase().includes(location.toLowerCase())) return false;
      if (transactionType && property.listingType !== transactionType) return false;
      if (maxPrice && property.priceInKobo > Number(maxPrice) * 100) return false;
      if (filters.minBedrooms && (property.bedrooms ?? 0) < Number(filters.minBedrooms.replace("+", ""))) return false;
      if (filters.minBathrooms && property.bathrooms < Number(filters.minBathrooms.replace("+", ""))) return false;
      if (filters.furnishing !== "Any" && property.furnishingStatus !== filters.furnishing) return false;
      if (filters.amenities.length > 0 && !filters.amenities.every((amenity) => property.amenities.includes(amenity))) return false;
      return true;
    });
  }, [location, transactionType, maxPrice, filters]);

  const activeFilterCount =
    (filters.minBedrooms ? 1 : 0) +
    (filters.minBathrooms ? 1 : 0) +
    (filters.furnishing !== "Any" ? 1 : 0) +
    filters.amenities.length;

  return (
    <main>
      <div className="border-b border-line bg-paper-deep px-6 py-6">
        <div className="mx-auto max-w-5xl">
          <SearchBar compact />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-soft">
            <span className="font-semibold text-ink tabular-nums">{results.length}</span> properties
            {location && <> in <span className="font-semibold text-ink">{location}</span></>}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setFiltersOpen(true)}>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden"
              onClick={() => setShowMapOnMobile((value) => !value)}
            >
              {showMapOnMobile ? "Show list" : "Show map"}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className={showMapOnMobile ? "hidden lg:block" : ""}>
            <PropertyGrid properties={results} emptyMessage="Try widening your filters or clearing the location." />
          </div>
          <div className={showMapOnMobile ? "block" : "hidden lg:block"}>
            <div className="sticky top-20 flex h-96 items-center justify-center rounded border border-line bg-paper-deep text-center">
              <p className="max-w-[220px] text-xs text-clay">
                Map view opens here once Mapbox and geocoded listings are wired up in Phase 5.
              </p>
            </div>
          </div>
        </div>
      </div>

      <FilterDrawer isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} values={filters} onApply={setFilters} />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}
