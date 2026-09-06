import Link from "next/link";
import { Button, ButtonVariant } from "@/components/ui/Button";

export interface ComingSoonAction {
  href: string;
  label: string;
  variant?: ButtonVariant;
}

export interface ComingSoonPageProps {
  eyebrow: string;
  heading: string;
  description: string;
  /**
   * Defaults to a single "Back to explore" link, the right call for a
   * flow that simply has not been built yet (List a property, Sell a
   * car). Pass explicit actions for a page whose reason is different,
   * such as Sign in / Create an account for a page that is honestly
   * gated behind accounts not existing yet (see SignInRequiredPage
   * below), rather than reusing "Back to explore" for a case where
   * there is somewhere more useful to send the visitor.
   */
  actions?: ComingSoonAction[];
}

const defaultActions: ComingSoonAction[] = [{ href: "/", label: "Back to explore", variant: "secondary" }];

/**
 * An honest placeholder for a flow that has not been built yet,
 * rather than a link that 404s or a form that pretends to submit
 * somewhere. Used by both List a property and Sell a car until the
 * real multi step listing creation flow exists, and by
 * SignInRequiredPage for anything gated behind accounts that don't
 * exist yet.
 */
export function ComingSoonPage({ eyebrow, heading, description, actions = defaultActions }: ComingSoonPageProps) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-bark">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">{heading}</h1>
        <p className="mt-3 text-sm text-ink-soft">{description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button variant={action.variant ?? "secondary"}>{action.label}</Button>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
