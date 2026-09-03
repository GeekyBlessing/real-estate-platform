import { PropertyCardData } from "@/components/property/PropertyCard";
import { VerificationState } from "@/components/ui/Badge";

/**
 * Prototype content for the Priority 1 screens. Every figure and
 * name here is illustrative, standing in for what Phase 4's
 * properties API and Phase 3's user records will actually return.
 * Nothing here is presented to a real user; it exists so the screens
 * can be reviewed against real looking content instead of lorem.
 */

export interface Agent {
  slug: string;
  name: string;
  role: "agent" | "landlord";
  title: string;
  bio: string;
  verificationState: VerificationState;
  verificationDetail: string;
  activeListings: number;
  responseRate: string;
  memberSince: string;
}

export interface PropertyDetail extends PropertyCardData {
  description: string;
  amenities: string[];
  furnishingStatus: string;
  availability: string;
  imageCount: number;
  agentSlug: string;
  verificationDetail: string;
}

export const agents: Agent[] = [
  {
    slug: "adaeze-okafor",
    name: "Adaeze Okafor",
    role: "agent",
    title: "Senior agent, Lekki and Ikoyi",
    bio: "Nine years placing tenants and buyers across Lekki and Ikoyi, with a focus on serviced apartments and family homes.",
    verificationState: "verified",
    verificationDetail: "Identity and CAC business registration reviewed by an administrator on 2 August.",
    activeListings: 14,
    responseRate: "Within 2 hours",
    memberSince: "2023",
  },
  {
    slug: "tunde-bello",
    name: "Tunde Bello",
    role: "landlord",
    title: "Landlord, Wuse 2",
    bio: "Manages three commercial properties in Wuse 2, listed directly rather than through an agency.",
    verificationState: "pending",
    verificationDetail: "Certificate of occupancy submitted 3 days ago, awaiting administrator review.",
    activeListings: 3,
    responseRate: "Within a day",
    memberSince: "2024",
  },
  {
    slug: "ngozi-adeyemi",
    name: "Ngozi Adeyemi",
    role: "agent",
    title: "Agent, Port Harcourt",
    bio: "Focused on land and commercial listings across Port Harcourt and the surrounding waterfront districts.",
    verificationState: "verified",
    verificationDetail: "Identity and agent license reviewed by an administrator on 21 July.",
    activeListings: 8,
    responseRate: "Within 4 hours",
    memberSince: "2022",
  },
];

