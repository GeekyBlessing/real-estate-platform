"use client";

import { useState } from "react";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { VehicleCardData } from "@/lib/listings";
import { EmptyState } from "@/components/ui/EmptyState";

export interface VehicleGridProps {
  vehicles: VehicleCardData[];
  emptyMessage?: string;
}

export function VehicleGrid({ vehicles, emptyMessage = "No vehicles match these filters yet." }: VehicleGridProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  function toggleFavorite(slug: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }

  if (vehicles.length === 0) {
    return <EmptyState title="No results" description={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.slug}
          vehicle={{ ...vehicle, isFavorited: favorites.has(vehicle.slug) }}
          onToggleFavorite={toggleFavorite}
        />
      ))}
    </div>
  );
}
