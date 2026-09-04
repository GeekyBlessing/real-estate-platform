"use client";

import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { CarSearchBar } from "./CarSearchBar";
import { APP_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "property" as const, label: "Property" },
  { value: "cars" as const, label: "Cars" },
];

/**
 * States what the platform does and why it can be trusted in one
 * sentence, per the blueprint's homepage rule against generic hero
 * copy. The search bar lives inside the hero itself, not below a
 * photo, so the page's first real action is available immediately.
 * Property and cars are two genuinely different searches, not one
 * search box relabeled, so the hero switches between SearchBar and
 * CarSearchBar rather than trying to make one form cover both.
 */
export function Hero() {
  const [category, setCategory] = useState<"property" | "cars">("property");

  return (
    <section className="border-b border-line bg-paper-deep px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">{APP_TAGLINE}</h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-ink-soft">
          Every listing shows exactly what has been checked, identity, ownership documents, and listing accuracy,
          before you ever contact a seller or request an inspection.
        </p>

        <div className="mx-auto mt-8 max-w-2xl text-left">
          <div role="tablist" aria-label="Search category" className="mb-3 flex justify-center gap-2">
            {CATEGORIES.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={category === option.value}
                onClick={() => setCategory(option.value)}
                className={cn(
                  "rounded-sm border px-4 py-1.5 text-xs font-semibold",
                  category === option.value ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {category === "property" ? <SearchBar /> : <CarSearchBar />}
        </div>
      </div>
    </section>
  );
}
