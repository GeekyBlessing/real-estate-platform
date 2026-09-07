import { CameraIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface MissingListingPhotoProps {
  className?: string;
  /** Slightly different copy for a single card thumbnail vs. the full detail-page gallery. */
  compact?: boolean;
}

/**
 * What renders in a listing's image slot before its seller has
 * uploaded a real photo, everywhere a card, gallery, or detail page
 * needs an image: not a generated illustration (the brief is explicit
 * that a cartoon house or car reads as fake), not a stock photo
 * standing in for a specific property or vehicle it isn't (the brief
 * is equally explicit that would misrepresent the listing), just an
 * honest, designed placeholder that looks like part of the product
 * and is unmistakably a placeholder, not photography.
 */
export function MissingListingPhoto({ className, compact }: MissingListingPhotoProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-1.5 bg-paper-deep text-clay",
        className
      )}
    >
      <CameraIcon size={compact ? 20 : 28} />
      <span className={compact ? "text-caption font-medium" : "text-body-sm font-medium"}>Photos coming soon</span>
    </div>
  );
}
