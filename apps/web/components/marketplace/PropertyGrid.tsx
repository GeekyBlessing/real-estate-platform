"use client";

import { useState } from "react";
import { PropertyCard, PropertyCardData } from "@/components/property/PropertyCard";
import { EmptyState } from "@/components/ui/EmptyState";

export interface PropertyGridProps {
  properties: PropertyCardData[];
  emptyMessage?: string;
}

export function PropertyGrid({ properties, emptyMessage = "No properties match these filters yet." }: PropertyGridProps) {
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

  if (properties.length === 0) {
    return <EmptyState title="No results" description={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard
          key={property.slug}
          property={{ ...property, isFavorited: favorites.has(property.slug) }}
          onToggleFavorite={toggleFavorite}
        />
      ))}
    </div>
  );
}
