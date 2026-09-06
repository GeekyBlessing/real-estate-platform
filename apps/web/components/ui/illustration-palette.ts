/**
 * Shared by PropertyIllustration and VehicleIllustration. Two
 * independent choices go into every rendered scene: a sky/lighting
 * variant (picked by `seed`, which may differ between photos of the
 * same listing, the way real photos of one place taken at different
 * times of day legitimately look a little different) and an identity
 * color (picked by `colorSeed`, a building's wall/roof color or a
 * car's body color, which stays constant across every photo of one
 * listing because a single property or car does not change color
 * between its own photos). Keeping these as two separate tables
 * instead of one brown-only gradient is what gets this out of "brown
 * rectangle" territory: a real gallery of ten listings should show ten
 * different-looking buildings and cars, not ten shades of one drawing.
 */

export interface SkyPalette {
  skyTop: string;
  skyBottom: string;
  ground: string;
  groundShadow: string;
}

/** Soft, believable Lagos/Abeokuta lighting variants: harmattan haze, golden hour, overcast, clear afternoon. */
export const SKY_PALETTES: SkyPalette[] = [
  { skyTop: "#F3E2C6", skyBottom: "#EFC9A0", ground: "#DDBE8E", groundShadow: "#C89F6C" },
  { skyTop: "#EAD9E8", skyBottom: "#E7B9A8", ground: "#D9AD8E", groundShadow: "#B98268" },
  { skyTop: "#D9E6EA", skyBottom: "#C7D8D6", ground: "#B9C4B0", groundShadow: "#93A088" },
  { skyTop: "#F5EBD8", skyBottom: "#E4DAC0", ground: "#C9BE9C", groundShadow: "#A99873" },
];

export function skyFor(seed: number): SkyPalette {
  return SKY_PALETTES[Math.abs(seed) % SKY_PALETTES.length]!;
}

export interface BuildingPalette {
  wall: string;
  wallShade: string;
  roof: string;
  door: string;
  glass: string;
}

/** A believable spread of real facade materials: painted render, terracotta brick, sandcrete, deep charcoal modern. */
export const BUILDING_PALETTES: BuildingPalette[] = [
  { wall: "#F1E9DA", wallShade: "#E0D3BA", roof: "#6E4620", door: "#8A5A2B", glass: "#BFD6D9" },
  { wall: "#D9A876", wallShade: "#C08F5E", roof: "#5C4530", door: "#3F3020", glass: "#CFE0DE" },
  { wall: "#C97B4A", wallShade: "#AD6236", roof: "#4A3826", door: "#2B2016", glass: "#D6E4E2" },
  { wall: "#9AA98A", wallShade: "#7E9070", roof: "#3F3020", door: "#2B2016", glass: "#CFE0DE" },
  { wall: "#EFEAE1", wallShade: "#D8D1BF", roof: "#2B2016", door: "#55483A", glass: "#C3D9DC" },
  { wall: "#4A4640", wallShade: "#37332E", roof: "#211D18", door: "#D9A876", glass: "#A9C2C6" },
];

export function buildingFor(colorSeed: number): BuildingPalette {
  return BUILDING_PALETTES[Math.abs(colorSeed) % BUILDING_PALETTES.length]!;
}

export interface CarPalette {
  body: string;
  bodyShade: string;
  glass: string;
  trim: string;
}

/** The colors a real Lagos/Abeokuta forecourt actually shows: white, black, silver, and a few statement colors. */
export const CAR_PALETTES: CarPalette[] = [
  { body: "#F4F2ED", bodyShade: "#D6D2C6", glass: "#3A4650", trim: "#2B2016" },
  { body: "#26221D", bodyShade: "#100E0B", glass: "#4A5560", trim: "#8A7F6C" },
  { body: "#B7B9BC", bodyShade: "#93969A", glass: "#333D46", trim: "#2B2016" },
  { body: "#8C2F26", bodyShade: "#6B211A", glass: "#333D46", trim: "#2B2016" },
  { body: "#2B3A55", bodyShade: "#1D2839", glass: "#3A4650", trim: "#B7B9BC" },
  { body: "#3A4A3B", bodyShade: "#26311F", glass: "#333D46", trim: "#8A7F6C" },
  { body: "#7C6248", bodyShade: "#5C4530", glass: "#333D46", trim: "#2B2016" },
];

export function carFor(colorSeed: number): CarPalette {
  return CAR_PALETTES[Math.abs(colorSeed) % CAR_PALETTES.length]!;
}
