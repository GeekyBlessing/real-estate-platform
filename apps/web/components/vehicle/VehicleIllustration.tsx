import { cn } from "@/lib/utils";
import { skyFor, carFor } from "@/components/ui/illustration-palette";

/**
 * Replaces the old single-drawing VehicleMedia fallback, the vehicle
 * equivalent of PropertyIllustration (components/property/PropertyIllustration.tsx):
 * a distinct body silhouette per VEHICLE_BODY_TYPES entry (lib/vehicles.ts),
 * filled in the car's own body color (`colorSeed`, constant across one
 * listing's own gallery, see lib/listings.ts) with a two tone shaded
 * lower panel, real-looking glass, wheels with a rim detail, and
 * headlight/taillight color, rather than a white outline traced on a
 * flat brown rectangle.
 */
export type VehicleScene =
  | "sedan-exterior"
  | "suv-exterior"
  | "hatchback-exterior"
  | "pickup-exterior"
  | "van-exterior"
  | "coupe-exterior"
  | "interior-dashboard";

export interface VehicleIllustrationProps {
  scene: string;
  seed: number;
  colorSeed?: number;
  className?: string;
  label?: string;
}

type Car = ReturnType<typeof carFor>;

function Wheel({ cx, r, trim }: { cx: number; r: number; trim: string }) {
  return (
    <g>
      <circle cx={cx} cy="205" r={r} fill="#1A1714" />
      <circle cx={cx} cy="205" r={r - 6} fill={trim} />
      <circle cx={cx} cy="205" r={r - 11} fill="#1A1714" />
    </g>
  );
}

function RoadShadow({ cx, rx }: { cx: number; rx: number }) {
  return <ellipse cx={cx} cy="222" rx={rx} ry="9" fill="#1A1714" opacity="0.25" />;
}

function SedanExterior({ c }: { c: Car }) {
  return (
    <>
      <RoadShadow cx={190} rx={140} />
      <path
        d="M75 205 C75 182 92 180 108 178 L132 150 C138 143 147 139 156 139 L228 139 C238 139 247 144 252 152 L272 178 C289 180 305 184 305 205 Z"
        fill={c.body}
      />
      <path d="M75 205 L305 205 L305 195 L75 195 Z" fill={c.bodyShade} />
      <path d="M138 150 L152 143 L226 143 L246 150 L232 152 L152 152 Z" fill={c.glass} />
      <rect x="186" y="150" width="4" height="10" fill={c.body} />
      <circle cx="90" cy="182" r="4" fill="#F4E7B8" />
      <circle cx="292" cy="182" r="4" fill="#B8302A" />
      <Wheel cx={128} r={19} trim={c.trim} />
      <Wheel cx={252} r={19} trim={c.trim} />
    </>
  );
}

function SuvExterior({ c }: { c: Car }) {
  return (
    <>
      <RoadShadow cx={200} rx={155} />
      <path
        d="M65 205 C65 178 85 175 100 172 L125 135 C132 127 143 122 154 122 L246 122 C258 122 268 128 274 137 L296 172 C312 175 335 180 335 205 Z"
        fill={c.body}
      />
      <path d="M65 205 L335 205 L335 193 L65 193 Z" fill={c.bodyShade} />
      <path d="M132 135 L150 126 L250 126 L268 135 L250 138 L150 138 Z" fill={c.glass} />
      <line x1="199" y1="126" x2="199" y2="172" stroke={c.body} strokeWidth="3" />
      <circle cx="82" cy="178" r="4" fill="#F4E7B8" />
      <circle cx="318" cy="178" r="4" fill="#B8302A" />
      <Wheel cx={118} r={21} trim={c.trim} />
      <Wheel cx={282} r={21} trim={c.trim} />
    </>
  );
}

function HatchbackExterior({ c }: { c: Car }) {
  return (
    <>
      <RoadShadow cx={180} rx={120} />
      <path
        d="M80 205 C80 185 95 182 110 180 L130 152 C136 145 145 141 154 141 L206 141 C216 141 224 146 229 154 L246 180 C262 182 278 187 278 205 Z"
        fill={c.body}
      />
      <path d="M80 205 L278 205 L278 196 L80 196 Z" fill={c.bodyShade} />
      <path d="M136 152 L150 144 L204 144 L222 152 L210 154 L150 154 Z" fill={c.glass} />
      <circle cx="96" cy="184" r="3.5" fill="#F4E7B8" />
      <circle cx="264" cy="184" r="3.5" fill="#B8302A" />
      <Wheel cx={128} r={17} trim={c.trim} />
      <Wheel cx={232} r={17} trim={c.trim} />
    </>
  );
}

