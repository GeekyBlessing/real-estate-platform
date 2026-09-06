import { ListingImage } from "@/components/ui/ListingImage";
import { PropertyIllustration } from "@/components/property/PropertyIllustration";
import { VehicleIllustration } from "@/components/vehicle/VehicleIllustration";
import { ListingImageRef } from "@/lib/listings";

export interface ListingMediaProps {
  image: ListingImageRef;
  category: "property" | "vehicle";
  /** Used when this particular image has no alt of its own. */
  fallbackAlt: string;
  className?: string;
  priority?: boolean;
}

/**
 * The one place a listing image is rendered, for both categories,
 * wherever a card, gallery, or category tile needs one. Every listing
 * in this build has images with no url yet (real uploads are later
 * backend work), so today this always renders the illustrated scene
 * directly rather than attempting a network request that would only
 * fail. The moment a ListingImageRef gets a real url, this same call
 * site starts trying to load it first, falling back to the same
 * illustration only if that photo fails, with no change needed in
 * PropertyCard, VehicleCard, or either gallery.
 */
export function ListingMedia({ image, category, fallbackAlt, className, priority }: ListingMediaProps) {
  const alt = image.alt ?? fallbackAlt;
  const illustration =
    category === "property" ? (
      <PropertyIllustration scene={image.scene} seed={image.seed} colorSeed={image.colorSeed} className={className} label={alt} />
    ) : (
      <VehicleIllustration scene={image.scene} seed={image.seed} colorSeed={image.colorSeed} className={className} label={alt} />
    );

  if (!image.url) {
    return illustration;
  }

  return <ListingImage src={image.url} alt={alt} className={className} priority={priority} fallback={illustration} />;
}
