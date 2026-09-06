import { VerificationState } from "@/components/ui/Badge";
import { VerificationDisclosure } from "@/components/verification/VerificationDisclosure";
import { CheckIcon } from "@/components/ui/icons";

export interface VerificationSectionProps {
  state: VerificationState;
  detail: string;
  category: "property" | "vehicle";
}

function DotIcon() {
  return <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-clay" aria-hidden="true" />;
}

interface VerificationCheck {
  label: string;
  explanation: string;
}

/**
 * Named, specific checks rather than a blanket "Verified" badge with
 * nothing behind it: each row states exactly what was reviewed and
 * what that review actually confirms, in the same plain, unhedged
 * register as VerificationDisclosure's stateExplanations. "Listing
 * reviewed" is shared by both categories since it means the same
 * thing either way: the listing's own details were checked against
 * the submitted documents, not just the account holder's identity.
 */
function checksFor(category: "property" | "vehicle"): VerificationCheck[] {
  const subjectChecks: VerificationCheck[] =
    category === "property"
      ? [
          {
            label: "Property documents reviewed",
            explanation: "The ownership or agency document submitted for this property has been checked by an administrator.",
          },
        ]
      : [
          {
            label: "Vehicle documents reviewed",
            explanation: "The registration or ownership document submitted for this vehicle has been checked by an administrator.",
          },
        ];

  return [
    {
      label: "Identity verified",
      explanation: "This confirms the account holder completed the platform's identity verification process.",
    },
    ...subjectChecks,
    {
      label: "Listing reviewed",
      explanation: "The listing details were checked against the submitted documents before publishing.",
    },
  ];
}

/**
 * The full VERIFICATION section the detail page spec asks for: named
 * checks with their own one-line explanation, not a bare "Verified"
 * word and a separate disclosure buried behind a tap. The tap-to-expand
 * VerificationDisclosure still sits underneath it for the disclaimer
 * and this specific listing's review date, so that copy never drifts
 * out of sync with the agent profile page that reuses it.
 */
export function VerificationSection({ state, detail, category }: VerificationSectionProps) {
  const checks = checksFor(category);
  const done = state === "verified";

  return (
    <section>
      <h2 className="text-h3 font-semibold text-ink">Verification</h2>
      {state === "verified" || state === "pending" ? (
        <ul className="mt-3 flex flex-col gap-4">
          {checks.map((check) => (
            <li key={check.label} className="flex gap-2.5">
              {done ? <CheckIcon size={15} active className="mt-0.5 flex-none text-verified" /> : <DotIcon />}
              <div>
                <p className="text-body-sm font-semibold text-ink">{check.label}</p>
                <p className="mt-0.5 text-body-sm text-ink-soft">{check.explanation}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-body-sm text-ink-soft">This listing has not completed verification yet.</p>
      )}
      <div className="mt-4">
        <VerificationDisclosure state={state} detail={detail} />
      </div>
    </section>
  );
}
