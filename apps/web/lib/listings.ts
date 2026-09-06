import { VerificationState } from "@/components/ui/Badge";
import { Location } from "@/lib/locations";

/**
 * One entry in a listing's photo gallery. Every listing in this build
 * has url left unset, real uploads are later backend work (see
 * roadmap-reconciliation.md), so url exists now purely so the shape
 * is right the moment uploads land, at which point ListingMedia
 * (components/ui/ListingMedia.tsx) starts trying to load it instead
 * of rendering scene. alt is written as if describing the real photo
 * once it exists; scene and seed are meaningless once url is set.
 */
export interface ListingImageRef {
  url?: string;
  alt?: string;
  /** Which PropertyIllustration or VehicleIllustration scene renders while url is absent. */
  scene: string;
  /** Drives the illustration's sky/lighting variant and minor path choices, may differ between photos of the same listing (real photos of one place taken at different times legitimately look a little different too). */
  seed: number;
  /** Drives the illustration's identity color (a building's wall/roof color, a car's body color): constant across every image in one listing's gallery, since a single property or car does not change color between its own photos. */
  colorSeed: number;
}

/**
 * The shared spine every marketplace listing sits on, whatever
 * category it belongs to. A property and a vehicle listing both
 * carry every field below; anything specific to one category lives
 * on that category's own interface instead of being added here.
 * See PropertyCardData and PropertyDetail (components/property/PropertyCard.tsx
 * and lib/mock-data.ts) for the property specialization, and
 * VehicleCardData and VehicleDetail below for the vehicle one.
 */
export interface ListingBase {
  slug: string;
  title: string;
  category: "property" | "vehicle";
  location: Location;
  priceInKobo: number;
  /** Ordered gallery. images[0] is the cover shown on cards. Never empty. */
  images: ListingImageRef[];
  verificationState: VerificationState;
  verificationDetail: string;
  isFavorited: boolean;
  listedBy: {
    slug: string;
    name: string;
    role: "agent" | "landlord" | "dealer" | "private seller";
  };
}

/**
 * A property's physical type, independent of listingType (sale or
 * rent, which is a business fact, not a physical one). Drives both
 * the property type filter (brief section 4) and which illustrated
 * scenes buildPropertyImages picks while there is no real
 * photography, so a duplex and a shop never render the same fallback
 * art.
 */
export const PROPERTY_TYPES = ["apartment", "duplex", "bungalow", "terrace", "land", "office", "shop", "studio"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

/**
 * Shared between the search Filters sheet (FilterDrawer.tsx) and the
 * List a property flow (components/listings/PropertyListingFlow.tsx),
 * so a filter facet and the value a seller actually picks when
 * creating a listing can never drift into two different vocabularies.
 */
export const AMENITIES = ["Water treatment", "Backup power", "Parking", "Security", "Serviced", "Furnished kitchen", "Swimming pool", "Gym"];
export const FURNISHING_OPTIONS = ["Unfurnished", "Semi furnished", "Fully furnished"];

export function propertyTypeLabel(type: PropertyType): string {
  switch (type) {
    case "apartment":
      return "Apartment";
    case "duplex":
      return "Duplex";
    case "bungalow":
      return "Bungalow";
    case "terrace":
      return "Terrace";
    case "land":
      return "Land";
    case "office":
      return "Office space";
    case "shop":
      return "Shop";
    case "studio":
      return "Self contain";
    default:
      return type;
  }
}

const PROPERTY_GALLERY_SCENES: Record<PropertyType, string[]> = {
  apartment: ["apartment-exterior", "interior-living", "interior-kitchen"],
  duplex: ["duplex-exterior", "interior-living", "interior-kitchen"],
  bungalow: ["bungalow-exterior", "interior-living", "interior-kitchen"],
  terrace: ["duplex-exterior", "interior-living", "interior-kitchen"],
  land: ["land-plot"],
  office: ["office-exterior", "interior-office"],
  shop: ["shop-storefront", "interior-shop"],
  studio: ["studio-exterior", "interior-living"],
};

/**
 * A tiny, deterministic string hash, used only to spread each
 * listing's identity color (wall color, car body color) across the
 * available palette. type/bodyType plus baseSeed is close enough to a
 * unique key per listing for this purpose: it does not need to be
 * globally unique, only to avoid every listing sharing the same four
 * or so recycled tones the way a single small baseSeed value would.
 */
function stringSeed(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

/** Builds a listing's gallery from its physical type, cycling that type's scene pattern to fill count entries. */
export function buildPropertyImages(type: PropertyType, baseSeed: number, count: number): ListingImageRef[] {
  const pattern = PROPERTY_GALLERY_SCENES[type];
  const total = Math.max(count, 1);
  const colorSeed = stringSeed(`${type}:${baseSeed}`);
  return Array.from({ length: total }, (_, index) => ({
    scene: pattern[index % pattern.length]!,
    seed: baseSeed + index,
    colorSeed,
  }));
}

const VEHICLE_GALLERY_SCENES: Record<string, string[]> = {
  sedan: ["sedan-exterior", "interior-dashboard", "sedan-exterior"],
  suv: ["suv-exterior", "interior-dashboard", "suv-exterior"],
  hatchback: ["hatchback-exterior", "interior-dashboard", "hatchback-exterior"],
  pickup: ["pickup-exterior", "interior-dashboard", "pickup-exterior"],
  van: ["van-exterior", "interior-dashboard", "van-exterior"],
  coupe: ["coupe-exterior", "interior-dashboard", "coupe-exterior"],
};

/** Builds a listing's gallery from its VEHICLE_BODY_TYPES value (lib/vehicles.ts), falling back to a sedan pattern for a body type this build doesn't have art for yet. */
export function buildVehicleImages(bodyType: string, baseSeed: number, count: number): ListingImageRef[] {
  const pattern = VEHICLE_GALLERY_SCENES[bodyType.toLowerCase()] ?? VEHICLE_GALLERY_SCENES.sedan!;
  const total = Math.max(count, 1);
  const colorSeed = stringSeed(`${bodyType.toLowerCase()}:${baseSeed}`);
  return Array.from({ length: total }, (_, index) => ({
    scene: pattern[index % pattern.length]!,
    seed: baseSeed + index,
    colorSeed,
  }));
}

/**
 * The vehicle equivalent of PropertyCardData (components/property/PropertyCard.tsx):
 * everything a vehicle card needs, extending the shared spine above.
 * A vehicle's information hierarchy is deliberately its own, not a
 * relabeled property card: make, model, and year lead, followed by
 * mileage, transmission, and fuel, since that is the order a buyer
 * actually evaluates a car in.
 */
export interface VehicleCardData extends ListingBase {
  category: "vehicle";
  make: string;
  model: string;
  year: number;
  mileageKm: number;
  transmission: "automatic" | "manual";
  fuelType: string;
  condition: "brand new" | "nigerian used" | "foreign used";
  bodyType: string;
}

/** The vehicle equivalent of PropertyDetail (lib/mock-data.ts): everything the detail page needs beyond the card. */
export interface VehicleDetail extends VehicleCardData {
  description: string;
  features: string[];
}

/**
 * The one seller role label, shared by PropertyCard and VehicleCard
 * rather than each writing its own copy of this mapping, so the two
 * cards cannot quietly drift out of sync on what a role is called.
 */
export function sellerRoleLabel(role: ListingBase["listedBy"]["role"]): string {
  switch (role) {
    case "agent":
      return "Verified agent";
    case "dealer":
      return "Verified dealer";
    case "private seller":
      return "Verified seller";
    case "landlord":
    default:
      return "Landlord";
  }
}
