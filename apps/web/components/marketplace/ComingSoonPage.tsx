import Link from "next/link";
import { Button } from "@/components/ui/Button";

export interface ComingSoonPageProps {
  eyebrow: string;
  heading: string;
  description: string;
}

/**
 * An honest placeholder for a flow that has not been built yet,
 * rather than a link that 404s or a form that pretends to submit
 * somewhere. Used by both List a property and Sell a car until the
 * real multi step listing creation flow exists.
 */
export function ComingSoonPage({ eyebrow, heading, description }: ComingSoonPageProps) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-bark">{eyebrow}</p>
        <h1 className="mt-2 font-display text-2xl text-ink">{heading}</h1>
        <p className="mt-3 text-sm text-ink-soft">{description}</p>
        <div className="mt-6 flex justify-center">
          <Link href="/">
            <Button variant="secondary">Back to explore</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
