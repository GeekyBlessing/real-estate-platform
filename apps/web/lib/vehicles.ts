import { VehicleDetail } from "@/lib/listings";
import { makeLocation } from "@/lib/locations";

/**
 * Prototype vehicle content, the car marketplace equivalent of
 * lib/mock-data.ts. Kept in its own module rather than folded into
 * mock-data.ts because property and vehicle listings have genuinely
 * different fields and business rules; the two only share the
 * ListingBase spine (lib/listings.ts) and the Agent identity record
 * (lib/mock-data.ts), not their content.
 */

/**
 * Make and model as a dependent pair rather than two free text
 * fields, per the car search spec: choosing a make narrows the model
 * list, both to keep search results honest and because that is how
 * a buyer actually searches for a car.
 */
export const VEHICLE_MAKES = ["Toyota", "Lexus", "Mercedes Benz", "Honda", "Hyundai", "Kia", "Ford", "Nissan"];

export const VEHICLE_MODELS_BY_MAKE: Record<string, string[]> = {
  Toyota: ["Camry", "Corolla", "Highlander", "RAV4", "Sienna"],
  Lexus: ["RX350", "ES350", "GX460"],
  "Mercedes Benz": ["C300", "E350", "GLE"],
  Honda: ["Accord", "Civic", "CRV"],
  Hyundai: ["Elantra", "Sonata", "Tucson"],
  Kia: ["Sportage", "Optima", "Rio"],
  Ford: ["Explorer", "Edge", "Focus"],
  Nissan: ["Altima", "Rogue", "Sentra"],
};

export const VEHICLE_BODY_TYPES = ["Sedan", "SUV", "Hatchback", "Pickup", "Van", "Coupe"];

/**
 * Shared between the car search Filters sheet (VehicleFilterDrawer.tsx)
 * and Sell a car (components/listings/SellACarFlow.tsx), same reason
 * AMENITIES and FURNISHING_OPTIONS are shared in lib/listings.ts: a
 * filter facet and the value a seller actually picks when creating a
 * listing must stay one vocabulary.
 */
export const VEHICLE_CONDITIONS = ["Brand new", "Nigerian used", "Foreign used"];
export const VEHICLE_TRANSMISSIONS = ["Automatic", "Manual"];
export const VEHICLE_FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"];

