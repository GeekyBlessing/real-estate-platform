import { cn } from "@/lib/utils";
import { skyFor, buildingFor } from "@/components/ui/illustration-palette";

/**
 * Replaces the old single-drawing PropertyMedia fallback. Real
 * property photography does not exist yet in this build, uploads are
 * later backend work (see roadmap-reconciliation.md), and the sandbox
 * this app is developed in cannot reach any external photo service
 * either, so a stand-in is unavoidable for now.
 *
 * This is not a technical line drawing: every shape below is a solid
 * fill (a wall color, a roof color, a glass color, a ground shadow),
 * not a stroked outline on a flat brown rectangle, because a filled
 * illustration reads as a considered piece of art and a thin white
 * outline on brown reads as an unfinished wireframe. `scene` picks the
 * massing (an apartment block, a duplex, a bungalow, a plot of land, a
 * shop, all drawn as themselves), `seed` picks the sky and ground
 * lighting variant, and `colorSeed` (constant across one listing's own
 * gallery, see lib/listings.ts) picks the wall/roof/door color so two
 * different listings do not come out looking like the same building
 * painted the same way. Every card and gallery renders through
 * ListingMedia (components/ui/ListingMedia.tsx), which swaps this out
 * for the real photo the moment a listing's ListingImageRef has a url.
 */
export type PropertyScene =
  | "apartment-exterior"
  | "duplex-exterior"
  | "bungalow-exterior"
  | "land-plot"
  | "shop-storefront"
  | "office-exterior"
  | "studio-exterior"
  | "interior-living"
  | "interior-kitchen"
  | "interior-office"
  | "interior-shop";

export interface PropertyIllustrationProps {
  scene: string;
  seed: number;
  colorSeed?: number;
  className?: string;
  label?: string;
}

type Building = ReturnType<typeof buildingFor>;

function windowGrid(x: number, y: number, cols: number, rows: number, cellW: number, cellH: number, gapX: number, gapY: number, fill: string) {
  const cells: JSX.Element[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push(<rect key={`${r}-${c}`} x={x + c * (cellW + gapX)} y={y + r * (cellH + gapY)} width={cellW} height={cellH} fill={fill} />);
    }
  }
  return cells;
}

function GroundShadow({ cx, rx, fill }: { cx: number; rx: number; fill: string }) {
  return <ellipse cx={cx} cy="222" rx={rx} ry="10" fill={fill} opacity="0.55" />;
}

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-3" y="0" width="6" height="26" fill="#5C4530" />
      <ellipse cx="0" cy="-14" rx="22" ry="24" fill="#6E7F52" />
      <ellipse cx="-8" cy="-22" rx="13" ry="14" fill="#7C8F5C" />
    </g>
  );
}

function ApartmentExterior({ b }: { b: Building }) {
  return (
    <>
      <GroundShadow cx={200} rx={120} fill={b.wallShade} />
      <rect x="115" y="60" width="170" height="145" fill={b.wall} />
      <rect x="115" y="60" width="170" height="10" fill={b.wallShade} />
      <rect x="255" y="60" width="30" height="145" fill={b.wallShade} opacity="0.5" />
      {windowGrid(133, 78, 4, 4, 20, 22, 12, 12, b.glass)}
      <rect x="270" y="106" width="12" height="20" fill={b.wallShade} />
      <rect x="270" y="148" width="12" height="20" fill={b.wallShade} />
      <rect x="184" y="175" width="32" height="30" fill={b.door} />
      <Tree x={72} y={196} scale={0.9} />
      <Tree x={330} y={200} scale={0.7} />
    </>
  );
}

function DuplexExterior({ b }: { b: Building }) {
  return (
    <>
      <GroundShadow cx={200} rx={130} fill={b.wallShade} />
      <path d="M110 90 L200 50 L290 90 Z" fill={b.roof} />
      <rect x="110" y="90" width="180" height="115" fill={b.wall} />
      <rect x="230" y="90" width="60" height="115" fill={b.wallShade} opacity="0.45" />
      <rect x="185" y="163" width="30" height="42" fill={b.door} />
      <rect x="130" y="163" width="30" height="30" fill={b.glass} />
      <rect x="240" y="163" width="30" height="30" fill={b.glass} />
      {windowGrid(132, 103, 3, 1, 30, 28, 24, 0, b.glass)}
      <rect x="90" y="198" width="220" height="7" fill={b.wallShade} />
      <Tree x={60} y={200} scale={1.05} />
    </>
  );
}

