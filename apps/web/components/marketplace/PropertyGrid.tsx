import { PropertyCard, PropertyCardData } from "@/components/property/PropertyCard";
import { EmptyState } from "@/components/ui/EmptyState";

export interface PropertyGridProps {
  properties: PropertyCardData[];
  emptyTitle?: string;
  emptyMessage?: string;
}

/**
 * No favorites state lives here anymore: PropertyCard reads and
 * writes the shared FavoritesProvider (lib/favorites-context.tsx)
 * itself, so this grid is a pure list renderer regardless of which
 * page or rail it's used in.
 */
export function PropertyGrid({
  properties,
  emptyTitle = "No results",
  emptyMessage = "No properties match these filters yet.",
}: PropertyGridProps) {
  if (properties.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.slug} property={property} />
      ))}
    </div>
  );
}
