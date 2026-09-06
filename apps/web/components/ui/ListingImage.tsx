"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

export interface ListingImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Shown instead of the photo if it fails to load, e.g. no network or the demo photo service is unreachable. */
  fallback: ReactNode;
  /** Eager-load for the one image that's above the fold on first paint (a gallery hero); every other instance lazy-loads. */
  priority?: boolean;
}

/**
 * The one place a real listing photo is loaded and rendered, so the
 * blur-up transition, lazy loading, and offline/error fallback only
 * exist once. Rendered by ListingMedia (components/ui/ListingMedia.tsx)
 * whenever a listing image has a real url, falling back to the
 * PropertyIllustration/VehicleIllustration treatment if that photo
 * fails to load, rather than a broken image icon.
 */
export function ListingImage({ src, alt, className, fallback, priority }: ListingImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  if (status === "error") {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div className={cn("relative overflow-hidden bg-paper-deep", className)}>
      {status === "loading" && <div className="absolute inset-0 animate-pulse bg-paper-deep" aria-hidden="true" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          status === "loaded" ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
