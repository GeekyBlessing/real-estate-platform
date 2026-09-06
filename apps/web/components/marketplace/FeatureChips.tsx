import { CheckIcon } from "@/components/ui/icons";

export interface FeatureChipsProps {
  items: string[];
}

/**
 * Amenities and vehicle features rendered as icon+label elements in a
 * loose grid, not a plain bulleted list that reads like an unfinished
 * HTML document. Every entry uses the same check glyph rather than a
 * different icon per feature: this build has no icon library mapped
 * to arbitrary feature strings, and a consistent glyph reads cleaner
 * than a mismatched one per row.
 */
export function FeatureChips({ items }: FeatureChipsProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item} className="flex items-center gap-2.5 text-body-sm text-ink">
          <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-verified-bg">
            <CheckIcon size={14} active className="text-verified" />
          </span>
          {item}
        </div>
      ))}
    </div>
  );
}
