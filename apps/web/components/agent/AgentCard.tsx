import Link from "next/link";
import { VerificationBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Agent } from "@/lib/mock-data";

export interface AgentCardProps {
  agent: Agent;
}

/**
 * The premium seller identity block the detail page spec asks for:
 * a real presence in the layout (its own bordered card with room to
 * breathe), not a small generic card floating in a sidebar's empty
 * space. `title` already carries role and area together ("Senior
 * agent, Lekki and Ikoyi"), so it doubles as the seller's location
 * line without a separate field.
 */
export function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="rounded border border-line bg-parchment p-5">
      <div className="flex items-center gap-4">
        <Avatar name={agent.name} size="lg" />
        <div className="min-w-0">
          <Link href={`/agents/${agent.slug}`} className="block truncate text-h3 font-semibold text-ink hover:underline">
            {agent.name}
          </Link>
          <p className="truncate text-body-sm text-ink-soft">{agent.title}</p>
        </div>
      </div>

      <div className="mt-3">
        <VerificationBadge state={agent.verificationState} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
        <div>
          <dt className="text-caption text-ink-soft">Active listings</dt>
          <dd className="mt-0.5 text-h3 font-semibold tabular-nums text-ink">{agent.activeListings}</dd>
        </div>
        <div>
          <dt className="text-caption text-ink-soft">Usually responds</dt>
          <dd className="mt-0.5 text-body-sm font-semibold text-ink">{agent.responseRate}</dd>
        </div>
      </dl>

      <Link
        href={`/agents/${agent.slug}`}
        className="mt-4 flex h-10 w-full items-center justify-center rounded-sm border border-line-strong text-body-sm font-semibold text-ink transition-colors hover:border-ink hover:bg-paper-deep active:bg-paper-deep"
      >
        View profile
      </Link>
    </div>
  );
}
