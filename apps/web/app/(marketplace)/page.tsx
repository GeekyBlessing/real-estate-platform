import { Hero } from "@/components/marketplace/Hero";
import { PropertyGrid } from "@/components/marketplace/PropertyGrid";
import { TrustExplainer } from "@/components/marketplace/TrustExplainer";
import { LocationStrip } from "@/components/marketplace/LocationStrip";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { properties } from "@/lib/mock-data";

/**
 * Homepage structure per Section 8 of the blueprint: hero with the
 * search bar embedded, a results preview so the page proves inventory
 * exists before explaining anything, the verification component shown
 * doing its job, a location strip scoped to real inventory, and a
 * closing call to action. No decorative section that doesn't earn
 * its place.
 */
export default function HomePage() {
  const previewProperties = properties.slice(0, 3);

  return (
    <main>
      <Hero />

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl text-ink">Recently listed</h2>
            <Link href="/search" className="text-sm font-semibold text-patina hover:text-patina-deep">
              View all properties
            </Link>
          </div>
          <div className="mt-8">
            <PropertyGrid properties={previewProperties} />
          </div>
        </div>
      </section>

      <TrustExplainer />
      <LocationStrip />

      <section className="px-6 py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 rounded border border-line bg-paper-deep p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink">Have a property to list?</h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              Verified listings get more enquiries. Submit your documents once, they carry across every listing you add.
            </p>
          </div>
          <Link href="/list-a-property">
            <Button size="md">List a property</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
