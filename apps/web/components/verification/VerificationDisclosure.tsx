"use client";

import { useId, useState } from "react";
import { VerificationState } from "@/components/ui/Badge";
import { ShieldIcon } from "./ShieldIcon";
import { cn } from "@/lib/utils";

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

export const VERIFICATION_DISCLAIMER =
  "Verification confirms specific documents and checks were reviewed. It does not guarantee legal ownership or eliminate the risk of fraud.";

export interface VerificationDisclosureProps {
  state: VerificationState;
  /** What was actually checked for this specific subject, e.g. "Ownership document and listing details reviewed on 14 August." */
  detail: string;
  className?: string;
}

/**
 * The full verification component described in the blueprint: not a
 * repurposed status badge, a control that discloses exactly what was
 * checked when a user asks. Used on the property detail page and
 * agent or landlord profiles; the compact VerificationBadge (Badge.tsx)
 * stays reserved for property cards and admin tables.
 */
export function VerificationDisclosure({ state, detail, className }: VerificationDisclosureProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "inline-flex items-center gap-2 rounded-full py-1.5 pl-2.5 pr-3.5 text-sm font-semibold",
          stateStyles[state]
        )}
      >
        <ShieldIcon state={state} />
        {stateLabels[state]}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={`${stateLabels[state]} details`}
          className="absolute left-0 top-full z-20 mt-2 w-80 rounded bg-parchment p-5 shadow-float"
        >
          <p className="text-sm font-semibold text-ink">{stateLabels[state]}</p>
          <p className="mt-1.5 font-mono text-xs text-bark">{detail}</p>
          <p className="mt-4 border-t border-line pt-4 text-xs text-ink-soft">{VERIFICATION_DISCLAIMER}</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 text-xs font-semibold text-patina hover:text-patina-deep"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
