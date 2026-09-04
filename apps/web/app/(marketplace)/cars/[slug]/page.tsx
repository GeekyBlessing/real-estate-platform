import { notFound } from "next/navigation";
import { getVehicleBySlug } from "@/lib/vehicles";
import { getAgentBySlug } from "@/lib/mock-data";
import { VehicleGallery } from "@/components/vehicle/VehicleGallery";
import { VehicleActions } from "@/components/vehicle/VehicleActions";
import { ReportListingLink } from "@/components/property/ReportListingLink";
import { VerificationDisclosure } from "@/components/verification/VerificationDisclosure";
import { AgentCard } from "@/components/agent/AgentCard";
import { formatNaira, formatMileage } from "@/lib/utils";

/**
 * The vehicle equivalent of app/(marketplace)/properties/[slug]/page.tsx.
 * Same overall shape (gallery, price, verification, seller, actions),
 * but its own specification block in place of bedrooms and amenities,
 * matching the vehicle detail spec: what a buyer needs to evaluate a
 * car is not what they need to evaluate a property.
 */
export default function VehicleDetailPage({ params }: { params: { slug: string } }) {
  const vehicle = getVehicleBySlug(params.slug);
  if (!vehicle) notFound();

  const seller = getAgentBySlug(vehicle.listedBy.slug);

  return (
    <main className="pb-24 lg:pb-0">
      <div className="px-6 pt-8">
        <div className="mx-auto max-w-5xl">
          <VehicleGallery title={vehicle.title} baseVariant={vehicle.mediaVariant} imageCount={vehicle.imageCount} />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="font-display text-3xl text-ink">{formatNaira(vehicle.priceInKobo)}</p>
            <h1 className="mt-2 text-xl font-semibold text-ink">{vehicle.title}</h1>
            <p className="mt-1 text-sm text-ink-soft">{vehicle.location.label}</p>

            <div className="mt-5 flex flex-wrap gap-6 border-y border-line py-4 text-sm text-ink-soft">
              <span><strong className="text-ink">{formatMileage(vehicle.mileageKm)}</strong></span>
              <span className="capitalize"><strong className="text-ink">{vehicle.transmission}</strong></span>
              <span><strong className="text-ink">{vehicle.fuelType}</strong></span>
              <span><strong className="text-ink">{vehicle.bodyType}</strong></span>
              <span className="capitalize text-clay">{vehicle.condition}</span>
            </div>

            <div className="mt-6">
              <VerificationDisclosure state={vehicle.verificationState} detail={vehicle.verificationDetail} />
            </div>

            <div className="mt-6 hidden lg:block">
              <VehicleActions vehicleTitle={vehicle.title} />
            </div>

            <section className="mt-10">
              <h2 className="text-sm font-semibold text-ink">About this vehicle</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{vehicle.description}</p>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-semibold text-ink">Features</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-ink-soft sm:grid-cols-3">
                {vehicle.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-bark" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-semibold text-ink">Vehicle specifications</h2>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-ink-soft">Make</dt>
                  <dd className="text-ink">{vehicle.make}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-soft">Model</dt>
                  <dd className="text-ink">{vehicle.model}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-soft">Year</dt>
                  <dd className="text-ink">{vehicle.year}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-soft">Condition</dt>
                  <dd className="capitalize text-ink">{vehicle.condition}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-soft">Body type</dt>
                  <dd className="text-ink">{vehicle.bodyType}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-soft">Fuel type</dt>
                  <dd className="text-ink">{vehicle.fuelType}</dd>
                </div>
              </dl>
            </section>

            <div className="mt-10 border-t border-line pt-6">
              <ReportListingLink />
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            {seller && <AgentCard agent={seller} />}
          </aside>
        </div>
      </div>

      <VehicleActions vehicleTitle={vehicle.title} layout="sticky-mobile" />
    </main>
  );
}
