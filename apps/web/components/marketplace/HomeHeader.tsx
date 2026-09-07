"use client";

import Link from "next/link";
import { Greeting } from "@/components/marketplace/Greeting";
import { LocationPicker } from "@/components/marketplace/LocationPicker";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/Avatar";
import { BellIcon, ProfileIcon as ProfileGlyph, SearchIcon } from "@/components/ui/icons";

/** The shared Avatar when signed in, matching the treatment PropertyCard, VehicleCard, and AgentCard use for a person; a plain profile glyph when signed out, since there is no name yet to abbreviate. */
function AvatarButton() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user?.fullName) {
    return (
      <Link href="/dashboard" aria-label="Your account">
        <Avatar name={user.fullName} size="sm" />
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      aria-label="Sign in"
      className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-patina text-white"
    >
      <ProfileGlyph size={17} />
    </Link>
  );
}

/**
 * The home screen's own compact header: greeting, location, a
 * notification bell, and an account avatar in one row, then a single
 * tappable search entry point below it, per the brief's home screen
 * spec. Replaces the old "What are you looking for?" hero and its
 * manual Property/Cars toggle, which read as a website landing
 * section rather than an app home. Navbar (components/navigation/Navbar.tsx)
 * hides itself on mobile for the home route specifically so this is
 * the only header a phone visitor sees there, and still renders here
 * underneath the real Navbar at desktop widths as a welcome band,
 * the same pattern Airbnb and Uber use for their web home pages.
 */
export function HomeHeader() {
  return (
    <div className="border-b border-line bg-paper-deep px-6 pb-6 pt-9 sm:pt-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-body text-ink-soft">
              <Greeting />
            </p>
            <div className="mt-1">
              <LocationPicker />
            </div>
          </div>
          <div className="flex flex-none items-center gap-1.5">
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-parchment hover:text-ink"
            >
              <BellIcon size={19} />
            </Link>
            <AvatarButton />
          </div>
        </div>

        <Link
          href="/explore"
          className="mt-5 flex items-center gap-2.5 rounded border border-line-strong bg-parchment px-4 py-3 text-body-sm text-ink-soft shadow-float transition-colors hover:border-bark active:scale-[0.99]"
        >
          <SearchIcon size={18} className="flex-none" />
          Search homes, cars, or locations
        </Link>
      </div>
    </div>
  );
}