function BungalowExterior({ b }: { b: Building }) {
  return (
    <>
      <GroundShadow cx={200} rx={150} fill={b.wallShade} />
      <path d="M80 110 L200 75 L320 110 L320 118 L80 118 Z" fill={b.roof} />
      <rect x="80" y="118" width="240" height="87" fill={b.wall} />
      <rect x="80" y="118" width="240" height="10" fill={b.wallShade} opacity="0.6" />
      <rect x="122" y="145" width="34" height="30" fill={b.glass} />
      <rect x="244" y="145" width="34" height="30" fill={b.glass} />
      <rect x="186" y="155" width="28" height="50" fill={b.door} />
      <Tree x={345} y={205} scale={0.85} />
    </>
  );
}

function LandPlot({ b }: { b: Building }) {
  return (
    <>
      <path d="M60 230 L340 230 L300 90 L100 90 Z" fill="#7C8F5C" opacity="0.55" />
      <path d="M60 230 L340 230 L300 90 L100 90 Z" fill="none" stroke={b.door} strokeWidth="2.5" strokeDasharray="10 8" />
      <circle cx="60" cy="230" r="5" fill={b.door} />
      <circle cx="340" cy="230" r="5" fill={b.door} />
      <circle cx="300" cy="90" r="5" fill={b.door} />
      <circle cx="100" cy="90" r="5" fill={b.door} />
      <path d="M200 230 L245 140" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" />
      <Tree x={128} y={126} scale={0.6} />
      <Tree x={270} y={118} scale={0.5} />
      <g transform="translate(312 55)">
        <line x1="0" y1="0" x2="0" y2="35" stroke={b.door} strokeWidth="3" />
        <path d="M0 0 L28 8 L0 16 Z" fill={b.door} />
      </g>
    </>
  );
}

function ShopStorefront({ b }: { b: Building }) {
  return (
    <>
      <GroundShadow cx={200} rx={130} fill={b.wallShade} />
      <rect x="90" y="75" width="220" height="28" fill={b.roof} />
      <path d="M90 103 L100 118 L240 118 L235 103 Z" fill={b.wallShade} />
      <rect x="100" y="118" width="140" height="75" fill={b.glass} />
      <line x1="170" y1="118" x2="170" y2="193" stroke={b.wall} strokeWidth="3" />
      <rect x="255" y="118" width="55" height="87" fill={b.wall} />
      {Array.from({ length: 5 }).map((_, index) => (
        <rect key={index} x="261" y={126 + index * 15} width="43" height="9" fill={b.wallShade} opacity="0.7" />
      ))}
      <Tree x={72} y={200} scale={0.75} />
    </>
  );
}

function OfficeExterior({ b }: { b: Building }) {
  return (
    <>
      <GroundShadow cx={200} rx={115} fill={b.wallShade} />
      <rect x="100" y="55" width="200" height="150" fill={b.wall} />
      <rect x="240" y="55" width="60" height="150" fill={b.wallShade} opacity="0.5" />
      {windowGrid(112, 66, 6, 5, 22, 18, 6, 8, b.glass)}
      <rect x="178" y="195" width="44" height="10" fill={b.wallShade} />
      <rect x="185" y="172" width="30" height="33" fill={b.door} />
    </>
  );
}

function StudioExterior({ b }: { b: Building }) {
  return (
    <>
      <GroundShadow cx={200} rx={110} fill={b.wallShade} />
      <rect x="120" y="85" width="160" height="120" fill={b.wall} />
      <rect x="145" y="108" width="48" height="46" fill={b.glass} />
      <rect x="220" y="140" width="36" height="65" fill={b.door} />
      <rect x="100" y="182" width="32" height="22" fill={b.wallShade} />
      <Tree x={330} y={198} scale={0.7} />
    </>
  );
}

