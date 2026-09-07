import { VerificationState } from "@/components/ui/Badge";
import { Location } from "@/lib/locations";

/**
 * One real, uploaded photo in a listing's gallery (see
 * app/modules/media in the backend, and MediaUploader on the
 * frontend, for the actual upload/reorder/primary/delete pipeline
 * this shape comes from). There is deliberately no illustration or
 * generated-art fallback field here any more: a listing with no
 * uploaded photos has an empty images array, and every place that
 * renders a gallery or card image is expected to show an honest
 * "photos coming soon" state for that case (see ListingMedia and
 * MissingListingPhoto) rather than any generated stand-in. A stock or
 * placeholder photo is not used either: the marketplace's principle
 * is that whoever is selling the property or vehicle supplies its
 * real photography, the same way Chowdeck does not generate a photo
 * of a restaurant's food.
 */
export interface ListingImageRef {
  url: string;
  thumbnailUrl?: string;
  alt: string;
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
  /**
   * Ordered gallery of real uploaded photos, images[0] the cover shown
   * on cards. Can genuinely be empty (a brand new listing before its
   * seller has uploaded anything, or a seed listing in this dev build,
   * since no real photography exists for it) - every renderer of this
   * array is expected to handle that case with an honest empty state,
   * not by inventing an image.
   */
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
