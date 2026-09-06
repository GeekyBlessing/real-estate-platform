"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ListingMedia } from "@/components/ui/ListingMedia";
import { ListingImageRef } from "@/lib/listings";
import { useFavorites } from "@/lib/favorites-context";
import { ChevronLeftIcon as BackIcon, ShareIcon, HeartIcon } from "@/components/ui/icons";

export interface VehicleGalleryProps {
  title: string;
  slug: string;
  images: ListingImageRef[];
}

/**
 * The vehicle equivalent of PropertyGallery (components/property/PropertyGallery.tsx):
 * a full-bleed swipeable hero with Back/Share/Save as overlay controls
 * and a 1/N counter, rather than a desktop photo grid.
 */
export function VehicleGallery({ title, slug, images }: VehicleGalleryProps) {
  const router = useRouter();
  const { isFavorited, toggleFavorite } = useFavorites();
  const favorited = isFavorited("vehicle", slug);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const imageCount = images.length;

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== activeIndex) setActiveIndex(index);
  }

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title, url }).catch(() => undefined);
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => undefined);
    }
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto sm:aspect-[16/9] sm:rounded"
      >
        {images.map((image, index) => (
          <div key={index} className="relative h-full w-full flex-none snap-start">
            <ListingMedia
              image={image}
              category="vehicle"
              fallbackAlt={index === 0 ? title : `${title}, photo ${index + 1}`}
              priority={index === 0}
              className="h-full w-full"
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3 sm:p-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-ink/55 text-parchment backdrop-blur-sm transition-transform active:scale-90"
        >
          <BackIcon size={19} active />
        </button>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share this listing"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/55 text-parchment backdrop-blur-sm transition-transform active:scale-90"
          >
            <ShareIcon size={17} active />
          </button>
          <button
            type="button"
            onClick={() => toggleFavorite("vehicle", slug)}
            aria-pressed={favorited}
            aria-label={favorited ? "Remove from saved vehicles" : "Save vehicle"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/55 text-parchment backdrop-blur-sm transition-transform active:scale-90"
          >
            <span className={favorited ? "text-patina" : undefined}>
              <HeartIcon size={18} active filled={favorited} />
            </span>
          </button>
        </div>
      </div>

      {imageCount > 1 && (
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/60 px-2.5 py-1 text-caption font-semibold text-parchment backdrop-blur-sm">
          {activeIndex + 1} / {imageCount}
        </span>
      )}
    </div>
  );
}