export const properties: PropertyDetail[] = [
  {
    slug: "3-bed-apartment-lekki-phase-1",
    title: "3 Bedroom Apartment, Lekki Phase 1",
    locationLabel: "Lekki Phase 1, Lagos",
    listingType: "sale",
    priceInKobo: 8_500_000_000,
    bedrooms: 3,
    bathrooms: 3,
    sizeSqm: 210,
    mediaVariant: 0,
    verificationState: "verified",
    agentName: "Adaeze Okafor",
    agentRole: "agent",
    agentSlug: "adaeze-okafor",
    isFavorited: false,
    description:
      "A quiet three bedroom flat on the second floor of a nine unit building, with cross ventilation, a private balcony facing the estate garden, and dedicated parking for two cars.",
    amenities: ["Backup power", "Water treatment", "Parking", "Security", "Serviced"],
    furnishingStatus: "Unfurnished",
    availability: "Available now",
    imageCount: 6,
    verificationDetail: "Ownership document and listing details reviewed by an administrator on 14 August.",
  },
  {
    slug: "serviced-office-suite-wuse-2",
    title: "Serviced Office Suite, Wuse 2",
    locationLabel: "Wuse 2, Abuja",
    listingType: "rent",
    rentPeriod: "year",
    priceInKobo: 240_000_000,
    bedrooms: null,
    bathrooms: 2,
    sizeSqm: 140,
    mediaVariant: 1,
    verificationState: "pending",
    agentName: "Tunde Bello",
    agentRole: "landlord",
    agentSlug: "tunde-bello",
    isFavorited: false,
    description:
      "Open plan office suite on the third floor with a reception area, two meeting rooms, and a shared generator serving the whole building.",
    amenities: ["Backup power", "Parking", "Security"],
    furnishingStatus: "Semi furnished",
    availability: "Available from 1 October",
    imageCount: 4,
    verificationDetail: "Certificate of occupancy submitted 3 days ago, awaiting administrator review.",
  },
  {
    slug: "4-bed-duplex-ikoyi",
    title: "4 Bedroom Duplex, Ikoyi",
    locationLabel: "Ikoyi, Lagos",
    listingType: "sale",
    priceInKobo: 32_000_000_000,
    bedrooms: 4,
    bathrooms: 5,
    sizeSqm: 380,
    mediaVariant: 2,
    verificationState: "flagged",
    agentName: "Adaeze Okafor",
    agentRole: "agent",
    agentSlug: "adaeze-okafor",
    isFavorited: false,
    description:
      "A detached duplex with a private compound, staff quarters, and a rooftop terrace. Currently under review following a report from another user.",
    amenities: ["Swimming pool", "Backup power", "Security", "Parking"],
    furnishingStatus: "Unfurnished",
    availability: "Under review",
    imageCount: 8,
    verificationDetail: "Under investigation following a report from another user.",
  },
  {
    slug: "land-parcel-epe",
    title: "Land Parcel, Epe",
    locationLabel: "Epe, Lagos",
    listingType: "sale",
    priceInKobo: 1_800_000_000,
    bedrooms: null,
    bathrooms: 0,
    sizeSqm: 1000,
    mediaVariant: 3,
    verificationState: "verified",
    agentName: "Ngozi Adeyemi",
    agentRole: "agent",
    agentSlug: "ngozi-adeyemi",
    isFavorited: false,
    description:
      "A registered plot on the Lekki-Epe corridor with survey documents and a governor's consent in progress. Fenced on three sides.",
    amenities: ["Fenced", "Registered survey"],
    furnishingStatus: "Not applicable",
    availability: "Available now",
    imageCount: 3,
    verificationDetail: "Survey plan and land title documents reviewed by an administrator on 9 August.",
  },
  {
    slug: "2-bed-flat-old-gra-port-harcourt",
    title: "2 Bedroom Flat, Old GRA",
    locationLabel: "Old GRA, Port Harcourt",
    listingType: "rent",
    rentPeriod: "year",
    priceInKobo: 180_000_000,
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 95,
    mediaVariant: 0,
    verificationState: "verified",
    agentName: "Ngozi Adeyemi",
    agentRole: "agent",
    agentSlug: "ngozi-adeyemi",
    isFavorited: false,
    description:
      "A ground floor flat in a gated compound with shared generator power and a small private garden at the rear.",
    amenities: ["Backup power", "Security", "Parking"],
    furnishingStatus: "Furnished",
    availability: "Available now",
    imageCount: 5,
    verificationDetail: "Identity and tenancy agreement reviewed by an administrator on 30 July.",
  },
  {
    slug: "retail-shop-computer-village-ikeja",
    title: "Retail Shop, Computer Village",
    locationLabel: "Ikeja, Lagos",
    listingType: "rent",
    rentPeriod: "year",
    priceInKobo: 90_000_000,
    bedrooms: null,
    bathrooms: 1,
    sizeSqm: 32,
    mediaVariant: 2,
    verificationState: "unverified",
    agentName: "Tunde Bello",
    agentRole: "landlord",
    agentSlug: "tunde-bello",
    isFavorited: false,
    description: "A ground floor shop unit facing the main road, currently used as an electronics outlet.",
    amenities: ["Security"],
    furnishingStatus: "Unfurnished",
    availability: "Available from 1 November",
    imageCount: 2,
    verificationDetail: "No identity or ownership checks have been submitted yet.",
  },
];

export function getPropertyBySlug(slug: string): PropertyDetail | undefined {
  return properties.find((property) => property.slug === slug);
}

export function getAgentBySlug(slug: string): Agent | undefined {
  return agents.find((agent) => agent.slug === slug);
}

export function getPropertiesByAgentSlug(slug: string): PropertyDetail[] {
  return properties.filter((property) => property.agentSlug === slug);
}
