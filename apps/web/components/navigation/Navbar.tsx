import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { APP_NAME } from "@/lib/brand";

export interface NavbarProps {
  isAuthenticated: boolean;
  userDisplayName?: string;
}

const primaryLinks = [
  { href: "/search?type=sale", label: "Buy" },
  { href: "/search?type=rent", label: "Rent" },
  { href: "/cars", label: "Cars" },
];

export function Navbar({ isAuthenticated, userDisplayName }: NavbarProps) {
  return (
    <header className="border-b border-line bg-parchment">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-10">
          <Link href="/" className="font-display text-lg font-bold text-ink">
            {APP_NAME}
          </Link>
          <nav className="flex gap-6 text-sm text-ink-soft" aria-label="Primary">
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
          {isAuthenticated ? (
            <Link href="/dashboard" className="text-sm font-semibold text-ink hover:underline">
              {userDisplayName ?? "My account"}
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
          )}
          <Link href="/list-a-property">
            <Button variant="primary" size="sm">List a property</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
