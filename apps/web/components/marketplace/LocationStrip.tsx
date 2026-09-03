import Link from "next/link";

const CITIES = [
  { name: "Lagos", listingCount: 214 },
  { name: "Abuja", listingCount: 96 },
  { name: "Port Harcourt", listingCount: 41 },
];

/**
 * Only the cities with real inventory, per the blueprint, not a
 * decorative map of the whole country. Counts here are placeholder
 * figures for the prototype; Phase 4 wires this to a real query.
 */
export function LocationStrip() {
  return (
    <section className="border-b border-line px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-wider text-bark">Where to look</p>
        <h2 className="mt-2 font-display text-2xl text-ink">Currently listing in three cities.</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CITIES.map((city) => (
            <Link
              key={city.name}
              href={`/search?location=${encodeURIComponent(city.name)}`}
              className="rounded border border-line bg-parchment p-6 hover:border-line-strong"
            >
              <p className="font-display text-xl text-ink">{city.name}</p>
              <p className="mt-1 text-xs text-ink-soft">{city.listingCount} active listings</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
