import { cn } from "@/lib/utils";

export type VerificationState =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected"
  | "flagged"
  | "suspended";

const stateStyles: Record<VerificationState, string> = {
  unverified: "bg-paper-deep text-bark",
  pending: "bg-pending-bg text-pending",
  verified: "bg-verified-bg text-verified",
  rejected: "bg-danger-bg text-danger",
  flagged: "bg-danger-bg text-danger",
  suspended: "bg-neutral-bg text-neutral",
};

const stateLabels: Record<VerificationState, string> = {
  unverified: "Unverified",
  pending: "Verification pending",
  verified: "Verified",
  rejected: "Rejected",
  flagged: "Flagged",
  suspended: "Suspended",
};

/**
 * The one line of copy every badge carries, per the product spec:
 * a verification badge is a set of completed checks, never a legal
 * guarantee. Surface this in a tooltip or adjacent help text
 * wherever VerificationBadge is used at a decision point (property
 * detail page, agent profile), not just on a buried terms page.
 */
export const VERIFICATION_DISCLAIMER =
  "Verification confirms specific documents and checks were reviewed. It does not guarantee legal ownership or eliminate the risk of fraud.";

export interface VerificationBadgeProps {
  state: VerificationState;
  className?: string;
}

export function VerificationBadge({ state, className }: VerificationBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full py-1 pl-2 pr-2.5 text-xs font-semibold",
        stateStyles[state],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {stateLabels[state]}
    </span>
  );
}

export interface BadgeProps {
  children: React.ReactNode;
  tone?: "neutral" | "patina";
  className?: string;
}

/** Generic badge for non-verification labels (counts, tags, "Featured"). */
export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "patina" ? "bg-patina text-white" : "bg-paper-deep text-ink-soft",
        className
      )}
    >
      {children}
    </span>
  );
}
