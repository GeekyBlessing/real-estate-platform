import { notFound } from "next/navigation";
import { getAgentBySlug, getPropertiesByAgentSlug } from "@/lib/mock-data";
import { getVehiclesBySellerSlug } from "@/lib/vehicles";
import { AgentProfileHeader } from "@/components/agent/AgentProfileHeader";
import { PropertyGrid } from "@/components/marketplace/PropertyGrid";
import { VehicleGrid } from "@/components/marketplace/VehicleGrid";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * One profile page for anyone who lists something, whether that is a
 * property agent, a landlord, a car dealer, or a private seller. The
 * page shows whichever of the two listing grids that person actually
 * has content in; a property agent with no vehicles never sees an
 * empty Vehicles section, and a car dealer never sees an empty
 * Properties one.
 */
export default function AgentProfilePage({ params }: { params: { slug: string } }) {
  const agent = getAgentBySlug(params.slug);
  if (!agent) notFound();

  const properties = getPropertiesByAgentSlug(agent.slug);
  const vehicles = getVehiclesBySellerSlug(agent.slug);

  return (
    <main>
      <AgentProfileHeader agent={agent} />
      <section className="px-6 py-12">
        <div className="mx-auto max-w-4xl">
          {properties.length > 0 && (
            <div>
              <h2 className="font-display text-2xl text-ink">Property listings ({properties.length})</h2>
              <div className="mt-8">
                <PropertyGrid properties={properties} emptyMessage="No active property listings right now." />
              </div>
            </div>
          )}

          {vehicles.length > 0 && (
            <div className={properties.length > 0 ? "mt-14" : undefined}>
              <h2 className="font-display text-2xl text-ink">Vehicle listings ({vehicles.length})</h2>
              <div className="mt-8">
                <VehicleGrid vehicles={vehicles} emptyMessage="No active vehicle listings right now." />
              </div>
            </div>
          )}

          {properties.length === 0 && vehicles.length === 0 && (
            <EmptyState title="No active listings" description="This profile does not have any active listings right now." />
          )}
        </div>
      </section>
    </main>
  );
}
