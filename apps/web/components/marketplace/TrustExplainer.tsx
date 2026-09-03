import { VerificationDisclosure } from "@/components/verification/VerificationDisclosure";

const STEPS = [
  {
    title: "Identity confirmed",
    body: "Every agent and landlord verifies a government issued ID before they can publish a listing.",
  },
  {
    title: "Ownership reviewed",
    body: "Landlords submit a certificate of occupancy, deed, or tenancy agreement matching the property address.",
  },
  {
    title: "Listing checked",
    body: "An administrator reviews the submitted documents and photos against the listing before it carries a badge.",
  },
];

/**
 * Shows the verification component doing its actual job rather than
 * describing it in marketing copy, per the blueprint's homepage
 * structure. The badge below is interactive, the same component used
 * on a real property detail page.
 */
export function TrustExplainer() {
  return (
    <section className="border-b border-line px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-wider text-bark">How verification works</p>
        <h2 className="mt-2 font-display text-2xl text-ink">A badge that means something specific.</h2>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title}>
              <p className="font-mono text-xs text-patina">{String(index + 1).padStart(2, "0")}</p>
              <p className="mt-2 text-sm font-semibold text-ink">{step.title}</p>
              <p className="mt-1.5 text-sm text-ink-soft">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded border border-line bg-parchment p-6">
          <p className="text-xs font-semibold text-ink">Try it. This is the real component.</p>
          <div className="mt-3">
            <VerificationDisclosure
              state="verified"
              detail="Ownership document and listing details reviewed by an administrator on 14 August."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