function PickupExterior({ c }: { c: Car }) {
  return (
    <>
      <RoadShadow cx={190} rx={150} />
      <path
        d="M70 205 C70 183 85 180 98 178 L118 150 C124 143 133 139 142 139 L188 139 C196 139 202 144 205 151 L212 178 Z"
        fill={c.body}
      />
      <path d="M212 178 L212 165 L303 165 L307 178 Z" fill={c.bodyShade} />
      <path d="M212 178 L307 178 L307 205 L212 205 Z" fill={c.body} />
      <line x1="212" y1="178" x2="307" y2="178" stroke={c.bodyShade} strokeWidth="2" />
      <path d="M124 150 L136 143 L186 143 L200 151 L188 153 L136 153 Z" fill={c.glass} />
      <path d="M70 205 L212 205 L212 195 L70 195 Z" fill={c.bodyShade} />
      <circle cx="90" cy="182" r="4" fill="#F4E7B8" />
      <Wheel cx={118} r={19} trim={c.trim} />
      <Wheel cx={270} r={19} trim={c.trim} />
    </>
  );
}

function VanExterior({ c }: { c: Car }) {
  return (
    <>
      <RoadShadow cx={192} rx={160} />
      <path d="M65 205 L65 145 C65 135 72 128 82 128 L300 128 C312 128 320 136 320 147 L320 205 Z" fill={c.body} />
      <path d="M65 205 L320 205 L320 193 L65 193 Z" fill={c.bodyShade} />
      <rect x="80" y="140" width="24" height="20" fill={c.glass} />
      <rect x="140" y="140" width="30" height="18" fill={c.glass} />
      <rect x="180" y="140" width="30" height="18" fill={c.glass} />
      <rect x="220" y="140" width="30" height="18" fill={c.glass} />
      <circle cx="80" cy="178" r="4" fill="#F4E7B8" />
      <circle cx="305" cy="178" r="4" fill="#B8302A" />
      <Wheel cx={115} r={20} trim={c.trim} />
      <Wheel cx={270} r={20} trim={c.trim} />
    </>
  );
}

function CoupeExterior({ c }: { c: Car }) {
  return (
    <>
      <RoadShadow cx={185} rx={150} />
      <path
        d="M55 205 C55 190 75 188 95 186 L150 160 C158 152 172 148 185 148 L235 148 C246 148 256 153 262 161 L288 186 C302 188 318 192 318 205 Z"
        fill={c.body}
      />
      <path d="M55 205 L318 205 L318 197 L55 197 Z" fill={c.bodyShade} />
      <path d="M156 160 L172 152 L233 152 L256 161 L242 163 L172 163 Z" fill={c.glass} />
      <circle cx="72" cy="190" r="3.5" fill="#F4E7B8" />
      <circle cx="302" cy="190" r="3.5" fill="#B8302A" />
      <Wheel cx={110} r={19} trim={c.trim} />
      <Wheel cx={280} r={19} trim={c.trim} />
    </>
  );
}

function InteriorDashboard({ c }: { c: Car }) {
  return (
    <>
      <rect x="0" y="0" width="400" height="300" fill={c.glass} opacity="0.18" />
      <path d="M40 230 C40 150 150 110 260 110 C330 110 360 150 365 230 Z" fill={c.body} />
      <circle cx="110" cy="188" r="30" fill="#1A1714" />
      <circle cx="110" cy="188" r="22" fill={c.bodyShade} />
      <circle cx="110" cy="188" r="6" fill="#1A1714" />
      <rect x="195" y="138" width="45" height="30" rx="6" fill="#1A1714" />
      <rect x="200" y="143" width="35" height="20" rx="3" fill={c.glass} />
      <rect x="270" y="150" width="60" height="24" rx="6" fill="#1A1714" />
      <path d="M150 180 C220 165 290 165 340 180 L340 205 L150 205 Z" fill={c.bodyShade} />
    </>
  );
}

const SCENES: Record<string, (props: { c: Car }) => JSX.Element> = {
  "sedan-exterior": SedanExterior,
  "suv-exterior": SuvExterior,
  "hatchback-exterior": HatchbackExterior,
  "pickup-exterior": PickupExterior,
  "van-exterior": VanExterior,
  "coupe-exterior": CoupeExterior,
  "interior-dashboard": InteriorDashboard,
};

export function VehicleIllustration({ scene, seed, colorSeed, className, label }: VehicleIllustrationProps) {
  const sky = skyFor(seed);
  const c = carFor(colorSeed ?? seed);
  const Scene = SCENES[scene] ?? SedanExterior;
  const interior = scene === "interior-dashboard";
  const gradientId = `vehicle-sky-${scene}-${seed}-${colorSeed ?? 0}`;

  return (
    <div className={cn("relative overflow-hidden", className)} role="img" aria-label={label ?? "Vehicle photography is not yet available for this listing"}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sky.skyTop} />
            <stop offset="1" stopColor={sky.skyBottom} />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill={interior ? sky.skyBottom : `url(#${gradientId})`} />
        {!interior && (
          <>
            <rect x="0" y="205" width="400" height="95" fill={sky.ground} />
            <line x1="0" y1="222" x2="400" y2="222" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="16 12" />
          </>
        )}
        <Scene c={c} />
      </svg>
    </div>
  );
}
