import { Hero } from "@/components/marketplace/Hero";
import { PropertyGrid } from "@/components/marketplace/PropertyGrid";
import { VehicleGrid } from "@/components/marketplace/VehicleGrid";
import { TrustExplainer } from "@/components/marketplace/TrustExplainer";
import { LocationStrip } from "@/components/marketplace/LocationStrip";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { properties } from "@/lib/mock-data";
import { vehicles } from "@/lib/vehicles";

/**
 * Homepage structure per Section 8 of the blueprint: hero with the
 * search bar embedded, a results preview so the page proves inventory
 * exists before explaining anything, the verification component shown
 * doing its job, a location strip scoped to real inventory, and a
 * closing call to action. No decorative section that doesn't earn
 * its place. Property and vehicle previews get their own section
 * each, since a shared heading and grid would bury whichever category
 * loaded second.
 */
export default function HomePage() {
  const previewProperties = properties.slice(0, 3);
  const previewVehicles = vehicles.slice(0, 3);

  return (
    <main>
      <Hero />

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl text-ink">Recently listed properties</h2>
            <Link href="/search" className="text-sm font-semibold text-patina hover:text-patina-deep">
              View all properties
            </Link>
          </div>
          <div className="mt-8">
            <PropertyGrid properties={previewProperties} />
          </div>
        </div>
      </section>

      <section className="border-t border-line px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl text-ink">Recently listed vehicles</h2>
            <Link href="/cars" className="text-sm font-semibold text-patina hover:text-patina-deep">
              View all vehicles
            </Link>
          </div>
          <div className="mt-8">
            <VehicleGrid vehicles={previewVehicles} />
          </div>
        </div>
      </section>

      <TrustExplainer />
      <LocationStrip />

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
          <div className="flex flex-col items-start gap-4 rounded border border-line bg-paper-deep p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl text-ink">Have a property to list?</h2>
              <p className="mt-1.5 text-sm text-ink-soft">
                Verified listings get more enquiries. Submit your documents once, they carry across every listing you add.
              </p>
            </div>
            <Link href="/list-a-property">
              <Button size="md">List a property</Button>
            </Link>
          </div>
          <div className="flex flex-col items-start gap-4 rounded border border-line bg-paper-deep p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl text-ink">Have a car to sell?</h2>
              <p className="mt-1.5 text-sm text-ink-soft">
                Verified sellers get more enquiries. Submit your documents once, they carry across every listing you add.
              </p>
            </div>
            <Link href="/sell-a-car">
              <Button size="md">Sell a car</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
