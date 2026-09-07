"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navigation/Navbar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { ToastProvider } from "@/components/ui/Toast";
import { LocationProvider } from "@/lib/location-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import { RentalLifecycleProvider } from "@/lib/rental-lifecycle-context";
import { APP_NAME } from "@/lib/brand";

/**
 * Routes whose job is a single focused task (a multi step application,
 * eventually listing creation) rather than browsing: the global Navbar
 * and BottomNav would only compete with that task's own sticky footer
 * actions (both fixed to the bottom of the viewport), so these render
 * a minimal brand line instead, the same idea (auth)/layout.tsx already
 * uses for sign in and register.
 */
const FULL_SCREEN_ROUTES = ["/become-an-agent", "/list-a-property", "/sell-a-car", "/feedback"];

/**
 * The mobile-first app shell: a slim Navbar (full links from md up,
 * wordmark only below it) plus a fixed BottomNav that becomes the
 * primary navigation on phone widths. The pb-24 wrapper keeps page
 * content clear of BottomNav's fixed height and iOS safe area; it's
 * dropped again at md, where BottomNav renders nothing.
 *
 * No app-wide footer here on purpose: a multi-column
 * marketplace/trust/support/legal footer belongs on a public
 * marketing site, not repeated at the bottom of every screen of an
 * installed-feeling app, where bottom navigation already answers
 * "what else can I do here." Individual pages add their own light
 * closing content (a disclaimer line, a report link) where it's
 * actually relevant instead.
 *
 * LocationProvider, FavoritesProvider, and RentalLifecycleProvider
 * mount once here so every marketplace route shares the same
 * selected city, the same saved listings, and the same per-browser
 * rental-lifecycle state, rather than each page keeping its own
 * disconnected copy.
 */
export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullScreen = FULL_SCREEN_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <LocationProvider>
      <FavoritesProvider>
        <RentalLifecycleProvider>
          <ToastProvider>
            {isFullScreen ? (
              <div className="px-5 py-4 sm:px-6">
                <Link href="/" className="font-display text-base font-bold text-ink">
                  {APP_NAME}
                </Link>
              </div>
            ) : (
              <Navbar />
            )}
            <div className={isFullScreen ? undefined : "pb-24 md:pb-0"}>{children}</div>
            {!isFullScreen && <BottomNav />}
          </ToastProvider>
        </RentalLifecycleProvider>
      </FavoritesProvider>
    </LocationProvider>
  );
}
