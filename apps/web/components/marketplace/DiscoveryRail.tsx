import Link from "next/link";
import { ReactNode } from "react";

export interface DiscoveryRailProps<T> {
  title: string;
  seeAllHref?: string;
  items: T[];
  keyFor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
}

/**
 * Horizontal scroll on mobile, a grid from sm up, per the brief's
 * rule that discovery sections should scroll sideways on a phone
 * rather than force a long vertical stack. The -mx-6/px-6 pair only
 * cancels out correctly when this sits directly inside a plain
 * `mx-auto max-w-5xl` wrapper with no padding of its own (the
 * pattern every rail on the homepage uses); it bleeds the scroll
 * area to the screen edge on mobile so the next card visibly peeks
 * in, and reverts to nothing on desktop where it becomes a grid.
 * Renders nothing when there is no real data behind it, rather than
 * showing an empty rail.
 */
export function DiscoveryRail<T>({ title, seeAllHref, items, keyFor, renderItem }: DiscoveryRailProps<T>) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="text-h2 font-semibold text-ink">{title}</h2>
        {seeAllHref && (
          <Link href={seeAllHref} className="text-body-sm font-semibold text-patina hover:text-patina-deep">
            See all
          </Link>
        )}
      </div>
      <div className="-mx-6 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0">
        {items.map((item) => (
          <div key={keyFor(item)} className="w-[78%] flex-none snap-start sm:w-auto">
            {renderItem(item)}
          </div>
        ))}
      </div>
    </section>
  );
}
