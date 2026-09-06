import { ComingSoonPage } from "./ComingSoonPage";

export interface SignInRequiredPageProps {
  eyebrow: string;
  heading: string;
  description: string;
}

/**
 * The shared shell for any nav destination (Dashboard, Messages,
 * Notifications, and eventually My Assets) that is real in concept
 * but genuinely cannot show anything true until Stage 7 of
 * roadmap-reconciliation.md (real accounts and a backend) exists. It
 * is a different reason from ComingSoonPage's "this flow has not been
 * built yet" (List a property, Sell a car): the point here is not
 * that nobody has built a dashboard, it is that a dashboard has
 * nothing real to show without a signed in user behind it, so it says
 * that plainly and offers the one honest next step, signing in or
 * registering, rather than a fake sidebar over empty data.
 *
 * Built on ComingSoonPage rather than duplicating its layout, so both
 * kinds of honest placeholder look like the same system.
 */
export function SignInRequiredPage({ eyebrow, heading, description }: SignInRequiredPageProps) {
  return (
    <ComingSoonPage
      eyebrow={eyebrow}
      heading={heading}
      description={description}
      actions={[
        { href: "/login", label: "Sign in", variant: "primary" },
        { href: "/register", label: "Create an account", variant: "secondary" },
      ]}
    />
  );
}
