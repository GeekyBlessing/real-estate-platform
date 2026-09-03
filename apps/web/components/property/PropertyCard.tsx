import Link from "next/link";
import { VerificationBadge, VerificationState } from "@/components/ui/Badge";
import { PropertyMedia } from "./PropertyMedia";
import { formatNaira } from "@/lib/utils";

export interface PropertyCardData {
  slug: string;
  title: string;
  locationLabel: string;
  listingType: "rent" | "sale";
  priceInKobo: number;
  rentPeriod?: "year" | "month";
  bedrooms: number | null;
  bathrooms: number;
  sizeSqm: number;
  mediaVariant: number;
  verificationState: VerificationState;
  agentName: string;
  agentRole: "agent" | "landlord";
  isFavorited: boolean;
}

export interface PropertyCardProps {
  property: PropertyCardData;
  onToggleFavorite: (slug: string) => void;
}

/**
 * Presentational only, no data fetching. Phase 4 wires this to the
 * properties API; Phase 5's search results grid and the favorites
 * list both render the same card so the two experiences never drift
 * apart visually.
 */
export function PropertyCard({ property, onToggleFavorite }: PropertyCardProps) {
  const priceLabel =
    property.listingType === "sale"
      ? `${formatNaira(property.priceInKobo)} · For sale`
      : `${formatNaira(property.priceInKobo)} / ${property.rentPeriod === "month" ? "month" : "year"}`;

  return (
    <article className="overflow-hidden rounded border border-line bg-parchment">
      <div className="relative h-44 w-full bg-bark">
        <PropertyMedia variant={property.mediaVariant} className="h-full w-full" label={`Illustration standing in for a photo of ${property.title}`} />
        <div className="absolute left-3 top-3">
          <VerificationBadge state={property.verificationState} />
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite(property.slug)}
          aria-pressed={property.isFavorited}
          aria-label={property.isFavorited ? "Remove from saved properties" : "Save property"}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-parchment/90 text-ink"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={property.isFavorited ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1.2 4.5 2.5C12 6.2 13.5 5 15.5 5 19 5 21.5 8.5 19.5 12.5 17 16.65 12 21 12 21z" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-4">
        <p className="font-display text-lg font-semibold text-ink">{priceLabel}</p>
        <Link href={`/properties/${property.slug}`} className="mt-1 block text-sm font-semibold text-ink hover:underline">
          {property.title}
        </Link>
        <p className="mt-0.5 text-xs text-ink-soft">{property.locationLabel}</p>

        <div className="mt-4 flex gap-4 border-t border-line pt-4 text-xs text-ink-soft">
          <span><strong className="text-ink">{property.bedrooms ?? "N/A"}</strong> beds</span>
          <span><strong className="text-ink">{property.bathrooms}</strong> baths</span>
          <span><strong className="text-ink">{property.sizeSqm}</strong> sqm</span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-ink-soft">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-patina font-mono text-[10px] font-bold text-white">
            {property.agentName
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </span>
          {property.agentName} · {property.agentRole === "agent" ? "Verified agent" : "Landlord"}
        </div>
      </div>
    </article>
  );
}