function InteriorLiving({ b }: { b: Building }) {
  return (
    <>
      <rect x="0" y="0" width="400" height="300" fill={b.wall} opacity="0.35" />
      <ellipse cx="165" cy="222" rx="115" ry="13" fill={b.wallShade} opacity="0.5" />
      <rect x="90" y="172" width="140" height="42" rx="8" fill={b.door} />
      <rect x="86" y="160" width="16" height="54" rx="6" fill={b.door} />
      <rect x="218" y="160" width="16" height="54" rx="6" fill={b.door} />
      <rect x="272" y="88" width="70" height="92" fill={b.glass} />
      <line x1="307" y1="88" x2="307" y2="180" stroke={b.wall} strokeWidth="3" />
      <line x1="272" y1="134" x2="342" y2="134" stroke={b.wall} strokeWidth="3" />
      <rect x="318" y="96" width="24" height="16" fill={b.roof} />
      <rect x="150" y="192" width="60" height="6" rx="3" fill={b.wallShade} />
    </>
  );
}

function InteriorKitchen({ b }: { b: Building }) {
  return (
    <>
      <rect x="0" y="0" width="400" height="300" fill={b.wall} opacity="0.3" />
      <rect x="60" y="160" width="280" height="45" fill={b.door} />
      <rect x="60" y="160" width="280" height="8" fill={b.wallShade} />
      {windowGrid(75, 88, 4, 1, 46, 33, 10, 0, b.glass)}
      <rect x="150" y="88" width="60" height="34" fill={b.roof} />
      <ellipse cx="250" cy="100" rx="15" ry="6" fill={b.wallShade} />
      <line x1="250" y1="70" x2="250" y2="98" stroke={b.wallShade} strokeWidth="3" />
    </>
  );
}

function InteriorOffice({ b }: { b: Building }) {
  return (
    <>
      <rect x="0" y="0" width="400" height="300" fill={b.wall} opacity="0.3" />
      <rect x="168" y="132" width="52" height="35" fill={b.door} />
      <rect x="183" y="183" width="34" height="42" rx="10" fill={b.wallShade} />
      <rect x="288" y="90" width="68" height="78" fill={b.glass} />
      <line x1="322" y1="90" x2="322" y2="168" stroke={b.wall} strokeWidth="3" />
      <ellipse cx="195" cy="200" rx="100" ry="10" fill={b.wallShade} opacity="0.4" />
    </>
  );
}

function InteriorShop({ b }: { b: Building }) {
  return (
    <>
      <rect x="0" y="0" width="400" height="300" fill={b.wall} opacity="0.3" />
      {windowGrid(78, 96, 5, 3, 20, 16, 8, 10, b.glass)}
      <rect x="248" y="168" width="92" height="37" fill={b.door} />
      <rect x="268" y="152" width="22" height="16" fill={b.wallShade} />
    </>
  );
}

const SCENES: Record<string, (props: { b: Building }) => JSX.Element> = {
  "apartment-exterior": ApartmentExterior,
  "duplex-exterior": DuplexExterior,
  "bungalow-exterior": BungalowExterior,
  "land-plot": LandPlot,
  "shop-storefront": ShopStorefront,
  "office-exterior": OfficeExterior,
  "studio-exterior": StudioExterior,
  "interior-living": InteriorLiving,
  "interior-kitchen": InteriorKitchen,
  "interior-office": InteriorOffice,
  "interior-shop": InteriorShop,
};

const IS_INTERIOR: Record<string, boolean> = {
  "interior-living": true,
  "interior-kitchen": true,
  "interior-office": true,
  "interior-shop": true,
};

export function PropertyIllustration({ scene, seed, colorSeed, className, label }: PropertyIllustrationProps) {
  const sky = skyFor(seed);
  const b = buildingFor(colorSeed ?? seed);
  const Scene = SCENES[scene] ?? ApartmentExterior;
  const interior = IS_INTERIOR[scene] ?? false;
  const gradientId = `property-sky-${scene}-${seed}-${colorSeed ?? 0}`;

  return (
    <div className={cn("relative overflow-hidden", className)} role="img" aria-label={label ?? "Property photography is not yet available for this listing"}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={sky.skyTop} />
            <stop offset="1" stopColor={sky.skyBottom} />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill={interior ? sky.skyBottom : `url(#${gradientId})`} />
        {!interior && <rect x="0" y="205" width="400" height="95" fill={sky.ground} />}
        <Scene b={b} />
      </svg>
    </div>
  );
}
