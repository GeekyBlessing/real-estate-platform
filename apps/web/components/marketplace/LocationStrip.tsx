import Link from "next/link";
import { properties } from "@/lib/mock-data";
import { POPULAR_CITIES } from "@/lib/locations";

/**
 * Only the cities with real inventory, per the blueprint, not a
 * decorative map of the whole country. Listing counts are computed
 * from the actual mock properties rather than hardcoded, so this
 * strip cannot drift out of sync with what search actually returns.
 * Adding a city here without seed listings behind it would make the
 * count show zero, which is a deliberate guardrail, not a bug.
 */
export function LocationStrip() {
  const cities = POPULAR_CITIES.map((city) => ({
    ...city,
    listingCount: properties.filter((property) => property.location.citySlug === city.citySlug).length,
  }));

  return (
    <section className="border-b border-line px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-wider text-bark">Where to look</p>
        <h2 className="mt-2 font-display text-2xl text-ink">Currently listing in {cities.length} cities.</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cities.map((city) => (
            <Link
              key={city.citySlug}
              href={`/search?location=${encodeURIComponent(city.city)}`}
              className="rounded border border-line bg-parchment p-6 hover:border-line-strong"
            >
              <p className="font-display text-xl text-ink">{city.city}</p>
              <p className="mt-1 text-xs text-ink-soft">{city.listingCount} active listings</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
