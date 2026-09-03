"use client";

import { useState } from "react";
import { PropertyMedia } from "./PropertyMedia";
import { cn } from "@/lib/utils";

export interface PropertyGalleryProps {
  title: string;
  baseVariant: number;
  imageCount: number;
}

/**
 * Large hero image, a supporting grid, an image count, and a
 * fullscreen view, per the blueprint's property detail spec. Built
 * against illustrated PropertyMedia placeholders; swapping in real
 * photo URLs from the media pipeline (Section 12) does not change
 * this component's structure, only what PropertyMedia renders.
 */
export function PropertyGallery({ title, baseVariant, imageCount }: PropertyGalleryProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const supportingCount = Math.min(imageCount - 1, 4);

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:grid-rows-2">
        <button
          type="button"
          onClick={() => {
            setActiveIndex(0);
            setFullscreen(true);
          }}
          className="relative col-span-1 row-span-2 h-64 overflow-hidden rounded sm:col-span-2 sm:h-full"
        >
          <PropertyMedia variant={baseVariant} className="h-full w-full" label={`Main illustration for ${title}`} />
        </button>
        {Array.from({ length: supportingCount }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              setActiveIndex(index + 1);
              setFullscreen(true);
            }}
            className="relative hidden h-full overflow-hidden rounded sm:block"
          >
            <PropertyMedia variant={baseVariant + index + 1} className="h-full w-full" label={`Supporting illustration ${index + 1} for ${title}`} />
            {index === supportingCount - 1 && imageCount > supportingCount + 1 && (
              <span className="absolute inset-0 flex items-center justify-center bg-ink/55 font-mono text-sm text-parchment">
                +{imageCount - supportingCount - 1} more
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="mt-2 font-mono text-xs text-bark">{imageCount} images</p>

      {fullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} gallery`}
          className="fixed inset-0 z-50 flex flex-col bg-ink/95 p-4"
        >
          <div className="flex items-center justify-between text-parchment">
            <span className="font-mono text-xs">
              {activeIndex + 1} / {imageCount}
            </span>
            <button type="button" onClick={() => setFullscreen(false)} aria-label="Close gallery" className="rounded-full p-2 hover:bg-parchment/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="relative mt-4 flex-1 overflow-hidden rounded">
            <PropertyMedia variant={baseVariant + activeIndex} className="h-full w-full" label={`Full screen illustration ${activeIndex + 1}`} />
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: imageCount }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show image ${index + 1}`}
                className={cn("h-1.5 w-6 rounded-full", index === activeIndex ? "bg-patina" : "bg-parchment/30")}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
