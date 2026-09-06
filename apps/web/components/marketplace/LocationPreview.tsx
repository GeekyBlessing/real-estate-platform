export interface LocationPreviewProps {
  areaLabel: string;
}

/**
 * A stylized area preview, not a wired-up interactive map: this build
 * has no map provider integrated yet, and a static graphic that is
 * honestly just a graphic is preferable to a "map" a user might try
 * to pan or zoom and have nothing happen. Deliberately shows only the
 * neighborhood/area, never a precise address or plot, per the brief's
 * instruction not to expose exact residential location unnecessarily;
 * the real address is something a seller shares once an inspection is
 * actually confirmed.
 */
export function LocationPreview({ areaLabel }: LocationPreviewProps) {
  return (
    <section>
      <h2 className="text-h3 font-semibold text-ink">Location</h2>
      <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded border border-line bg-paper-deep">
        <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <rect width="400" height="225" fill="#EFE6D3" />
          {[40, 120, 200, 280, 360].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="225" stroke="#CDBA9B" strokeWidth="3" />
          ))}
          {[30, 100, 170, 240].map((y) => (
            <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#CDBA9B" strokeWidth="3" />
          ))}
          <circle cx="200" cy="100" r="7" fill="#8A5A2B" />
          <circle cx="200" cy="100" r="16" fill="#8A5A2B" opacity="0.25" />
        </svg>
        <span className="absolute bottom-2 left-2 rounded-full bg-parchment/90 px-2.5 py-1 text-caption font-semibold text-ink-soft">
          Preview, not an interactive map
        </span>
      </div>
      <p className="mt-2 text-body-sm text-ink-soft">{areaLabel}</p>
      <p className="mt-1 text-caption text-ink-soft">The exact address is shared directly once an inspection is confirmed.</p>
    </section>
  );
}