export const vehicles: VehicleDetail[] = [
  {
    slug: "2021-toyota-camry-xse-abeokuta",
    title: "2021 Toyota Camry XSE",
    category: "vehicle",
    location: makeLocation({ stateSlug: "ogun", citySlug: "abeokuta", areaSlug: "gra" }),
    make: "Toyota",
    model: "Camry",
    year: 2021,
    priceInKobo: 1_850_000_000,
    mileageKm: 72_000,
    transmission: "automatic",
    fuelType: "Petrol",
    condition: "foreign used",
    bodyType: "Sedan",
    images: [],
    verificationState: "verified",
    listedBy: { slug: "chidi-eze", name: "Chidi Eze", role: "private seller" },
    isFavorited: false,
    description:
      "A well kept XSE trim Camry, second owner, always parked under cover. Recently serviced with new brake pads and a full detail before listing.",
    features: ["Leather seats", "Reverse camera", "Alloy wheels", "Keyless entry", "Sunroof"],
    verificationDetail: "Vehicle documents and ownership history reviewed by an administrator on 19 August.",
  },
  {
    slug: "2019-lexus-rx350-lekki",
    title: "2019 Lexus RX350",
    category: "vehicle",
    location: makeLocation({ stateSlug: "lagos", citySlug: "lagos", areaSlug: "lekki-phase-1" }),
    make: "Lexus",
    model: "RX350",
    year: 2019,
    priceInKobo: 3_200_000_000,
    mileageKm: 61_000,
    transmission: "automatic",
    fuelType: "Petrol",
    condition: "foreign used",
    bodyType: "SUV",
    images: [],
    verificationState: "verified",
    listedBy: { slug: "autotrust-motors", name: "AutoTrust Motors", role: "dealer" },
    isFavorited: false,
    description:
      "A clean foreign used RX350 with full service history since import. Inspected by AutoTrust Motors before listing, no accident history on record.",
    features: ["Leather seats", "Third row seating", "Navigation system", "Heated seats", "Parking sensors"],
    verificationDetail: "Vehicle documents and import papers reviewed by an administrator on 16 August.",
  },
  {
    slug: "2023-mercedes-benz-c300-wuse-2",
    title: "2023 Mercedes Benz C300",
    category: "vehicle",
    location: makeLocation({ stateSlug: "fct", citySlug: "abuja", areaSlug: "wuse-2" }),
    make: "Mercedes Benz",
    model: "C300",
    year: 2023,
    priceInKobo: 5_800_000_000,
    mileageKm: 1_500,
    transmission: "automatic",
    fuelType: "Petrol",
    condition: "brand new",
    bodyType: "Sedan",
    images: [],
    verificationState: "pending",
    listedBy: { slug: "autotrust-motors", name: "AutoTrust Motors", role: "dealer" },
    isFavorited: false,
    description:
      "A brand new C300, delivery mileage only, full manufacturer warranty remaining. Available for viewing at the AutoTrust Motors showroom.",
    features: ["Ambient lighting", "Panoramic sunroof", "Adaptive cruise control", "Wireless charging"],
    verificationDetail: "Purchase and registration documents submitted 2 days ago, awaiting administrator review.",
  },
  {
    slug: "2018-honda-accord-old-gra",
    title: "2018 Honda Accord",
    category: "vehicle",
    location: makeLocation({ stateSlug: "rivers", citySlug: "port-harcourt", areaSlug: "old-gra" }),
    make: "Honda",
    model: "Accord",
    year: 2018,
    priceInKobo: 1_280_000_000,
    mileageKm: 98_000,
    transmission: "automatic",
    fuelType: "Petrol",
    condition: "nigerian used",
    bodyType: "Sedan",
    images: [],
    verificationState: "verified",
    listedBy: { slug: "autotrust-motors", name: "AutoTrust Motors", role: "dealer" },
    isFavorited: false,
    description:
      "A Nigerian used Accord with a single previous owner and a documented service history. Tyres replaced within the last six months.",
    features: ["Reverse camera", "Bluetooth audio", "Cruise control", "Alloy wheels"],
    verificationDetail: "Vehicle documents and ownership history reviewed by an administrator on 11 August.",
  },
  {
    slug: "2020-hyundai-elantra-bodija",
    title: "2020 Hyundai Elantra",
    category: "vehicle",
    location: makeLocation({ stateSlug: "oyo", citySlug: "ibadan", areaSlug: "bodija" }),
    make: "Hyundai",
    model: "Elantra",
    year: 2020,
    priceInKobo: 1_420_000_000,
    mileageKm: 45_000,
    transmission: "automatic",
    fuelType: "Petrol",
    condition: "foreign used",
    bodyType: "Sedan",
    images: [],
    verificationState: "verified",
    listedBy: { slug: "femi-alaba", name: "Femi Alaba", role: "private seller" },
    isFavorited: false,
    description:
      "A low mileage Elantra, personally imported and driven by one owner since arrival. Comes with the original import documents.",
    features: ["Reverse camera", "Bluetooth audio", "Alloy wheels"],
    verificationDetail: "Vehicle documents and ownership history reviewed by an administrator on 22 August.",
  },
  {
    slug: "2016-ford-explorer-ikeja",
    title: "2016 Ford Explorer",
    category: "vehicle",
    location: makeLocation({ stateSlug: "lagos", citySlug: "lagos", areaSlug: "ikeja" }),
    make: "Ford",
    model: "Explorer",
    year: 2016,
    priceInKobo: 950_000_000,
    mileageKm: 132_000,
    transmission: "automatic",
    fuelType: "Petrol",
    condition: "nigerian used",
    bodyType: "SUV",
    images: [],
    verificationState: "unverified",
    listedBy: { slug: "autotrust-motors", name: "AutoTrust Motors", role: "dealer" },
    isFavorited: false,
    description: "A seven seater Explorer, sold as seen. Mechanically sound but due a full service soon.",
    features: ["Third row seating", "Roof rails"],
    verificationDetail: "No vehicle documents have been submitted yet.",
  },
  {
    slug: "2019-kia-sportage-abeokuta",
    title: "2019 Kia Sportage",
    category: "vehicle",
    location: makeLocation({ stateSlug: "ogun", citySlug: "abeokuta", areaSlug: "oke-ilewo" }),
    make: "Kia",
    model: "Sportage",
    year: 2019,
    priceInKobo: 1_150_000_000,
    mileageKm: 84_000,
    transmission: "automatic",
    fuelType: "Petrol",
    condition: "nigerian used",
    bodyType: "SUV",
    images: [],
    verificationState: "verified",
    listedBy: { slug: "chidi-eze", name: "Chidi Eze", role: "private seller" },
    isFavorited: false,
    description:
      "A single owner Sportage, driven mostly within Abeokuta and serviced at the same workshop since purchase. Tyres and battery replaced this year.",
    features: ["Reverse camera", "Bluetooth audio", "Alloy wheels", "Roof rails"],
    verificationDetail: "Vehicle documents and ownership history reviewed by an administrator on 24 August.",
  },
  {
    slug: "2017-nissan-altima-lekki",
    title: "2017 Nissan Altima",
    category: "vehicle",
    location: makeLocation({ stateSlug: "lagos", citySlug: "lagos", areaSlug: "lekki-phase-1" }),
    make: "Nissan",
    model: "Altima",
    year: 2017,
    priceInKobo: 890_000_000,
    mileageKm: 110_000,
    transmission: "automatic",
    fuelType: "Petrol",
    condition: "nigerian used",
    bodyType: "Sedan",
    images: [],
    verificationState: "verified",
    listedBy: { slug: "autotrust-motors", name: "AutoTrust Motors", role: "dealer" },
    isFavorited: false,
    description:
      "A dependable Altima inspected and reconditioned by AutoTrust Motors before listing, with a fresh service and new brake pads.",
    features: ["Reverse camera", "Cruise control", "Alloy wheels"],
    verificationDetail: "Vehicle documents and ownership history reviewed by an administrator on 25 August.",
  },
];

export function getVehicleBySlug(slug: string): VehicleDetail | undefined {
  return vehicles.find((vehicle) => vehicle.slug === slug);
}

export function getVehiclesBySellerSlug(slug: string): VehicleDetail[] {
  return vehicles.filter((vehicle) => vehicle.listedBy.slug === slug);
}
