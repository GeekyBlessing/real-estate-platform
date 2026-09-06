"use client";

import { SignInRequiredPage } from "@/components/marketplace/SignInRequiredPage";
import { SellACarFlow } from "@/components/listings/SellACarFlow";
import { useAuth } from "@/lib/auth-context";

/**
 * Replaces the former ComingSoonPage stub, the same way
 * app/(marketplace)/list-a-property/page.tsx does for properties.
 */
export default function SellACarPage() {
  const { isAuthenticated, user, isRestoringSession } = useAuth();

  if (isRestoringSession) return null;

  if (!isAuthenticated || !user) {
    return (
      <SignInRequiredPage
        eyebrow="Sell a car"
        heading="Sign in to list a vehicle"
        description="Listings are tied to your account so buyers know who they are dealing with. Sign in or create an account to get started."
      />
    );
  }

  return <SellACarFlow user={user} />;
}
