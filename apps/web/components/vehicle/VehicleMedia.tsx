import { cn } from "@/lib/utils";

/**
 * The vehicle equivalent of PropertyMedia (components/property/PropertyMedia.tsx).
 * A deliberately different illustration, a car silhouette rather than
 * a roofline, so a vehicle card never reads as a property card with a
 * different label, matching the same reasoning PropertyMedia already
 * documents: not a stock photo, not an AI generated image, standing
 * in until a seller's real photos exist.
 */
const PALETTES = [
  { from: "#9C7C55", to: "#6E5439", body: "#3F3020" },
  { from: "#C6AE86", to: "#8A6F4E", body: "#4A3826" },
  { from: "#B08F63", to: "#6B5439", body: "#3A2C1D" },
  { from: "#A88F6E", to: "#5C4A34", body: "#2E2216" },
];

export interface VehicleMediaProps {
  variant: number;
  className?: string;
  label?: string;
}

export function VehicleMedia({ variant, className, label }: VehicleMediaProps) {
  const palette = PALETTES[Math.abs(variant) % PALETTES.length]!;
  const gradientId = `vehicle-media-${variant}`;

  return (
    <div className={cn("relative overflow-hidden", className)} role="img" aria-label={label ?? "Illustrated vehicle placeholder"}>
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={palette.from} />
            <stop offset="1" stopColor={palette.to} />
          </linearGradient>
        </defs>
        <rect width="400" height="260" fill={`url(#${gradientId})`} />
        <path
          d="M55 175 C55 150 75 148 95 145 L125 112 C132 104 142 100 152 100 L235 100 C246 100 256 105 262 114 L285 145 C305 148 325 152 325 175 L325 182 L55 182 Z"
          fill={palette.body}
          opacity="0.62"
        />
        <path
          d="M148 108 L160 145 L245 145 L232 108 Z"
          fill={palette.from}
          opacity="0.35"
        />
        <circle cx="115" cy="182" r="22" fill={palette.body} opacity="0.75" />
        <circle cx="265" cy="182" r="22" fill={palette.body} opacity="0.75" />
        <circle cx="115" cy="182" r="9" fill={palette.from} opacity="0.5" />
        <circle cx="265" cy="182" r="9" fill={palette.from} opacity="0.5" />
      </svg>
    </div>
  );
}
