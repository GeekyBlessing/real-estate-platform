import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Lets Explore (the one bottom-nav entry that covers both marketplace
 * categories, per components/navigation/BottomNav.tsx) switch between
 * the property and car search experiences without a trip back through
 * Home. Property and cars keep their own routes and their own filter
 * logic (Section: Car Marketplace is explicit that a vehicle search
 * is not a relabeled property search), this only switches which one
 * is showing.
 */
export function CategoryTabs({ active }: { active: "property" | "cars" }) {
  return (
    <div role="tablist" aria-label="Marketplace category" className="flex gap-2">
      <Link
        href="/search"
        role="tab"
        aria-selected={active === "property"}
        className={cn(
          "rounded-sm border px-4 py-1.5 text-body-sm font-semibold",
          active === "property" ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
        )}
      >
        Property
      </Link>
      <Link
        href="/cars"
        role="tab"
        aria-selected={active === "cars"}
        className={cn(
          "rounded-sm border px-4 py-1.5 text-body-sm font-semibold",
          active === "cars" ? "border-ink bg-ink text-parchment" : "border-line-strong text-ink-soft"
        )}
      >
        Cars
      </Link>
    </div>
  );
}
