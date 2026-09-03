import { cn } from "@/lib/utils";

/**
 * Illustrated placeholder standing in for real property photography.
 * Deliberately not a stock photo and not an AI generated image: both
 * would either look generic or risk reading as a real photo of a
 * property that does not exist. Phase 4's media pipeline (Section 12
 * of the architecture) replaces this with the owner's or agent's
 * actual uploaded images once that exists; nothing here pretends to
 * be a real listing photo in the meantime.
 */
const PALETTES = [
  { from: "#9C7C55", to: "#6E5439", roof: "#5C4530" },
  { from: "#C6AE86", to: "#8A6F4E", roof: "#6E5439" },
  { from: "#B08F63", to: "#6B5439", roof: "#4A3826" },
  { from: "#A88F6E", to: "#5C4A34", roof: "#3F3020" },
];

export interface PropertyMediaProps {
  variant: number;
  className?: string;
  label?: string;
}

export function PropertyMedia({ variant, className, label }: PropertyMediaProps) {
  const palette = PALETTES[Math.abs(variant) % PALETTES.length]!;
  const gradientId = `property-media-${variant}`;

  return (
    <div className={cn("relative overflow-hidden", className)} role="img" aria-label={label ?? "Illustrated property placeholder"}>
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={palette.from} />
            <stop offset="1" stopColor={palette.to} />
          </linearGradient>
        </defs>
        <rect width="400" height="260" fill={`url(#${gradientId})`} />
        <path d={`M0 195 L${100 + (variant % 3) * 10} 115 L200 195 Z`} fill={palette.roof} opacity="0.6" />
        <path d={`M150 195 L${260 + (variant % 2) * 15} 90 L370 195 Z`} fill={palette.roof} opacity="0.55" />
        <rect x="70" y="195" width="60" height="60" fill={palette.roof} opacity="0.45" />
        <rect x="220" y="195" width="90" height="60" fill={palette.roof} opacity="0.4" />
      </svg>
    </div>
  );
}
