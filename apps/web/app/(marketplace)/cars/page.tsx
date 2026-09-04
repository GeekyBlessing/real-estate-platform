"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CarSearchBar } from "@/components/marketplace/CarSearchBar";
import { VehicleFilterDrawer, DEFAULT_VEHICLE_FILTERS, VehicleFilterValues } from "@/components/marketplace/VehicleFilterDrawer";
import { VehicleGrid } from "@/components/marketplace/VehicleGrid";
import { Button } from "@/components/ui/Button";
import { vehicles } from "@/lib/vehicles";
import { locationMatches } from "@/lib/locations";

/**
 * The car equivalent of app/(marketplace)/search/page.tsx. Same two
 * column shape (results beside a map panel), but its own filtering
 * logic against vehicle specific fields, never the property filter
 * predicate with vehicle field names substituted in.
 */
function CarResults() {
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showMapOnMobile, setShowMapOnMobile] = useState(false);
  const [filters, setFilters] = useState<VehicleFilterValues>(DEFAULT_VEHICLE_FILTERS);

  const location = searchParams.get("location") ?? "";
  const make = searchParams.get("make") ?? "";
  const maxPrice = searchParams.get("maxPrice");

  const results = useMemo(() => {
    return vehicles.filter((vehicle) => {
      if (location && !locationMatches(vehicle.location, location)) return false;
      if (make && vehicle.make !== make) return false;
      if (maxPrice && vehicle.priceInKobo > Number(maxPrice) * 100) return false;
      if (filters.model && vehicle.model !== filters.model) return false;
      if (filters.maxMileage && vehicle.mileageKm > Number(filters.maxMileage)) return false;
      if (filters.transmission !== "Any" && vehicle.transmission !== filters.transmission.toLowerCase()) return false;
      if (filters.fuelType !== "Any" && vehicle.fuelType !== filters.fuelType) return false;
      if (filters.bodyType !== "Any" && vehicle.bodyType !== filters.bodyType) return false;
      if (filters.condition !== "Any" && vehicle.condition !== filters.condition.toLowerCase()) return false;
      if (filters.verifiedOnly && vehicle.verificationState !== "verified") return false;
      return true;
    });
  }, [location, make, maxPrice, filters]);

  const activeFilterCount =
    (filters.model ? 1 : 0) +
    (filters.maxMileage ? 1 : 0) +
    (filters.transmission !== "Any" ? 1 : 0) +
    (filters.fuelType !== "Any" ? 1 : 0) +
    (filters.bodyType !== "Any" ? 1 : 0) +
    (filters.condition !== "Any" ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0);

  return (
    <main>
      <div className="border-b border-line bg-paper-deep px-6 py-6">
        <div className="mx-auto max-w-5xl">
          <CarSearchBar compact />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-soft">
            <span className="font-semibold text-ink tabular-nums">{results.length}</span> vehicles
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
            <VehicleGrid vehicles={results} emptyMessage="Try widening your filters or clearing the location." />
          </div>
          <div className={showMapOnMobile ? "block" : "hidden lg:block"}>
            <div className="sticky top-20 flex h-96 items-center justify-center rounded border border-line bg-paper-deep text-center">
              <p className="max-w-[220px] text-xs text-clay">
                Map view opens here once Mapbox and geocoded listings are wired up.
              </p>
            </div>
          </div>
        </div>
      </div>

      <VehicleFilterDrawer
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        values={{ ...filters, make }}
        onApply={setFilters}
      />
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
