"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchSummaryBar } from "@/components/marketplace/SearchSummaryBar";
import { VehicleFilterDrawer, DEFAULT_VEHICLE_FILTERS, VehicleFilterValues } from "@/components/marketplace/VehicleFilterDrawer";
import { VehicleGrid } from "@/components/marketplace/VehicleGrid";
import { AreaGroupedResults } from "@/components/marketplace/AreaGroupedResults";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { Button } from "@/components/ui/Button";
import { vehicles } from "@/lib/vehicles";
import { locationMatches } from "@/lib/locations";

/**
 * The car equivalent of app/(marketplace)/search/page.tsx: the same
 * single scrollable list as the primary experience on every
 * breakpoint, SearchSummaryBar plus the Filters bottom sheet in place
 * of a desktop-style search form, and its own filtering logic against
 * vehicle specific fields, never the property filter predicate with
 * vehicle field names substituted in.
 */
function CarResults() {
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const location = searchParams.get("location") ?? "";
  const [filters, setFilters] = useState<VehicleFilterValues>(() => ({
    ...DEFAULT_VEHICLE_FILTERS,
    make: searchParams.get("make") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    bodyType: searchParams.get("bodyType") || "Any",
  }));

  const results = useMemo(() => {
    return vehicles.filter((vehicle) => {
      if (location && !locationMatches(vehicle.location, location)) return false;
      if (filters.make && vehicle.make !== filters.make) return false;
      if (filters.maxPrice && vehicle.priceInKobo > Number(filters.maxPrice) * 100) return false;
      if (filters.bodyType !== "Any" && vehicle.bodyType !== filters.bodyType) return false;
      if (filters.model && vehicle.model !== filters.model) return false;
      if (filters.maxMileage && vehicle.mileageKm > Number(filters.maxMileage)) return false;
      if (filters.transmission !== "Any" && vehicle.transmission !== filters.transmission.toLowerCase()) return false;
      if (filters.fuelType !== "Any" && vehicle.fuelType !== filters.fuelType) return false;
      if (filters.condition !== "Any" && vehicle.condition !== filters.condition.toLowerCase()) return false;
      if (filters.verifiedOnly && vehicle.verificationState !== "verified") return false;
      return true;
    });
  }, [location, filters]);

  const activeFilterCount =
    (filters.make ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.model ? 1 : 0) +
    (filters.maxMileage ? 1 : 0) +
    (filters.transmission !== "Any" ? 1 : 0) +
    (filters.fuelType !== "Any" ? 1 : 0) +
    (filters.bodyType !== "Any" ? 1 : 0) +
    (filters.condition !== "Any" ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0);

  return (
    <main>
      <div className="border-b border-line bg-paper-deep px-5 py-5 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <SearchSummaryBar active="cars" location={location} />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <p className="text-body-sm text-ink-soft">
            <span className="font-semibold text-ink tabular-nums">{results.length}</span> vehicles
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
              renderCard={(vehicle) => <VehicleCard vehicle={vehicle} />}
              emptyMessage="Try widening your filters or clearing the location."
            />
          ) : (
            <VehicleGrid vehicles={results} emptyMessage="Try widening your filters or clearing the location." />
          )}
        </div>
      </div>

      <VehicleFilterDrawer isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} values={filters} onApply={setFilters} />
    </main>
  );
}

export default function CarsPage() {
  return (
    <Suspense fallback={null}>
      <CarResults />
    </Suspense>
  );
}
