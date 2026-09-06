"use client";

import { ReactNode, useMemo, useRef } from "react";
import { ListingBase } from "@/lib/listings";
import { EmptyState } from "@/components/ui/EmptyState";
import { MapPinIcon } from "@/components/ui/icons";

export interface AreaGroupedResultsProps<T extends ListingBase> {
  items: T[];
  renderCard: (item: T) => ReactNode;
  emptyTitle?: string;
  emptyMessage: string;
}

interface AreaGroup<T> {
  area: string;
  items: T[];
}

function groupByArea<T extends ListingBase>(items: T[]): AreaGroup<T>[] {
  const order: string[] = [];
  const byArea = new Map<string, T[]>();
  for (const item of items) {
    const key = item.location.area ?? item.location.city;
    if (!byArea.has(key)) {
      byArea.set(key, []);
      order.push(key);
    }
    byArea.get(key)!.push(item);
  }
  return order.map((area) => ({ area, items: byArea.get(area)! }));
}

/**
 * The map toggle's actual content: this build has no map tile
 * provider wired up (see LocationPreview.tsx for the same constraint
 * on a single listing's detail page), so rather than leave a blank
 * box promising a map that isn't there, results are grouped by the
 * area they're actually in, with a chip strip up top that jumps to
 * each area's section. It is real, useful geography-based browsing
 * today, and the honest label says plainly that a real interactive
 * map replaces it once a provider is connected, rather than letting
 * the chip strip pass itself off as one.
 */
export function AreaGroupedResults<T extends ListingBase>({
  items,
  renderCard,
  emptyTitle = "No results",
  emptyMessage,
}: AreaGroupedResultsProps<T>) {
  const groups = useMemo(() => groupByArea(items), [items]);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyMessage} />;
  }

  function scrollToArea(area: string) {
    sectionRefs.current[area]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <div className="rounded border border-line bg-paper-deep p-4">
        <p className="text-body-sm font-semibold text-ink">Grouped by area</p>
        <p className="mt-1 text-caption text-ink-soft">
          An interactive map will replace this once a map provider is connected. Tap an area to jump to its listings.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {groups.map((group) => (
            <button
              key={group.area}
              type="button"
              onClick={() => scrollToArea(group.area)}
              className="flex items-center gap-1.5 rounded-sm border border-line-strong bg-parchment px-3 py-2 text-body-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              <MapPinIcon size={14} className="flex-none text-patina" />
              {group.area}
              <span className="text-caption font-normal text-ink-soft">{group.items.length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-8">
        {groups.map((group) => (
          <div
            key={group.area}
            ref={(el) => {
              sectionRefs.current[group.area] = el;
            }}
            className="scroll-mt-4"
          >
            <h3 className="text-h3 font-semibold text-ink">
              {group.area} <span className="font-normal text-ink-soft">({group.items.length})</span>
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <div key={item.slug}>{renderCard(item)}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
