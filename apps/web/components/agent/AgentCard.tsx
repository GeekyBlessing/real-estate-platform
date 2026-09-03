import Link from "next/link";
import { VerificationBadge } from "@/components/ui/Badge";
import { Agent } from "@/lib/mock-data";

export interface AgentCardProps {
  agent: Agent;
}

/** Compact identity card for the property detail sidebar. */
export function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="rounded border border-line bg-parchment p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-patina font-mono text-sm font-bold text-white">
          {agent.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
        </span>
        <div>
          <Link href={`/agents/${agent.slug}`} className="text-sm font-semibold text-ink hover:underline">
            {agent.name}
          </Link>
          <p className="text-xs text-ink-soft">{agent.title}</p>
        </div>
      </div>
      <div className="mt-3">
        <VerificationBadge state={agent.verificationState} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-xs">
        <div>
          <dt className="text-ink-soft">Active listings</dt>
          <dd className="mt-0.5 font-semibold text-ink tabular-nums">{agent.activeListings}</dd>
        </div>
        <div>
          <dt className="text-ink-soft">Response rate</dt>
          <dd className="mt-0.5 font-semibold text-ink tabular-nums">{agent.responseRate}</dd>
        </div>
      </dl>
    </div>
  );
}
