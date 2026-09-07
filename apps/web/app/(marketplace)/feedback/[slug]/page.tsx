"use client";

import { notFound } from "next/navigation";
import { SignInRequiredPage } from "@/components/marketplace/SignInRequiredPage";
import { ResidentFeedbackFlow } from "@/components/property/ResidentFeedbackFlow";
import { getPropertyBySlug } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";

/**
 * The other real end of the rental lifecycle flow, reached from a
 * property's Resident insights section (see ResidentInsightsSection),
 * the same auth-gated pattern become-an-agent/list-a-property/sell-a-car
 * use.
 */
export default function ResidentFeedbackPage({ params }: { params: { slug: string } }) {
  const property = getPropertyBySlug(params.slug);
  const { isAuthenticated, user, isRestoringSession } = useAuth();

  if (!property) notFound();
  if (isRestoringSession) return null;

  if (!isAuthenticated || !user) {
    return (
      <SignInRequiredPage
        eyebrow="Resident feedback"
        heading="Sign in to share feedback"
        description={`Feedback is tied to your account so it can be checked before it appears on ${property.title}.`}
      />
    );
  }

  return <ResidentFeedbackFlow user={user} listingSlug={property.slug} listingTitle={property.title} />;
}
