/**
 * The real stages a rental moves through, end to end. This is the
 * architecture a lease/tenancy backend would eventually implement:
 * every stage after "Inspection requested" needs the other side (a
 * landlord or agent confirming a time, a signature, a move-in date
 * later confirmed by both parties) to actually advance, which is why
 * this build can only ever truthfully reach two of them on its own:
 * a tenant requesting an inspection (already a real action, see
 * InspectionRequestModal), and a tenant sharing feedback once they
 * self-attest to a completed tenancy (see ResidentFeedbackFlow,
 * which asks rather than assumes). Everything in between renders as
 * "not started" rather than faking progress no one has confirmed.
 * Swapping the two real stages for a real backend-driven state later
 * is a data source change, not a redesign: this shape is what a real
 * /rentals/{id} endpoint would return.
 */
export type RentalStage =
  | "inspection_requested"
  | "inspection_completed"
  | "lease_signed"
  | "moved_in"
  | "moved_out"
  | "feedback_shared";

export interface RentalStageInfo {
  stage: RentalStage;
  label: string;
  description: string;
  /** Whether a tenant's own action in this build can honestly reach this stage without a counterparty. */
  reachableAlone: boolean;
}

export const RENTAL_STAGES: RentalStageInfo[] = [
  {
    stage: "inspection_requested",
    label: "Inspection requested",
    description: "You proposed a time to view the property.",
    reachableAlone: true,
  },
  {
    stage: "inspection_completed",
    label: "Inspection completed",
    description: "The landlord or agent confirms the visit took place.",
    reachableAlone: false,
  },
  {
    stage: "lease_signed",
    label: "Lease signed",
    description: "Both sides agree to terms and sign.",
    reachableAlone: false,
  },
  {
    stage: "moved_in",
    label: "Moved in",
    description: "Move-in is confirmed and the tenancy starts.",
    reachableAlone: false,
  },
  {
    stage: "moved_out",
    label: "Moved out",
    description: "The tenancy ends and move-out is confirmed.",
    reachableAlone: false,
  },
  {
    stage: "feedback_shared",
    label: "Feedback shared",
    description: "You told us what living there was actually like.",
    reachableAlone: true,
  },
];

export interface ResidentFeedbackEntry {
  listingSlug: string;
  /** Self-attested, not verified against a real lease record, which does not exist yet. */
  livedThereConfirmed: boolean;
  moveInApprox: string;
  moveOutApprox: string;
  accuracyRating: number;
  landlordRating: number;
  neighborhoodRating: number;
  comments: string;
  submittedAt: string;
}
