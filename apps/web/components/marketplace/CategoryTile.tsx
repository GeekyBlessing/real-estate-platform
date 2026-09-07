import Link from "next/link";
import { BuildingIcon, CarIcon } from "@/components/ui/icons";

export interface CategoryTileProps {
  href: string;
  title: string;
  description: string;
  variant: "property" | "vehicle";
}

/**
 * The homepage's two entry points into the marketplace. This is
 * category iconography, not listing photography, so it's held to a
 * different rule than a property or vehicle's own gallery
 * (ListingMedia): there's no real listing behind a category tile for
 * a photo to ever belong to, so a solid brand surface with the
 * category's own icon is the honest choice here, not a generated
 * illustration standing in for a photo (that's what the previous
 * version did) and not a stock photo either (there's nothing specific
 * for a stock photo to depict).
 */
export function CategoryTile({ href, title, description, variant }: CategoryTileProps) {
  const Icon = variant === "property" ? BuildingIcon : CarIcon;
  return (
    <Link
      href={href}
      className={
        "group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded text-parchment transition-transform active:scale-[0.98] sm:aspect-[16/9] " +
        (variant === "property" ? "bg-ink" : "bg-bark")
      }
    >
      <Icon size={96} className="pointer-events-none absolute -bottom-4 -right-4 text-parchment/10" aria-hidden="true" />
      <div className="relative p-5">
        <p className="text-h3 font-semibold">{title}</p>
        <p className="mt-0.5 text-body-sm text-parchment/85">{description}</p>
      </div>
    </Link>
  );
}
