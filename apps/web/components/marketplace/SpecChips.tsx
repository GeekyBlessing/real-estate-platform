export interface SpecChipsProps {
  items: string[];
}

/**
 * The compact spec row every detail page needs right under the price
 * (84,000 km / Automatic / Petrol / SUV): individual pill chips
 * that wrap and sit close together, not values spread thinly across
 * a border-y row with huge gaps between them.
 */
export function SpecChips({ items }: SpecChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full border border-line-strong bg-parchment px-3 py-1.5 text-body-sm font-semibold text-ink">
          {item}
        </span>
      ))}
    </div>
  );
}
