import { VerificationDisclosure } from "@/components/verification/VerificationDisclosure";
import { Button } from "@/components/ui/Button";
import { Agent } from "@/lib/mock-data";

export interface AgentProfileHeaderProps {
  agent: Agent;
}

/**
 * A professional identity, not a social profile: verification status
 * front and center with its full disclosure, then the actions a
 * visitor actually came for.
 */
export function AgentProfileHeader({ agent }: AgentProfileHeaderProps) {
  return (
    <div className="border-b border-line px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <span className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-patina font-mono text-lg font-bold text-white">
            {agent.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
          </span>
          <div>
            <h1 className="font-display text-2xl text-ink">{agent.name}</h1>
            <p className="mt-0.5 text-sm text-ink-soft">{agent.title}</p>
            <div className="mt-3">
              <VerificationDisclosure state={agent.verificationState} detail={agent.verificationDetail} />
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">Message</Button>
          <Button>Contact</Button>
        </div>
      </div>

      <dl className="mx-auto mt-8 grid max-w-4xl grid-cols-3 gap-6 border-t border-line pt-6 sm:max-w-xs sm:grid-cols-3">
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-bark">Listings</dt>
          <dd className="mt-1 font-display text-xl tabular-nums text-ink">{agent.activeListings}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-bark">Response</dt>
          <dd className="mt-1 font-display text-xl tabular-nums text-ink">{agent.responseRate}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase tracking-wider text-bark">Member since</dt>
          <dd className="mt-1 font-display text-xl text-ink">{agent.memberSince}</dd>
        </div>
      </dl>

      <p className="mx-auto mt-6 max-w-2xl text-sm text-ink-soft">{agent.bio}</p>
    </div>
  );
}
