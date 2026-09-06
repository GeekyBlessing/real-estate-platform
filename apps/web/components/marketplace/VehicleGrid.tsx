import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { VehicleCardData } from "@/lib/listings";
import { EmptyState } from "@/components/ui/EmptyState";

export interface VehicleGridProps {
  vehicles: VehicleCardData[];
  emptyTitle?: string;
  emptyMessage?: string;
}

/**
 * No favorites state lives here anymore: VehicleCard reads and
 * writes the shared FavoritesProvider (lib/favorites-context.tsx)
 * itself, so this grid is a pure list renderer regardless of which
 * page or rail it's used in.
 */
export function VehicleGrid({
  vehicles,
  emptyTitle = "No results",
  emptyMessage = "No vehicles match these filters yet.",
}: VehicleGridProps) {
  if (vehicles.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.slug} vehicle={vehicle} />
      ))}
    </div>
  );
}
