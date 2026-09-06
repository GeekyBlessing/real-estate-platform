"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchSummaryBar } from "@/components/marketplace/SearchSummaryBar";
import { FilterDrawer, DEFAULT_FILTERS, FilterValues } from "@/components/marketplace/FilterDrawer";
import { PropertyGrid } from "@/components/marketplace/PropertyGrid";
import { AreaGroupedResults } from "@/components/marketplace/AreaGroupedResults";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/Button";
import { properties } from "@/lib/mock-data";
import { locationMatches } from "@/lib/locations";

/**
 * A single scrollable list is the primary experience on every
 * breakpoint, map view is an explicit secondary screen reached by a
 * toggle, not a permanent split-screen column that dedicates half a
 * desktop viewport to a labeled stub. This used to also carry a
 * desktop-style search form (location text input, two <select>
 * dropdowns) pinned above the grid; that is gone, replaced by
 * SearchSummaryBar plus the Filters bottom sheet, which is now the one
 * place Rent/Buy, price, property type, and every other facet live.
 * URL params (from Explore's suggestion chips or a shared link) seed
 * the initial filter values so a deep link still lands pre-filtered.
 */
function SearchResults() {
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const location = searchParams.get("location") ?? "";
  const [filters, setFilters] = useState<FilterValues>(() => ({
    ...DEFAULT_FILTERS,
    transactionType: (searchParams.get("type") as FilterValues["transactionType"]) || "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    propertyType: searchParams.get("propertyType") ?? "",
  }));

  const results = useMemo(() => {
    return properties.filter((property) => {
      if (location && !locationMatches(property.location, location)) return false;
      if (filters.transactionType && property.listingType !== filters.transactionType) return false;
      if (filters.maxPrice && property.priceInKobo > Number(filters.maxPrice) * 100) return false;
      if (filters.propertyType && property.propertyType !== filters.propertyType) return false;
      if (filters.minBedrooms && (property.bedrooms ?? 0) < Number(filters.minBedrooms.replace("+", ""))) return false;
      if (filters.minBathrooms && property.bathrooms < Number(filters.minBathrooms.replace("+", ""))) return false;
      if (filters.furnishing !== "Any" && property.furnishingStatus !== filters.furnishing) return false;
      if (filters.amenities.length > 0 && !filters.amenities.every((amenity) => property.amenities.includes(amenity))) return false;
      if (filters.verifiedOnly && property.verificationState !== "verified") return false;
      return true;
    });
  }, [location, filters]);

  const activeFilterCount =
    (filters.transactionType ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.propertyType ? 1 : 0) +
    (filters.minBedrooms ? 1 : 0) +
    (filters.minBathrooms ? 1 : 0) +
    (filters.furnishing !== "Any" ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    filters.amenities.length;

  return (
    <main>
      <div className="border-b border-line bg-paper-deep px-5 py-5 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <SearchSummaryBar active="property" location={location} />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <p className="text-body-sm text-ink-soft">
            <span className="font-semibold text-ink tabular-nums">{results.length}</span> properties
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setFiltersOpen(true)}>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowMap((value) => !value)}>
              {showMap ? "Show list" : "Show map"}
            </Button>
          </div>
        </div>

        <div className="mt-5">
          {showMap ? (
            <AreaGroupedResults
              items={results}
              renderCard={(property) => <PropertyCard property={property} />}
              emptyMessage="Try widening your filters or clearing the location."
            />
          ) : (
            <PropertyGrid properties={results} emptyMessage="Try widening your filters or clearing the location." />
          )}
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
