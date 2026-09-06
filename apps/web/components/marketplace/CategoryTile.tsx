import Link from "next/link";
import { PropertyIllustration } from "@/components/property/PropertyIllustration";
import { VehicleIllustration } from "@/components/vehicle/VehicleIllustration";

export interface CategoryTileProps {
  href: string;
  title: string;
  description: string;
  variant: "property" | "vehicle";
}

/**
 * The homepage's two entry points into the marketplace, styled as
 * real category surfaces rather than boring dashboard tiles. Used to
 * attempt a demo photo from an external service before falling back
 * to a plain glyph; now renders the same illustrated scene system
 * every card and gallery uses (components/ui/ListingMedia.tsx) directly,
 * since there is no listing-specific photo for a category tile to
 * ever load in the first place.
 */
export function CategoryTile({ href, title, description, variant }: CategoryTileProps) {
  return (
    <Link
      href={href}
      className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded text-parchment transition-transform active:scale-[0.98] sm:aspect-[16/9]"
    >
      {variant === "property" ? (
        <PropertyIllustration scene="duplex-exterior" seed={1} className="absolute inset-0 h-full w-full" label="" />
      ) : (
        <VehicleIllustration scene="suv-exterior" seed={1} className="absolute inset-0 h-full w-full" label="" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/0 to-transparent" aria-hidden="true" />
      <div className="relative p-5">
        <p className="text-h3 font-semibold">{title}</p>
        <p className="mt-0.5 text-body-sm text-parchment/85">{description}</p>
      </div>
    </Link>
  );
}
