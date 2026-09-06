"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { HomeIcon, CompassIcon, HeartIcon, ActivityIcon, ProfileIcon } from "@/components/ui/icons";

interface NavItem {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
  match: (pathname: string) => boolean;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: (active) => <HomeIcon active={active} />, match: (path) => path === "/" },
  {
    href: "/explore",
    label: "Explore",
    icon: (active) => <CompassIcon active={active} />,
    match: (path) =>
      path.startsWith("/explore") || path.startsWith("/search") || path.startsWith("/cars") || path.startsWith("/properties"),
  },
  { href: "/saved", label: "Saved", icon: (active) => <HeartIcon active={active} />, match: (path) => path.startsWith("/saved") },
  { href: "/activity", label: "Activity", icon: (active) => <ActivityIcon active={active} />, match: (path) => path.startsWith("/activity") },
];

const PROFILE_MATCH = (path: string) => path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/dashboard");

/**
 * The primary navigation surface on small screens, matching the
 * information architecture in the product brief: Home, Explore,
 * Saved, Activity, Profile, five items, nothing more. Explore opens
 * the dedicated search entry screen (app/(marketplace)/explore/page.tsx:
 * recent searches, suggested locations, suggested searches) rather
 * than jumping straight to a results page, and still highlights while
 * the user is on either results page or a listing detail page, not
 * just on /explore itself.
 *
 * Navbar (components/navigation/Navbar.tsx) keeps the equivalent
 * links for md and up, so desktop behavior is untouched.
 */
export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const navItems: NavItem[] = [
    ...BASE_NAV_ITEMS,
    {
      // Signed in, Profile goes to the real dashboard (still an honest
      // "sign in required" or "here's what's real so far" page, see
      // app/(marketplace)/dashboard/page.tsx, never a fake one); signed
      // out, straight to sign in, same as before real auth existed.
      href: isAuthenticated ? "/dashboard" : "/login",
      label: "Profile",
      icon: (active) => <ProfileIcon active={active} />,
      match: PROFILE_MATCH,
    },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-parchment pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-1">
        {navItems.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-label uppercase",
                active ? "text-ink" : "text-ink-soft"
              )}
            >
              {item.icon(active)}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
