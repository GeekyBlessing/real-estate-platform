import Link from "next/link";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export interface DashboardSidebarProps {
  items: SidebarItem[];
  activeHref: string;
}

/**
 * Shared shell for the tenant, landlord, agent, and admin dashboards
 * (Section 7 of the architecture), each role passes its own item
 * list, so the navigation structure and the role-specific routes
 * stay decoupled from this component.
 */
export function DashboardSidebar({ items, activeHref }: DashboardSidebarProps) {
  return (
    <nav aria-label="Dashboard" className="w-56 rounded border border-line bg-parchment p-3">
      {items.map((item) => {
        const isActive = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm",
              isActive ? "bg-paper-deep font-semibold text-ink" : "text-ink-soft hover:bg-paper-deep"
            )}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
