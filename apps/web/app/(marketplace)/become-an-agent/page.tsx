"use client";

import { SignInRequiredPage } from "@/components/marketplace/SignInRequiredPage";
import { AgentOnboardingFlow } from "@/components/agent/AgentOnboardingFlow";
import { useAuth } from "@/lib/auth-context";

/**
 * Gated the same way Dashboard is (app/(marketplace)/dashboard/page.tsx):
 * an agent application is tied to a real account, so an unauthenticated
 * visitor gets the honest sign in prompt rather than a form that has
 * nowhere to attach its answers.
 */
export default function BecomeAnAgentPage() {
  const { isAuthenticated, user, isRestoringSession } = useAuth();

  if (isRestoringSession) return null;

  if (!isAuthenticated || !user) {
    return (
      <SignInRequiredPage
        eyebrow="Become an agent"
        heading="Sign in to apply"
        description="Agent applications are tied to your account so we can verify your identity and documents. Sign in or create an account to get started."
      />
    );
  }

  return <AgentOnboardingFlow user={user} />;
}
