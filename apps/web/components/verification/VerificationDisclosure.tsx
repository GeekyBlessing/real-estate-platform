"use client";

import { useState } from "react";
import {
  VerificationState,
  verificationStateStyles as stateStyles,
  verificationStateLabels as stateLabels,
  VERIFICATION_DISCLAIMER,
} from "@/components/ui/Badge";
import { ShieldIcon } from "./ShieldIcon";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { cn } from "@/lib/utils";

/**
 * The general explanation for what each state means, shown above the
 * listing-specific detail string a caller passes in. Verification
 * should never just say "Verified" with nothing behind it; this is
 * the sentence that answers "verified as what, exactly."
 */
const stateExplanations: Record<VerificationState, string> = {
  unverified: "No identity, ownership, or listing documents have been submitted for review yet.",
  pending: "Documents have been submitted and are waiting on an administrator's review.",
  verified: "The identity, ownership, or listing documents behind this have been reviewed by an administrator.",
  rejected: "Submitted documents did not pass review.",
  flagged: "This listing is under review following a report from another user.",
  suspended: "This account or listing has been suspended pending further review.",
};

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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex items-center gap-2 rounded-full py-1.5 pl-2.5 pr-3.5 text-sm font-semibold",
          stateStyles[state],
          className
        )}
      >
        <ShieldIcon state={state} />
        {stateLabels[state]}
        <span className="text-xs font-normal underline decoration-current/40 underline-offset-2">What does this mean?</span>
      </button>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title={stateLabels[state]}>
        <p className="text-body-sm text-ink-soft">{stateExplanations[state]}</p>
        <p className="mt-3 border-t border-line pt-3 font-mono text-xs text-bark">{detail}</p>
        <p className="mt-4 border-t border-line pt-4 text-body-sm text-ink-soft">{VERIFICATION_DISCLAIMER}</p>
      </BottomSheet>
    </>
  );
}
