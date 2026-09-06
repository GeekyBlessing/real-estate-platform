"use client";

import Link from "next/link";
import { SignInRequiredPage } from "@/components/marketplace/SignInRequiredPage";
import { ListingMedia } from "@/components/ui/ListingMedia";
import { useAuth } from "@/lib/auth-context";
import { mockActivity, ActivityKind } from "@/lib/mock-activity";
import { getPropertyBySlug } from "@/lib/mock-data";
import { getVehicleBySlug } from "@/lib/vehicles";
import { cn } from "@/lib/utils";
import {
  InspectionIcon,
  MessageIcon,
  PriceChangeIcon,
  StarIcon,
  ShieldCheckIcon,
  MatchIcon,
  IconProps,
} from "@/components/ui/icons";

const KIND_ICON: Record<ActivityKind, (props: IconProps) => JSX.Element> = {
  inspection: InspectionIcon,
  message: MessageIcon,
  price: PriceChangeIcon,
  review: StarIcon,
  verification: ShieldCheckIcon,
  match: MatchIcon,
};

const KIND_TONE: Record<ActivityKind, string> = {
  inspection: "bg-verified-bg text-verified",
  message: "bg-paper-deep text-bark",
  price: "bg-pending-bg text-pending",
  review: "bg-paper-deep text-bark",
  verification: "bg-verified-bg text-verified",
  match: "bg-paper-deep text-bark",
};

/**
 * A real marketplace timeline, not a generic "no notifications yet"
 * empty state: an icon per kind of event, a timestamp, and a listing
 * thumbnail pulled through the same ListingMedia every card and
 * gallery uses. The entries themselves are illustrative content (see
 * lib/mock-activity.ts) since real enquiries, replies, and inspection
 * status depend on messaging and inspection backends that are not
 * built yet, the same "mock the UI, not the feature" approach the
 * rest of this build uses; still gated behind a real signed-in
 * session, same as Dashboard and Messages, so a signed-out visitor
 * never sees a timeline that looks like it's theirs.
 */
export default function ActivityPage() {
  const { isAuthenticated, isRestoringSession } = useAuth();

  if (isRestoringSession) return null;

  if (!isAuthenticated) {
    return (
      <SignInRequiredPage
        eyebrow="Your activity"
        heading="Sign in to see your activity"
        description="Inspection updates, replies from agents and sellers, price changes on things you've saved, and new matches will show up here once you're signed in."
      />
    );
  }

  return (
    <main className="px-5 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-h1 font-semibold text-ink">Activity</h1>

        <div className="mt-6 flex flex-col">
          {mockActivity.map((item) => {
            const Icon = KIND_ICON[item.kind];
            const listing =
              item.listingCategory === "property"
                ? item.listingSlug && getPropertyBySlug(item.listingSlug)
                : item.listingSlug && getVehicleBySlug(item.listingSlug);
            const href = listing
              ? item.listingCategory === "property"
                ? `/properties/${listing.slug}`
                : `/cars/${listing.slug}`
              : undefined;

            const content = (
              <div className="flex gap-3 border-b border-line py-4 last:border-b-0">
                <span className={cn("flex h-9 w-9 flex-none items-center justify-center rounded-full", KIND_TONE[item.kind])}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-body-sm font-semibold text-ink">{item.title}</p>
                    <span className="flex-none text-caption text-ink-soft">{item.timestamp}</span>
                  </div>
                  <p className="mt-0.5 text-body-sm text-ink-soft">{item.detail}</p>
                </div>
                {listing && (
                  <span className="h-12 w-12 flex-none overflow-hidden rounded">
                    <ListingMedia
                      image={listing.images[0]!}
                      category={item.listingCategory === "property" ? "property" : "vehicle"}
                      fallbackAlt={listing.title}
                      className="h-full w-full"
                    />
                  </span>
                )}
              </div>
            );

            return href ? (
              <Link key={item.id} href={href} className="transition-colors hover:bg-paper-deep">
                {content}
              </Link>
            ) : (
              <div key={item.id}>{content}</div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
