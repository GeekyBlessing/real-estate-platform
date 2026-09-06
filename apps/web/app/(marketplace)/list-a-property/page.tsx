"use client";

import { SignInRequiredPage } from "@/components/marketplace/SignInRequiredPage";
import { PropertyListingFlow } from "@/components/listings/PropertyListingFlow";
import { useAuth } from "@/lib/auth-context";

/**
 * Replaces the former ComingSoonPage stub: the brief is explicit that
 * a coming soon screen is not acceptable wherever a polished UX can
 * be built instead, and a listing needs a real owner behind it, so
 * this gates the same way Become an agent does
 * (app/(marketplace)/become-an-agent/page.tsx).
 */
export default function ListAPropertyPage() {
  const { isAuthenticated, user, isRestoringSession } = useAuth();

  if (isRestoringSession) return null;

  if (!isAuthenticated || !user) {
    return (
      <SignInRequiredPage
        eyebrow="List a property"
        heading="Sign in to list a property"
        description="Listings are tied to your account so buyers and tenants know who they are dealing with. Sign in or create an account to get started."
      />
    );
  }

  return <PropertyListingFlow user={user} />;
}
