"use client";

import Link from "next/link";
import { CategoryTabs } from "@/components/marketplace/CategoryTabs";
import { SearchIcon } from "@/components/ui/icons";

export interface SearchSummaryBarProps {
  active: "property" | "cars";
  location: string;
}

/**
 * Replaces the old SearchBar/CarSearchBar pinned above the results
 * grid, a desktop-style form of text input plus two <select> dropdowns
 * that does not belong on a results page once every one of its fields
 * (location, rent or buy, price, make) has a proper home in the
 * dedicated Explore search screen and the bottom-sheet Filters panel.
 * What is left here is a single tappable summary of the current
 * search, honest about what it is actually searching, that reopens
 * Explore to change it, plus the Property/Cars switch.
 */
export function SearchSummaryBar({ active, location }: SearchSummaryBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <CategoryTabs active={active} />
      <Link
        href="/explore"
        className="flex items-center gap-2.5 rounded border border-line-strong bg-parchment px-4 py-3 text-body-sm text-ink shadow-float transition-colors hover:border-bark active:scale-[0.99]"
      >
        <SearchIcon size={15} className="flex-none text-bark" />
        <span className="flex-1 truncate font-semibold">{location || "All locations"}</span>
        <span className="text-caption font-semibold text-patina">Change</span>
      </Link>
    </div>
  );
}
