"use client";

import { SignInRequiredPage } from "@/components/marketplace/SignInRequiredPage";
import { ComingSoonPage } from "@/components/marketplace/ComingSoonPage";
import { useAuth } from "@/lib/auth-context";

/**
 * Notification delivery needs a real Notification entity (the schema
 * already sits ready in apps/api/app/modules/notifications/models.py)
 * and, eventually, the resident lifecycle triggers from
 * marketplace-expansion-audit-and-plan.md section 10. Neither is
 * wired up yet, so, like Messages, this stays honest about two
 * different reasons depending on whether the visitor is signed in.
 */
export default function NotificationsPage() {
  const { isAuthenticated, isRestoringSession } = useAuth();

  if (isRestoringSession) return null;

  if (!isAuthenticated) {
    return (
      <SignInRequiredPage
        eyebrow="Notifications"
        heading="Sign in to see your notifications"
        description="Updates on your enquiries, saved searches, verification status, and, once tenancies are real, resident experience follow ups will show up here once accounts are live."
      />
    );
  }

  return (
    <ComingSoonPage
      eyebrow="Notifications"
      heading="Notifications aren't built yet"
      description="You're signed in, but nothing sends a notification yet. Updates on enquiries, verification status, and resident experience follow ups will land here once that's wired up."
    />
  );
}
