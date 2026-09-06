"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LAUNCH_CITIES, STATES } from "@/lib/locations";
import { VEHICLE_MAKES } from "@/lib/vehicles";
import { PROPERTY_TYPES, propertyTypeLabel } from "@/lib/listings";
import { addRecentSearch, getRecentSearches, RecentSearch } from "@/lib/recent-searches";
import { ChevronLeftIcon as BackIcon, SearchIcon, ClockIcon } from "@/components/ui/icons";

/** Every launch city's named areas, a handful each, real places from lib/locations.ts rather than a decorative country-wide list. */
function suggestedAreas(): Array<{ name: string }> {
  const out: Array<{ name: string }> = [];
  for (const launch of LAUNCH_CITIES) {
    const state = STATES.find((item) => item.slug === launch.stateSlug);
    const city = state?.cities.find((item) => item.slug === launch.citySlug);
    city?.areas.slice(0, 5).forEach((area) => out.push({ name: area.name }));
  }
  return out;
}

/**
 * The tap-to-search entry point the brief's section 6 asks for:
 * recent searches, suggested locations, and suggested searches, all
 * reached from the home screen's search field and BottomNav's Explore
 * tab, rather than landing straight on a results page with a filter
 * bar bolted to the top. Every suggestion chip here only uses a URL
 * parameter the results pages (search/page.tsx, cars/page.tsx)
 * actually read; nothing links to a filter combination that would
 * silently do nothing once tapped.
 */
export default function ExplorePage() {
  const router = useRouter();
  const [category, setCategory] = useState<"property" | "cars">("property");
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<RecentSearch[]>([]);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  function go(label: string, href: string) {
    addRecentSearch({ label, href });
    router.push(href);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    const href = `${category === "property" ? "/search" : "/cars"}?location=${encodeURIComponent(query.trim())}`;
    go(query.trim(), href);
  }

  const areas = suggestedAreas();
  const resultsBase = category === "property" ? "/search" : "/cars";

  return (
    <main className="min-h-screen bg-parchment pb-16">
      <div className="border-b border-line bg-paper-deep px-6 pb-5 pt-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Back to home"
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-ink-soft hover:bg-parchment hover:text-ink"
            >
              <BackIcon size={18} />
            </Link>
            <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2 rounded border border-line-strong bg-parchment px-4 py-2.5">
              <SearchIcon size={16} className="flex-none text-bark" />
              <label htmlFor="explore-query" className="sr-only">
                Search homes, cars, or locations
              </label>
              <input
                id="explore-query"
                autoFocus
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search homes, cars, or locations"
                className="w-full bg-transparent text-body-sm text-ink placeholder:text-clay focus:outline-none"
              />
            </form>
          </div>

          <div role="tablist" aria-label="Search category" className="mt-4 flex gap-2">
            {(
              [
                { value: "property" as const, label: "Property" },
                { value: "cars" as const, label: "Cars" },
              ]
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={category === option.value}
                onClick={() => setCategory(option.value)}
                className={cn(
                  "rounded-sm border px-4 py-1.5 text-body-sm font-semibold",
                  category === option.value ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-6">
        {recent.length > 0 && (
          <section className="mb-8">
            <h2 className="text-h3 font-semibold text-ink">Recent searches</h2>
            <div className="mt-2 flex flex-col">
              {recent.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded px-2 py-2.5 text-body-sm text-ink hover:bg-paper-deep"
                >
                  <ClockIcon size={16} className="flex-none text-clay" />
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-h3 font-semibold text-ink">Suggested locations</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {areas.map((area) => (
              <button
                key={area.name}
                type="button"
                onClick={() => go(area.name, `${resultsBase}?location=${encodeURIComponent(area.name)}`)}
                className="rounded-full border border-line-strong px-3.5 py-1.5 text-body-sm text-ink-soft hover:border-bark hover:text-ink"
              >
                {area.name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-h3 font-semibold text-ink">Suggested searches</h2>
          <div className="mt-2 flex flex-col">
            {category === "property"
              ? [
                  { label: "For rent", href: `${resultsBase}?type=rent` },
                  { label: "For sale", href: `${resultsBase}?type=sale` },
                  ...PROPERTY_TYPES.slice(0, 4).map((type) => ({
                    label: propertyTypeLabel(type),
                    href: `${resultsBase}?propertyType=${type}`,
                  })),
                ].map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => go(item.label, item.href)}
                    className="flex items-center gap-3 rounded px-2 py-2.5 text-left text-body-sm text-ink hover:bg-paper-deep"
                  >
                    <SearchIcon size={16} className="flex-none text-bark" />
                    {item.label}
                  </button>
                ))
              : VEHICLE_MAKES.slice(0, 6).map((make) => (
                  <button
                    key={make}
                    type="button"
                    onClick={() => go(make, `${resultsBase}?make=${encodeURIComponent(make)}`)}
                    className="flex items-center gap-3 rounded px-2 py-2.5 text-left text-body-sm text-ink hover:bg-paper-deep"
                  >
                    <SearchIcon size={16} className="flex-none text-bark" />
                    {make}
                  </button>
                ))}
          </div>
        </section>
      </div>
    </main>
  );
}
