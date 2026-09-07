"use client";

import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRentalLifecycle } from "@/lib/rental-lifecycle-context";

export interface ResidentInsightsSectionProps {
  listingSlug: string;
  isRental: boolean;
}

/**
 * A real EmptyState (matching Saved's, not an ad hoc bordered
 * paragraph), plus, for rentals, a "Share feedback" action that
 * starts the real ResidentFeedbackFlow rather than being decorative.
 * If this browser has already submitted feedback for this listing,
 * says so honestly instead of repeating the generic empty copy or
 * pretending the feedback is now visible: it is pending review (see
 * lib/rental-lifecycle-context.tsx), same as everything reviewed by
 * an administrator elsewhere in this app.
 */
export function ResidentInsightsSection({ listingSlug, isRental }: ResidentInsightsSectionProps) {
  const router = useRouter();
  const { feedbackFor } = useRentalLifecycle();
  const submitted = feedbackFor(listingSlug);

  if (submitted) {
    return (
      <EmptyState
        title="Your feedback is pending review"
        description="Once an administrator checks it, it will appear here for other people looking at this listing."
      />
    );
  }

  return (
    <EmptyState
      title="Not enough resident feedback yet"
      description={
        isRental
          ? "Feedback appears here once residents who completed a tenancy at this listing have shared it."
          : "Feedback appears here once buyers who completed a purchase have shared it."
      }
      actionLabel={isRental ? "Share feedback" : undefined}
      onAction={isRental ? () => router.push(`/feedback/${listingSlug}`) : undefined}
    />
  );
}
