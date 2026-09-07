"use client";

import Link from "next/link";
import { VerificationBadge } from "@/components/ui/Badge";
import { ListingMedia } from "@/components/ui/ListingMedia";
import { Avatar } from "@/components/ui/Avatar";
import { formatNaira, formatMileage } from "@/lib/utils";
import { VehicleCardData, sellerRoleLabel } from "@/lib/listings";
import { useFavorites } from "@/lib/favorites-context";
import { HeartIcon } from "@/components/ui/icons";

export interface VehicleCardProps {
  vehicle: VehicleCardData;
}

/**
 * Deliberately a different information hierarchy from PropertyCard,
 * not the same card with different field names. A buyer evaluates a
 * car by make, model, and year first, then mileage, transmission,
 * and fuel. Reads and writes favorites through the shared
 * FavoritesProvider directly, same as PropertyCard, so a save here
 * shows up in the Saved tab and on the detail page's action bar.
 */
export function VehicleCard({ vehicle }: VehicleCardProps) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const favorited = isFavorited("vehicle", vehicle.slug);

  return (
    <article className="group overflow-hidden rounded border border-line bg-parchment transition-colors hover:border-line-strong">
      <div className="relative aspect-[4/3] w-full">
        <ListingMedia image={vehicle.images[0]} fallbackAlt={vehicle.title} className="h-full w-full" compact />
        <div className="pointer-events-none absolute inset-0 flex items-start justify-between p-3">
          <VerificationBadge state={vehicle.verificationState} />
          <span className="rounded-full bg-ink/80 px-2.5 py-1 text-label uppercase text-parchment">
            {vehicle.condition === "brand new" ? "New" : vehicle.condition === "foreign used" ? "Foreign used" : "Nigerian used"}
          </span>
        </div>
        {vehicle.images.length > 1 && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-ink/70 px-2 py-0.5 text-caption text-parchment">
            1/{vehicle.images.length}
          </span>
        )}
        <button
          type="button"
          onClick={() => toggleFavorite("vehicle", vehicle.slug)}
          aria-pressed={favorited}
          aria-label={favorited ? "Remove from saved vehicles" : "Save vehicle"}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-parchment/95 text-ink shadow-float transition-transform active:scale-90"
        >
          <HeartIcon size={17} active filled={favorited} className={favorited ? "text-patina" : undefined} />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 px-3.5 py-3">
        <p className="text-price text-ink">{formatNaira(vehicle.priceInKobo)}</p>

        <div>
          <Link href={`/cars/${vehicle.slug}`} className="text-h3 font-semibold text-ink hover:underline">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Link>
          <p className="mt-0.5 text-body-sm text-ink-soft">{vehicle.location.label}</p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-2.5 text-body-sm text-ink-soft">
          <span className="font-semibold text-ink">{formatMileage(vehicle.mileageKm)}</span>
          <span className="capitalize">{vehicle.transmission}</span>
          <span>{vehicle.fuelType}</span>
        </div>

        <div className="flex items-center gap-2 text-body-sm text-ink-soft">
          <Avatar name={vehicle.listedBy.name} size="xs" />
          <span className="truncate">
            {vehicle.listedBy.name} <span className="text-clay">·</span> {sellerRoleLabel(vehicle.listedBy.role)}
          </span>
        </div>
      </div>
    </article>
  );
}
