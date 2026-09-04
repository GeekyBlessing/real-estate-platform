import Link from "next/link";
import { VerificationBadge } from "@/components/ui/Badge";
import { VehicleMedia } from "./VehicleMedia";
import { formatNaira, formatMileage } from "@/lib/utils";
import { VehicleCardData, sellerRoleLabel } from "@/lib/listings";

export interface VehicleCardProps {
  vehicle: VehicleCardData;
  onToggleFavorite: (slug: string) => void;
}

/**
 * Deliberately a different information hierarchy from PropertyCard,
 * not the same card with different field names. A buyer evaluates a
 * car by make, model, and year first, then mileage, transmission,
 * and fuel, which is the order this card follows, matching the
 * shape described for the vehicle marketplace.
 */
export function VehicleCard({ vehicle, onToggleFavorite }: VehicleCardProps) {
  return (
    <article className="overflow-hidden rounded border border-line bg-parchment">
      <div className="relative h-44 w-full bg-bark">
        <VehicleMedia variant={vehicle.mediaVariant} className="h-full w-full" label={`Illustration standing in for a photo of ${vehicle.title}`} />
        <div className="absolute left-3 top-3">
          <VerificationBadge state={vehicle.verificationState} />
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite(vehicle.slug)}
          aria-pressed={vehicle.isFavorited}
          aria-label={vehicle.isFavorited ? "Remove from saved vehicles" : "Save vehicle"}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-parchment/90 text-ink"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={vehicle.isFavorited ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1.2 4.5 2.5C12 6.2 13.5 5 15.5 5 19 5 21.5 8.5 19.5 12.5 17 16.65 12 21 12 21z" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-4">
        <p className="font-display text-lg font-semibold text-ink">{formatNaira(vehicle.priceInKobo)}</p>
        <Link href={`/cars/${vehicle.slug}`} className="mt-1 block text-sm font-semibold text-ink hover:underline">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Link>
        <p className="mt-0.5 text-xs text-ink-soft">{vehicle.location.label}</p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-4 text-xs text-ink-soft">
          <span className="font-semibold text-ink">{formatMileage(vehicle.mileageKm)}</span>
          <span className="capitalize">{vehicle.transmission}</span>
          <span>{vehicle.fuelType}</span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-ink-soft">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-patina font-mono text-[10px] font-bold text-white">
            {vehicle.listedBy.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </span>
          {vehicle.listedBy.name} · {sellerRoleLabel(vehicle.listedBy.role)}
        </div>
      </div>
    </article>
  );
}
