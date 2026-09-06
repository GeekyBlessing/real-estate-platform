"use client";

import Link from "next/link";
import { VerificationBadge } from "@/components/ui/Badge";
import { ListingMedia } from "@/components/ui/ListingMedia";
import { formatNaira } from "@/lib/utils";
import { ListingBase, PropertyType, sellerRoleLabel } from "@/lib/listings";
import { useFavorites } from "@/lib/favorites-context";
import { HeartIcon } from "@/components/ui/icons";

export interface PropertyCardData extends ListingBase {
  category: "property";
  propertyType: PropertyType;
  listingType: "rent" | "sale";
  rentPeriod?: "year" | "month";
  bedrooms: number | null;
  bathrooms: number;
  sizeSqm: number;
}

export interface PropertyCardProps {
  property: PropertyCardData;
}

/**
 * Presentational, but reads and writes favorites through the shared
 * FavoritesProvider (lib/favorites-context.tsx) directly rather than
 * taking isFavorited/onToggleFavorite as props, so a card behaves the
 * same whether it's rendered in a search grid, a homepage rail, or
 * the Saved tab, with no risk of the toggle drifting out of sync with
 * the grid it happens to be sitting in.
 */
export function PropertyCard({ property }: PropertyCardProps) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const favorited = isFavorited("property", property.slug);

  const priceLabel =
    property.listingType === "sale"
      ? `${formatNaira(property.priceInKobo)}`
      : `${formatNaira(property.priceInKobo)} / ${property.rentPeriod === "month" ? "month" : "year"}`;

  return (
    <article className="group overflow-hidden rounded border border-line bg-parchment transition-colors hover:border-line-strong">
      <div className="relative aspect-[4/3] w-full">
        <ListingMedia
          image={property.images[0]!}
          category="property"
          fallbackAlt={property.title}
          className="h-full w-full"
        />
        <div className="pointer-events-none absolute inset-0 flex items-start justify-between p-3">
          <VerificationBadge state={property.verificationState} />
          {property.listingType === "sale" ? (
            <span className="rounded-full bg-ink/80 px-2.5 py-1 text-label uppercase text-parchment">For sale</span>
          ) : null}
        </div>
        {property.images.length > 1 && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-ink/70 px-2 py-0.5 text-caption text-parchment">
            1/{property.images.length}
          </span>
        )}
        <button
          type="button"
          onClick={() => toggleFavorite("property", property.slug)}
          aria-pressed={favorited}
          aria-label={favorited ? "Remove from saved properties" : "Save property"}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-parchment/95 text-ink shadow-float transition-transform active:scale-90"
        >
          <HeartIcon size={17} active filled={favorited} className={favorited ? "text-patina" : undefined} />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 px-3.5 py-3">
        <p className="text-price text-ink">{priceLabel}</p>

        <div>
          <Link href={`/properties/${property.slug}`} className="text-h3 font-semibold text-ink hover:underline">
            {property.title}
          </Link>
          <p className="mt-0.5 text-body-sm text-ink-soft">{property.location.label}</p>
        </div>

        <div className="flex gap-4 border-t border-line pt-2.5 text-body-sm text-ink-soft">
          <span><strong className="font-semibold text-ink">{property.bedrooms ?? "N/A"}</strong> beds</span>
          <span><strong className="font-semibold text-ink">{property.bathrooms}</strong> baths</span>
          <span><strong className="font-semibold text-ink">{property.sizeSqm}</strong> sqm</span>
        </div>

        <div className="flex items-center gap-2 text-body-sm text-ink-soft">
          <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-patina font-mono text-[10px] font-bold text-white">
            {property.listedBy.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </span>
          <span className="truncate">
            {property.listedBy.name} <span className="text-clay">·</span> {sellerRoleLabel(property.listedBy.role)}
          </span>
        </div>
      </div>
    </article>
  );
}
