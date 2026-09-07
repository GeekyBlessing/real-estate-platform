import { PropertyCardData } from "@/components/property/PropertyCard";
import { VerificationState } from "@/components/ui/Badge";
import { makeLocation } from "@/lib/locations";

/**
 * Prototype content for the Priority 1 screens. Every figure and
 * name here is illustrative, standing in for what Phase 4's
 * properties API and Phase 3's user records will actually return.
 * Nothing here is presented to a real user; it exists so the screens
 * can be reviewed against real looking content instead of lorem.
 *
 * Locations are built with makeLocation() rather than written as
 * strings, so every listing's location is guaranteed to exist in the
 * hierarchy defined in lib/locations.ts, the same one search, the
 * popular locations strip, and any future location page all read
 * from.
 *
 * Agent is the one identity record shared by everyone who lists
 * something and responds to enquiries, a property agent or landlord
 * here, a car dealer or private seller in lib/vehicles.ts. A person's
 * profile page (app/(marketplace)/agents/[slug]/page.tsx) does not
 * need to know or care which category they sell in.
 */

export interface Agent {
  slug: string;
  name: string;
  role: "agent" | "landlord" | "dealer" | "private seller";
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
  {
    slug: "bisi-adewale",
    name: "Bisi Adewale",
    role: "agent",
    title: "Agent, Abeokuta and Ibadan",
    bio: "Handles residential sales and rentals across Ogun and Oyo states, with most listings concentrated in Oke Ilewo, Asero, and Bodija.",
    verificationState: "verified",
    verificationDetail: "Identity and agent license reviewed by an administrator on 12 August.",
    activeListings: 6,
    responseRate: "Within 3 hours",
    memberSince: "2023",
  },
  {
    slug: "autotrust-motors",
    name: "AutoTrust Motors",
    role: "dealer",
    title: "Certified dealer, Lagos",
    bio: "A certified dealership based in Lagos, specializing in foreign used and Nigerian used sedans and SUVs, with every vehicle inspected before it is listed.",
    verificationState: "verified",
    verificationDetail: "Business registration and dealership license reviewed by an administrator on 15 August.",
    activeListings: 4,
    responseRate: "Within 1 hour",
    memberSince: "2021",
  },
  {
    slug: "chidi-eze",
    name: "Chidi Eze",
    role: "private seller",
    title: "Private seller, Abeokuta",
    bio: "Selling a personally owned vehicle directly, not listed through a dealership.",
    verificationState: "verified",
    verificationDetail: "Identity reviewed by an administrator on 18 August.",
    activeListings: 2,
    responseRate: "Within 4 hours",
    memberSince: "2024",
  },
  {
    slug: "femi-alaba",
    name: "Femi Alaba",
    role: "private seller",
    title: "Private seller, Ibadan",
    bio: "Selling a personally owned vehicle directly, not listed through a dealership.",
    verificationState: "verified",
    verificationDetail: "Identity reviewed by an administrator on 21 August.",
    activeListings: 1,
    responseRate: "Within a day",
    memberSince: "2024",
  },
];

