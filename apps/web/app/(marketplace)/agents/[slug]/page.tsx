import { notFound } from "next/navigation";
import { getAgentBySlug, getPropertiesByAgentSlug } from "@/lib/mock-data";
import { AgentProfileHeader } from "@/components/agent/AgentProfileHeader";
import { PropertyGrid } from "@/components/marketplace/PropertyGrid";

export default function AgentProfilePage({ params }: { params: { slug: string } }) {
  const agent = getAgentBySlug(params.slug);
  if (!agent) notFound();

  const listings = getPropertiesByAgentSlug(agent.slug);

  return (
    <main>
      <AgentProfileHeader agent={agent} />
      <section className="px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-2xl text-ink">
            {agent.role === "agent" ? "Listings" : "Properties"} ({listings.length})
          </h2>
          <div className="mt-8">
            <PropertyGrid properties={listings} emptyMessage="No active listings right now." />
          </div>
        </div>
      </section>
    </main>
  );
}
