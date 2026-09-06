"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { APP_NAME } from "@/lib/brand";
import { LocationPicker } from "@/components/marketplace/LocationPicker";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { MessageIcon, BellIcon } from "@/components/ui/icons";

const primaryLinks = [
  { href: "/search?type=sale", label: "Buy" },
  { href: "/search?type=rent", label: "Rent" },
  { href: "/cars", label: "Cars" },
  { href: "/saved", label: "Saved" },
];

/**
 * Full horizontal nav lives here for md and up, where there's room
 * for it. Below md, BottomNav (components/navigation/BottomNav.tsx)
 * is the primary navigation surface, so this collapses to just the
 * wordmark and location, per the shift to a mobile-first marketplace
 * shell: the two shouldn't stack two competing navigations on a
 * phone screen. The location picker sits on desktop too, since
 * changing city is a core action, not something mobile alone needs.
 *
 * Reads isAuthenticated and the signed in user's name from the shared
 * AuthProvider (lib/auth-context.tsx) directly rather than taking them
 * as props, the same idiom PropertyCard and VehicleCard already use
 * for favorites: real session state, one source of truth, instead of
 * every layout that renders Navbar needing to thread it through.
 *
 * On the home route specifically, this hides itself below md entirely:
 * HomeHeader (components/marketplace/HomeHeader.tsx) is that screen's
 * own compact header (greeting, location, notifications, avatar,
 * search entry), so a phone visitor to "/" should see one header, not
 * this one stacked on top of it. Every other mobile route still gets
 * this bar until each gets its own screen-specific header in turn.
 */
export function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className={cn("border-b border-line bg-parchment", isHome && "hidden md:block")}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display text-h3 font-bold text-ink">
            {APP_NAME}
          </Link>
          <div className="hidden md:block">
            <LocationPicker />
          </div>
          <nav className="hidden gap-3 text-body-sm text-ink-soft md:flex lg:gap-6" aria-label="Primary">
            {primaryLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-ink">
                {link.label}
              </Link>
            ))}
            <Link href="/list-a-property" className="hover:text-ink">
              List a property
            </Link>
            <Link href="/sell-a-car" className="hover:text-ink">
              Sell a car
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <LocationPicker />
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            {/*
              Messages and Notifications are real routes now (each an
              honest "sign in to see this" page rather than a dead
              link, see SignInRequiredPage), shown here regardless of
              isAuthenticated so the nav shell already looks like the
              one a signed in user will get, per the direction to keep
              the frontend honest rather than fake, described in
              roadmap-reconciliation.md. Deferred to lg: at md (tablet)
              width there isn't room for these alongside the full
              primary link row without wrapping or clipping, and both
              are one tap away from the account/dashboard row anyway.
            */}
            <Link href="/messages" aria-label="Messages" className="rounded-full p-2 text-ink-soft hover:bg-paper-deep hover:text-ink">
              <MessageIcon />
            </Link>
            <Link href="/notifications" aria-label="Notifications" className="rounded-full p-2 text-ink-soft hover:bg-paper-deep hover:text-ink">
              <BellIcon />
            </Link>
          </div>
          {isAuthenticated ? (
            <Link href="/dashboard" className="hidden text-body-sm font-semibold text-ink hover:underline md:block">
              {user?.fullName ?? "My account"}
            </Link>
          ) : (
            <Link href="/login" className="hidden md:block">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
          )}
          <Link href="/list-a-property" className="hidden lg:block">
            <Button variant="primary" size="sm">List a property</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