export const properties: PropertyDetail[] = [
  {
    slug: "3-bed-apartment-lekki-phase-1",
    title: "3 Bedroom Apartment, Lekki Phase 1",
    category: "property",
    propertyType: "apartment",
    location: makeLocation({ stateSlug: "lagos", citySlug: "lagos", areaSlug: "lekki-phase-1" }),
    listingType: "sale",
    priceInKobo: 8_500_000_000,
    bedrooms: 3,
    bathrooms: 3,
    sizeSqm: 210,
    images: [],
    verificationState: "verified",
    listedBy: { slug: "adaeze-okafor", name: "Adaeze Okafor", role: "agent" },
    isFavorited: false,
    description:
      "A quiet three bedroom flat on the second floor of a nine unit building, with cross ventilation, a private balcony facing the estate garden, and dedicated parking for two cars.",
    amenities: ["Backup power", "Water treatment", "Parking", "Security", "Serviced"],
    furnishingStatus: "Unfurnished",
    availability: "Available now",
    verificationDetail: "Ownership document and listing details reviewed by an administrator on 14 August.",
  },
  {
    slug: "serviced-office-suite-wuse-2",
    title: "Serviced Office Suite, Wuse 2",
    category: "property",
    propertyType: "office",
    location: makeLocation({ stateSlug: "fct", citySlug: "abuja", areaSlug: "wuse-2" }),
    listingType: "rent",
    rentPeriod: "year",
    priceInKobo: 240_000_000,
    bedrooms: null,
    bathrooms: 2,
    sizeSqm: 140,
    images: [],
    verificationState: "pending",
    listedBy: { slug: "tunde-bello", name: "Tunde Bello", role: "landlord" },
    isFavorited: false,
    description:
      "Open plan office suite on the third floor with a reception area, two meeting rooms, and a shared generator serving the whole building.",
    amenities: ["Backup power", "Parking", "Security"],
    furnishingStatus: "Semi furnished",
    availability: "Available from 1 October",
    verificationDetail: "Certificate of occupancy submitted 3 days ago, awaiting administrator review.",
  },
  {
    slug: "4-bed-duplex-ikoyi",
    title: "4 Bedroom Duplex, Ikoyi",
    category: "property",
    propertyType: "duplex",
    location: makeLocation({ stateSlug: "lagos", citySlug: "lagos", areaSlug: "ikoyi" }),
    listingType: "sale",
    priceInKobo: 32_000_000_000,
    bedrooms: 4,
    bathrooms: 5,
    sizeSqm: 380,
    images: [],
    verificationState: "flagged",
    listedBy: { slug: "adaeze-okafor", name: "Adaeze Okafor", role: "agent" },
    isFavorited: false,
    description:
      "A detached duplex with a private compound, staff quarters, and a rooftop terrace. Currently under review following a report from another user.",
    amenities: ["Swimming pool", "Backup power", "Security", "Parking"],
    furnishingStatus: "Unfurnished",
    availability: "Under review",
    verificationDetail: "Under investigation following a report from another user.",
  },
  {
    slug: "land-parcel-epe",
    title: "Land Parcel, Epe",
    category: "property",
    propertyType: "land",
    location: makeLocation({ stateSlug: "lagos", citySlug: "lagos", areaSlug: "epe" }),
    listingType: "sale",
    priceInKobo: 1_800_000_000,
    bedrooms: null,
    bathrooms: 0,
    sizeSqm: 1000,
    images: [],
    verificationState: "verified",
    listedBy: { slug: "ngozi-adeyemi", name: "Ngozi Adeyemi", role: "agent" },
    isFavorited: false,
    description:
      "A registered plot on the Lekki-Epe corridor with survey documents and a governor's consent in progress. Fenced on three sides.",
    amenities: ["Fenced", "Registered survey"],
    furnishingStatus: "Not applicable",
    availability: "Available now",
    verificationDetail: "Survey plan and land title documents reviewed by an administrator on 9 August.",
  },
  {
    slug: "2-bed-flat-old-gra-port-harcourt",
    title: "2 Bedroom Flat, Old GRA",
    category: "property",
    propertyType: "apartment",
    location: makeLocation({ stateSlug: "rivers", citySlug: "port-harcourt", areaSlug: "old-gra" }),
    listingType: "rent",
    rentPeriod: "year",
    priceInKobo: 180_000_000,
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 95,
    images: [],
    verificationState: "verified",
    listedBy: { slug: "ngozi-adeyemi", name: "Ngozi Adeyemi", role: "agent" },
    isFavorited: false,
    description:
      "A ground floor flat in a gated compound with shared generator power and a small private garden at the rear.",
    amenities: ["Backup power", "Security", "Parking"],
    furnishingStatus: "Furnished",
    availability: "Available now",
    verificationDetail: "Identity and tenancy agreement reviewed by an administrator on 30 July.",
  },
  {
    slug: "retail-shop-computer-village-ikeja",
    title: "Retail Shop, Computer Village",
    category: "property",
    propertyType: "shop",
    location: makeLocation({ stateSlug: "lagos", citySlug: "lagos", areaSlug: "ikeja" }),
    listingType: "rent",
    rentPeriod: "year",
    priceInKobo: 90_000_000,
    bedrooms: null,
    bathrooms: 1,
    sizeSqm: 32,
    images: [],
    verificationState: "unverified",
    listedBy: { slug: "tunde-bello", name: "Tunde Bello", role: "landlord" },
    isFavorited: false,
    description: "A ground floor shop unit facing the main road, currently used as an electronics outlet.",
    amenities: ["Security"],
    furnishingStatus: "Unfurnished",
    availability: "Available from 1 November",
    verificationDetail: "No identity or ownership checks have been submitted yet.",
  },
  {
    slug: "4-bed-detached-duplex-oke-ilewo-abeokuta",
    title: "4 Bedroom Detached Duplex, Oke Ilewo",
    category: "property",
    propertyType: "duplex",
    location: makeLocation({ stateSlug: "ogun", citySlug: "abeokuta", areaSlug: "oke-ilewo" }),
    listingType: "sale",
    priceInKobo: 6_500_000_000,
    bedrooms: 4,
    bathrooms: 4,
    sizeSqm: 350,
    images: [],
    verificationState: "verified",
    listedBy: { slug: "bisi-adewale", name: "Bisi Adewale", role: "agent" },
    isFavorited: false,
    description:
      "A detached duplex on a quiet street in Oke Ilewo, with a fenced compound, boys quarters, and space for three cars. Ten minutes from Kuto market.",
    amenities: ["Backup power", "Borehole", "Parking", "Security", "Fenced compound"],
    furnishingStatus: "Unfurnished",
    availability: "Available now",
    verificationDetail: "Ownership document and listing details reviewed by an administrator on 20 August.",
  },
  {
    slug: "3-bed-bungalow-bodija-ibadan",
    title: "3 Bedroom Bungalow, Bodija",
    category: "property",
    propertyType: "bungalow",
    location: makeLocation({ stateSlug: "oyo", citySlug: "ibadan", areaSlug: "bodija" }),
    listingType: "rent",
    rentPeriod: "year",
    priceInKobo: 150_000_000,
    bedrooms: 3,
    bathrooms: 2,
    sizeSqm: 160,
    images: [],
    verificationState: "pending",
    listedBy: { slug: "bisi-adewale", name: "Bisi Adewale", role: "agent" },
    isFavorited: false,
    description:
      "A single storey bungalow set back from the road in a family estate, with a private garden and covered parking for two cars.",
    amenities: ["Water treatment", "Parking", "Security"],
    furnishingStatus: "Unfurnished",
    availability: "Available from 1 October",
    verificationDetail: "Ownership document submitted 2 days ago, awaiting administrator review.",
  },
  {
    slug: "2-bed-flat-asero-abeokuta",
    title: "2 Bedroom Flat, Asero",
    category: "property",
    propertyType: "apartment",
    location: makeLocation({ stateSlug: "ogun", citySlug: "abeokuta", areaSlug: "asero" }),
    listingType: "rent",
    rentPeriod: "year",
    priceInKobo: 90_000_000,
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 85,
    images: [],
    verificationState: "verified",
    listedBy: { slug: "bisi-adewale", name: "Bisi Adewale", role: "agent" },
    isFavorited: false,
    description:
      "A first floor flat in a small gated compound off the Asero roundabout, with a shared borehole and space for one car under cover.",
    amenities: ["Borehole", "Parking", "Security"],
    furnishingStatus: "Unfurnished",
    availability: "Available now",
    verificationDetail: "Ownership document and listing details reviewed by an administrator on 23 August.",
  },
  {
    slug: "self-contain-studio-kuto-abeokuta",
    title: "Self Contain Studio, Kuto",
    category: "property",
    propertyType: "studio",
    location: makeLocation({ stateSlug: "ogun", citySlug: "abeokuta", areaSlug: "kuto" }),
    listingType: "rent",
    rentPeriod: "year",
    priceInKobo: 35_000_000,
    bedrooms: 1,
    bathrooms: 1,
    sizeSqm: 28,
    images: [],
    verificationState: "pending",
    listedBy: { slug: "bisi-adewale", name: "Bisi Adewale", role: "agent" },
    isFavorited: false,
    description:
      "A single room self contain a short walk from Kuto market, popular with students and young professionals working nearby.",
    amenities: ["Water treatment", "Security"],
    furnishingStatus: "Unfurnished",
    availability: "Available from 15 September",
    verificationDetail: "Ownership document submitted 4 days ago, awaiting administrator review.",
  },
  {
    slug: "2-bed-flat-lekki-phase-1",
    title: "2 Bedroom Flat, Lekki Phase 1",
    category: "property",
    propertyType: "apartment",
    location: makeLocation({ stateSlug: "lagos", citySlug: "lagos", areaSlug: "lekki-phase-1" }),
    listingType: "rent",
    rentPeriod: "year",
    priceInKobo: 350_000_000,
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 120,
    images: [],
    verificationState: "verified",
    listedBy: { slug: "adaeze-okafor", name: "Adaeze Okafor", role: "agent" },
    isFavorited: false,
    description:
      "A bright second floor flat in a four unit block, with a shared generator, a small gym, and dedicated parking for one car.",
    amenities: ["Backup power", "Parking", "Security", "Serviced"],
    furnishingStatus: "Semi furnished",
    availability: "Available now",
    verificationDetail: "Ownership document and listing details reviewed by an administrator on 24 August.",
  },
];

export function getPropertyBySlug(slug: string): PropertyDetail | undefined {
  return properties.find((property) => property.slug === slug);
}

export function getAgentBySlug(slug: string): Agent | undefined {
  return agents.find((agent) => agent.slug === slug);
}

export function getPropertiesByAgentSlug(slug: string): PropertyDetail[] {
  return properties.filter((property) => property.listedBy.slug === slug);
}
