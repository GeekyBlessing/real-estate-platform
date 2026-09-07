"use client";

import { useMemo } from "react";
import { HomeHeader } from "@/components/marketplace/HomeHeader";
import { CategoryTile } from "@/components/marketplace/CategoryTile";
import { DiscoveryRail } from "@/components/marketplace/DiscoveryRail";
import { TrustExplainer } from "@/components/marketplace/TrustExplainer";
import { PropertyCard } from "@/components/property/PropertyCard";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { useSelectedLocation } from "@/lib/location-context";
import { properties } from "@/lib/mock-data";
import { vehicles } from "@/lib/vehicles";

/**
 * Rebuilt as an app discovery feed rather than a website landing
 * page: HomeHeader owns "where am I, what can I do next" (greeting,
 * location, notifications, account, search entry), the two category
 * tiles answer "what can I find," and the rails below answer "what's
 * near me," scoped to whichever launch city is selected.
 *
 * Three rails, not five: an earlier version also had a "Popular in
 * {city}" rail that was just nearYou reversed, the same listings
 * relabeled as if they were independently ranked. With no real view
 * or enquiry counts yet, there is no honest signal behind "popular,"
 * so that rail is gone rather than kept under a misleading label. A
 * "Verified in {city}" rail was removed for the identical reason: it
 * was always a strict subset of nearYou, so a verified listing simply
 * appeared twice on the same screen. Verification status is already
 * visible per card (see PropertyCard's VerificationBadge), so the
 * separate rail added a second copy of the listing, not new
 * information. "Newest listings" stays because it does not pretend to
 * be anything other than what it is: this seed list's own order, last
 * in first shown, standing in for a real createdAt until listings
 * come from the backend.
 */
export default function HomePage() {
  const { city } = useSelectedLocation();

  const nearYou = useMemo(
    () => properties.filter((property) => property.location.citySlug === city.citySlug),
    [city]
  );
  const carsInCity = useMemo(
    () => vehicles.filter((vehicle) => vehicle.location.citySlug === city.citySlug),
    [city]
  );
  const newestListings = useMemo(() => [...properties].slice(-4).reverse(), []);

  return (
    <main>
      <HomeHeader />

      <section className="px-6 py-7">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <CategoryTile
              href="/search"
              title="Property"
              description="Rent or buy, verified before it's listed"
              variant="property"
            />
            <CategoryTile
              href="/cars"
              title="Cars"
              description="Verified sellers and dealers"
              variant="vehicle"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-10 px-6 py-3">
        <div className="mx-auto w-full max-w-5xl">
          <DiscoveryRail
            title={`Near you in ${city.city}`}
            seeAllHref={`/search?location=${encodeURIComponent(city.city)}`}
            items={nearYou}
            keyFor={(property) => property.slug}
            renderItem={(property) => <PropertyCard property={property} />}
          />
        </div>

        <div className="mx-auto w-full max-w-5xl">
          <DiscoveryRail
            title={`Cars in ${city.city}`}
            seeAllHref={`/cars?location=${encodeURIComponent(city.city)}`}
            items={carsInCity}
            keyFor={(vehicle) => vehicle.slug}
            renderItem={(vehicle) => <VehicleCard vehicle={vehicle} />}
          />
        </div>

        <div className="mx-auto w-full max-w-5xl">
          <DiscoveryRail
            title="Newest listings"
            seeAllHref="/search"
            items={newestListings}
            keyFor={(property) => property.slug}
            renderItem={(property) => <PropertyCard property={property} />}
          />
        </div>
      </div>

      <div className="mt-6">
        <TrustExplainer />
      </div>
    </main>
  );
}
