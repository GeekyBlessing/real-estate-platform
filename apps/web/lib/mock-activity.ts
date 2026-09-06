/**
 * Illustrative timeline content for the Activity screen, the same
 * spirit as lib/mock-data.ts: nothing here is a real enquiry, reply,
 * or inspection, since that depends on real messaging and inspection
 * backends that do not exist yet (see roadmap-reconciliation.md).
 * This exists so the Activity screen's actual production layout (an
 * icon, a timestamp, a listing thumbnail, a short line of copy) can
 * be built and reviewed now rather than left as another "coming soon"
 * placeholder, per the explicit instruction to mock UI data for
 * visual development while the backend work behind it is queued
 * separately. Swapping this for a real feed later is a data source
 * change only; ActivityItem's shape is what a real endpoint would
 * return.
 */

export type ActivityKind =
  | "inspection"
  | "message"
  | "price"
  | "review"
  | "verification"
  | "match";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  timestamp: string;
  listingSlug?: string;
  listingCategory?: "property" | "vehicle";
}

export const mockActivity: ActivityItem[] = [
  {
    id: "1",
    kind: "inspection",
    title: "Inspection confirmed",
    detail: "Adaeze Okafor confirmed your inspection for Saturday, 10am.",
    timestamp: "2 hours ago",
    listingSlug: "3-bed-apartment-lekki-phase-1",
    listingCategory: "property",
  },
  {
    id: "2",
    kind: "message",
    title: "Agent replied",
    detail: "“Yes, the apartment is still available, parking included.”",
    timestamp: "5 hours ago",
    listingSlug: "3-bed-apartment-lekki-phase-1",
    listingCategory: "property",
  },
  {
    id: "3",
    kind: "message",
    title: "Seller responded",
    detail: "Chidi Eze answered your question about service history.",
    timestamp: "Yesterday",
    listingSlug: "2021-toyota-camry-xse-abeokuta",
    listingCategory: "vehicle",
  },
  {
    id: "4",
    kind: "price",
    title: "Price reduced",
    detail: "4 Bedroom Duplex, Ikoyi dropped from ₦350,000,000 to ₦320,000,000.",
    timestamp: "2 days ago",
    listingSlug: "4-bed-duplex-ikoyi",
    listingCategory: "property",
  },
  {
    id: "5",
    kind: "verification",
    title: "Verification completed",
    detail: "2019 Lexus RX350 finished document review and is now verified.",
    timestamp: "3 days ago",
    listingSlug: "2019-lexus-rx350-lekki",
    listingCategory: "vehicle",
  },
  {
    id: "6",
    kind: "match",
    title: "New match from your search",
    detail: "A new 2 bedroom flat in Lekki Phase 1 matches your saved search.",
    timestamp: "4 days ago",
    listingSlug: "2-bed-flat-lekki-phase-1",
    listingCategory: "property",
  },
  {
    id: "7",
    kind: "review",
    title: "Review requested",
    detail: "How was your stay? Leave feedback for Old GRA, Port Harcourt.",
    timestamp: "1 week ago",
    listingSlug: "2-bed-flat-old-gra-port-harcourt",
    listingCategory: "property",
  },
];
