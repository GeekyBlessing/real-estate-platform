"use client";

import { SignInRequiredPage } from "@/components/marketplace/SignInRequiredPage";
import { ComingSoonPage } from "@/components/marketplace/ComingSoonPage";
import { useAuth } from "@/lib/auth-context";

/**
 * Messaging needs a real Conversation and Message entity (see the
 * shared data model in marketplace-expansion-audit-and-plan.md
 * section 3 and the schema already sitting ready in
 * apps/api/app/modules/messaging/models.py). Signed in or not, that
 * part isn't built yet, so both states stay honest, just about
 * different things: signed out needs an account first, signed in has
 * an account but nothing to read yet.
 */
export default function MessagesPage() {
  const { isAuthenticated, isRestoringSession } = useAuth();

  if (isRestoringSession) return null;

  if (!isAuthenticated) {
    return (
      <SignInRequiredPage
        eyebrow="Messages"
        heading="Sign in to see your messages"
        description="Conversations with sellers, agents, and dealers will live here once accounts and messaging are real. For now, contacting a seller from a listing sends your enquiry directly."
      />
    );
  }

  return (
    <ComingSoonPage
      eyebrow="Messages"
      heading="Messaging isn't built yet"
      description="You're signed in, but conversations with sellers, agents, and dealers aren't wired up yet. For now, contacting a seller from a listing sends your enquiry directly."
    />
  );
}
