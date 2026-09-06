import { VerificationState } from "@/components/ui/Badge";

/**
 * Types only, no UI, the same way VehicleCardData and VehicleDetail
 * (lib/listings.ts) were sketched out before the cars build started so
 * the schema didn't need a second redesign once real work began. These
 * cover the client's My Assets specification (documents, maintenance,
 * expenses, reminders, inspections), audited in
 * asset-platform-implementation-audit.md, referred to as Stage 9 in
 * roadmap-reconciliation.md.
 *
 * Every one of these records belongs to a specific signed in user and
 * most belong to a specific listing, neither of which exists yet (see
 * the audit's section 9: this is an accounts and persistence problem,
 * not a UI problem). Nothing here is wired into any screen. Building
 * a My Assets page against these types with mock data behind it would
 * be exactly the placeholder-pretending-to-work problem the brief
 * warns against, so this file stays unused by any component until
 * Stage 7 (real accounts and a backend) exists.
 *
 * Expect these shapes to change once real usage informs them; that is
 * normal, per the audit's fourth risk, as long as changes stay typed
 * and reviewed rather than guessed at silently.
 */

/**
 * The one way every asset-scoped record points back at the property
 * or vehicle it belongs to, rather than each interface below carrying
 * its own ad hoc propertySlug or vehicleSlug field that could drift
 * out of sync with ListingBase's own category union.
 */
export interface AssetRef {
  category: "property" | "vehicle";
  slug: string;
}

export type DocumentType =
  | "title deed"
  | "certificate of occupancy"
  | "tenancy agreement"
  | "survey plan"
  | "proof of ownership"
  | "vehicle particulars"
  | "insurance certificate"
  | "inspection report"
  | "other";

/**
 * A single uploaded file tied to an owner and, usually, an asset.
 * verificationState and reuses the same Badge component and disclosure
 * pattern already built for listings and agents (see
 * marketplace-expansion-audit-and-plan.md section 8) rather than a
 * second verification system just for documents.
 */
export interface Document {
  id: string;
  ownerId: string;
  asset?: AssetRef;
  type: DocumentType;
  fileName: string;
  uploadedAt: string;
  expiresAt?: string;
  verificationState: VerificationState;
  notes?: string;
}

export type MaintenanceCategory =
  | "plumbing"
  | "electrical"
  | "structural"
  | "appliance"
  | "pest control"
  | "hvac"
  | "engine"
  | "brakes"
  | "tires"
  | "bodywork"
  | "servicing"
  | "other";

export type MaintenancePriority = "low" | "medium" | "high" | "urgent";

export type MaintenanceRequestStatus = "submitted" | "acknowledged" | "in progress" | "resolved" | "closed";

/**
 * The live workflow ticket a resident or owner opens. Distinct from
 * MaintenanceRecord below: a request is a conversation with a status
 * that moves forward, a record is the closed, historical ledger entry
 * a completed request (or a routine service with no request behind
 * it, like a scheduled oil change) leaves in its place.
 */
export interface MaintenanceRequest {
  id: string;
  asset: AssetRef;
  submittedBy: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceRequestStatus;
  submittedAt: string;
  resolvedAt?: string;
  photoUrls?: string[];
}

export interface MaintenanceRecord {
  id: string;
  asset: AssetRef;
  requestId?: string;
  category: MaintenanceCategory;
  description: string;
  performedBy?: string;
  costInKobo?: number;
  completedAt: string;
  notes?: string;
}

export type ExpenseCategory =
  | "rent"
  | "service charge"
  | "utility"
  | "insurance"
  | "maintenance"
  | "tax"
  | "fuel"
  | "registration"
  | "other";

export type ExpenseStatus = "pending" | "paid" | "overdue";

export interface Expense {
  id: string;
  ownerId: string;
  asset?: AssetRef;
  category: ExpenseCategory;
  amountInKobo: number;
  incurredOn: string;
  dueOn?: string;
  status: ExpenseStatus;
  notes?: string;
}

export type ReminderRecurrence = "none" | "monthly" | "quarterly" | "yearly";
export type ReminderStatus = "upcoming" | "completed" | "dismissed";

/**
 * Not always asset scoped, unlike everything else in this file: a
 * reminder to renew a personal document, for instance, has no
 * property or vehicle behind it, so asset stays optional here rather
 * than on AssetRef itself.
 */
export interface Reminder {
  id: string;
  ownerId: string;
  asset?: AssetRef;
  title: string;
  dueDate: string;
  recurrence: ReminderRecurrence;
  status: ReminderStatus;
  notifyBeforeDays?: number;
}

export type InspectionMode = "in person" | "video";
export type InspectionStatus = "requested" | "confirmed" | "completed" | "cancelled";

/**
 * The real entity behind what the inspection request modal currently
 * simulates (see the audit's section 3: "the modal simulates success
 * and discards the input"). Kept separate from Enquiry, referenced in
 * marketplace-expansion-audit-and-plan.md's shared data model, since
 * an inspection has a schedule and a mode that a general enquiry does
 * not.
 */
export interface Inspection {
  id: string;
  asset: AssetRef;
  requestedBy: string;
  mode: InspectionMode;
  status: InspectionStatus;
  scheduledAt?: string;
  createdAt: string;
  notes?: string;
}
