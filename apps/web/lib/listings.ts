import { VerificationState } from "@/components/ui/Badge";
import { Location } from "@/lib/locations";

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
  mediaVariant: number;
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
  imageCount: number;
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
