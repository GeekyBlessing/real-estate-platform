import { ListingImage } from "@/components/ui/ListingImage";
import { MissingListingPhoto } from "@/components/ui/MissingListingPhoto";
import { ListingImageRef } from "@/lib/listings";

export interface ListingMediaProps {
  image: ListingImageRef | undefined;
  /** Used when this particular image has no alt of its own. */
  fallbackAlt: string;
  className?: string;
  priority?: boolean;
  /** Passed through to MissingListingPhoto for a card thumbnail vs. a full gallery pane. */
  compact?: boolean;
}

/**
 * The one place a listing image is rendered, for both categories,
 * wherever a card, gallery, or category tile needs one. image is
 * undefined for a listing with no uploaded photos yet (see
 * ListingImageRef's doc comment on why that's a real, expected state
 * rather than something every call site works around); this renders
 * MissingListingPhoto for that case instead of asking the caller to
 * remember to check images.length itself.
 */
export function ListingMedia({ image, fallbackAlt, className, priority, compact }: ListingMediaProps) {
  if (!image) {
    return <MissingListingPhoto className={className} compact={compact} />;
  }

  return (
    <ListingImage
      src={image.url}
      alt={image.alt ?? fallbackAlt}
      className={className}
      priority={priority}
      fallback={<MissingListingPhoto className={className} compact={compact} />}
    />
  );
}
