"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignInRequiredPage } from "@/components/marketplace/SignInRequiredPage";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import {
  ChevronRightIcon,
  InspectionIcon,
  MessageIcon,
  BuildingIcon,
  HouseKeyIcon,
  AgentIcon,
  CarIcon,
  ShieldIcon,
  BellIcon,
  HelpIcon,
} from "@/components/ui/icons";

interface Row {
  label: string;
  href?: string;
  icon: JSX.Element;
  soon?: boolean;
}

function IconWrap({ children }: { children: React.ReactNode }) {
  return <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-paper-deep text-ink-soft">{children}</span>;
}

const ACCOUNT_ROWS: Row[] = [
  { label: "My inspections", icon: <IconWrap><InspectionIcon size={16} /></IconWrap>, soon: true },
  { label: "My messages", href: "/messages", icon: <IconWrap><MessageIcon size={16} /></IconWrap> },
  { label: "My listings", icon: <IconWrap><BuildingIcon size={16} /></IconWrap>, soon: true },
  { label: "My assets", icon: <IconWrap><HouseKeyIcon size={16} /></IconWrap>, soon: true },
];

const SELL_ROWS: Row[] = [
  { label: "Become an agent", href: "/become-an-agent", icon: <IconWrap><AgentIcon size={16} /></IconWrap> },
  { label: "List a property", href: "/list-a-property", icon: <IconWrap><HouseKeyIcon size={16} /></IconWrap> },
  { label: "Sell a car", href: "/sell-a-car", icon: <IconWrap><CarIcon size={16} /></IconWrap> },
];

const SETTINGS_ROWS: Row[] = [
  { label: "Verification", icon: <IconWrap><ShieldIcon size={16} /></IconWrap>, soon: true },
  { label: "Notification settings", href: "/notifications", icon: <IconWrap><BellIcon size={16} /></IconWrap> },
  { label: "Help center", icon: <IconWrap><HelpIcon size={16} /></IconWrap>, soon: true },
];

function RowList({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-hidden rounded border border-line bg-parchment">
      {rows.map((row, index) => {
        const inner = (
          <div className={cn("flex items-center gap-3 px-4 py-3.5", index !== rows.length - 1 && "border-b border-line")}>
            {row.icon}
            <span className="flex-1 text-body-sm font-semibold text-ink">{row.label}</span>
            {row.soon ? <span className="text-caption font-semibold text-clay">Soon</span> : <ChevronRightIcon size={16} className="flex-none text-clay" />}
          </div>
        );
        return row.href ? (
          <Link key={row.label} href={row.href} className="block transition-colors hover:bg-paper-deep">
            {inner}
          </Link>
        ) : (
          <div key={row.label} className="opacity-60">
            {inner}
          </div>
        );
      })}
    </div>
  );
}

/**
 * A native app settings list, not a centered "signed in as X" card
 * and not a dashboard of invented metrics. Rows with a real
 * destination navigate there (My messages, List a property, Sell a
 * car, Notification settings); rows for flows that are real in
 * concept but not built yet (My inspections, My listings, My assets,
 * Become an agent, Verification, Help center, all Stage 8+ in
 * roadmap-reconciliation.md) are visibly present but marked "Soon"
 * rather than linking somewhere that would 404 or fake a real screen.
 * Signing out is a mutation, not a navigation, which is why it lives
 * as its own action rather than another row in the list.
 */
export default function DashboardPage() {
  const { isAuthenticated, user, isRestoringSession, logout } = useAuth();
  const router = useRouter();

  if (isRestoringSession) return null;

  if (!isAuthenticated || !user) {
    return (
      <SignInRequiredPage
        eyebrow="Your account"
        heading="Sign in to see your account"
        description="Your listings, enquiries, inspections, and verification status will live here once you're signed in."
      />
    );
  }

  async function handleSignOut() {
    await logout();
    router.push("/");
  }

  return (
    <main className="px-5 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-h1 font-semibold text-ink">Profile</h1>

        <div className="mt-5 flex items-center gap-4">
          <Avatar name={user.fullName} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-h3 font-semibold text-ink">{user.fullName}</p>
            <p className="text-body-sm text-ink-soft">{user.roles.join(", ") || "Member"}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6">
          <div>
            <p className="mb-2 text-label uppercase text-ink-soft">My account</p>
            <RowList rows={ACCOUNT_ROWS} />
          </div>
          <div>
            <p className="mb-2 text-label uppercase text-ink-soft">Sell or list</p>
            <RowList rows={SELL_ROWS} />
          </div>
          <div>
            <p className="mb-2 text-label uppercase text-ink-soft">Settings</p>
            <RowList rows={SETTINGS_ROWS} />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-8 flex h-11 w-full items-center justify-center rounded-sm border border-danger text-body-sm font-semibold text-danger transition-colors hover:bg-danger-bg active:bg-danger-bg"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
