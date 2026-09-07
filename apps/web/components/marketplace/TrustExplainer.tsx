import { VerificationDisclosure } from "@/components/verification/VerificationDisclosure";

const STEPS = [
  {
    title: "Identity confirmed",
    body: "Every agent, landlord, dealer, and private seller verifies a government issued ID before they can publish a listing.",
  },
  {
    title: "Ownership reviewed",
    body: "Landlords and dealers submit ownership or registration documents matching the property or vehicle being listed.",
  },
  {
    title: "Listing checked",
    body: "An administrator reviews the submitted documents and photos against the listing before it carries a badge.",
  },
];

/**
 * A compact card, not a scrolled-past marketing section: the earlier
 * version used website-landing-page conventions (uppercase eyebrow,
 * a 2xl headline, sm:grid-cols-3, py-16 section padding) that read as
 * a "how it works" block bolted onto the end of an app feed. This
 * keeps the same substance (verification is a real, interactive
 * component, not marketing copy) at the density the rest of the feed
 * uses, and drops the "try it" framing that spoke to a reviewer
 * rather than a user.
 */
export function TrustExplainer() {
  return (
    <section className="px-6 py-3">
      <div className="mx-auto w-full max-w-5xl rounded border border-line bg-parchment p-4">
        <h2 className="text-h3 font-semibold text-ink">How verification works</h2>

        <ol className="mt-3 flex flex-col gap-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-patina font-mono text-[10px] font-bold text-white">
                {index + 1}
              </span>
              <div>
                <p className="text-body-sm font-semibold text-ink">{step.title}</p>
                <p className="mt-0.5 text-body-sm text-ink-soft">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-3 border-t border-line pt-3">
          <VerificationDisclosure
            state="verified"
            detail="Ownership document and listing details reviewed by an administrator on 14 August."
          />
        </div>
      </div>
    </section>
  );
}
