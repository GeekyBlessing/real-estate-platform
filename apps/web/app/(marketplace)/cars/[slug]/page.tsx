import { notFound } from "next/navigation";
import { getVehicleBySlug, vehicles } from "@/lib/vehicles";
import { getAgentBySlug } from "@/lib/mock-data";
import { VehicleGallery } from "@/components/vehicle/VehicleGallery";
import { VehicleActions } from "@/components/vehicle/VehicleActions";
import { VehicleCard } from "@/components/vehicle/VehicleCard";
import { ReportListingLink } from "@/components/property/ReportListingLink";
import { VerificationBadge } from "@/components/ui/Badge";
import { VerificationSection } from "@/components/marketplace/VerificationSection";
import { LocationPreview } from "@/components/marketplace/LocationPreview";
import { DiscoveryRail } from "@/components/marketplace/DiscoveryRail";
import { SpecChips } from "@/components/marketplace/SpecChips";
import { FeatureChips } from "@/components/marketplace/FeatureChips";
import { ReadMoreText } from "@/components/ui/ReadMoreText";
import { AgentCard } from "@/components/agent/AgentCard";
import { formatNaira, formatMileage } from "@/lib/utils";

/**
 * The vehicle equivalent of app/(marketplace)/properties/[slug]/page.tsx.
 * Same overall reading order (gallery, price, verification, story,
 * trust, seller, similar, actions), with a specification block in
 * place of bedrooms and amenities, matching what a car buyer actually
 * needs to evaluate a listing.
 */
export default function VehicleDetailPage({ params }: { params: { slug: string } }) {
  const vehicle = getVehicleBySlug(params.slug);
  if (!vehicle) notFound();

  const seller = getAgentBySlug(vehicle.listedBy.slug);
  const similar = vehicles.filter((item) => item.slug !== vehicle.slug && item.bodyType === vehicle.bodyType).slice(0, 6);

  return (
    <main className="pb-40 md:pb-24 lg:pb-10">
      <VehicleGallery title={vehicle.title} slug={vehicle.slug} images={vehicle.images} />

      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-8">
            <div>
              <div className="flex items-start justify-between gap-3">
                <p className="text-price-lg font-bold text-ink">{formatNaira(vehicle.priceInKobo)}</p>
                <VerificationBadge state={vehicle.verificationState} className="mt-1" />
              </div>
              <h1 className="mt-1 text-h1 font-semibold text-ink">{vehicle.title}</h1>
              <p className="mt-1 text-body text-ink-soft">{vehicle.location.label}</p>

              <div className="mt-4">
                <SpecChips
                  items={[formatMileage(vehicle.mileageKm), vehicle.transmission === "automatic" ? "Automatic" : "Manual", vehicle.fuelType, vehicle.bodyType]}
                />
              </div>

              <div className="mt-5 hidden lg:block">
                <VehicleActions vehicleTitle={vehicle.title} vehicleSlug={vehicle.slug} />
              </div>
            </div>

            <section>
              <h2 className="text-h3 font-semibold text-ink">About this car</h2>
              <div className="mt-2">
                <ReadMoreText text={vehicle.description} />
              </div>
            </section>

            <section>
              <h2 className="text-h3 font-semibold text-ink">Vehicle details</h2>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  ["Make", vehicle.make],
                  ["Model", vehicle.model],
                  ["Year", String(vehicle.year)],
                  ["Condition", vehicle.condition === "brand new" ? "Brand new" : vehicle.condition === "foreign used" ? "Foreign used" : "Nigerian used"],
                  ["Transmission", vehicle.transmission === "automatic" ? "Automatic" : "Manual"],
                  ["Fuel", vehicle.fuelType],
                  ["Mileage", formatMileage(vehicle.mileageKm)],
                  ["Body", vehicle.bodyType],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-line pb-3">
                    <dt className="text-caption text-ink-soft">{label}</dt>
                    <dd className="mt-0.5 text-body font-semibold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <h2 className="text-h3 font-semibold text-ink">Features</h2>
              <div className="mt-3">
                <FeatureChips items={vehicle.features} />
              </div>
            </section>

            <section className="lg:hidden">
              <h2 className="text-h3 font-semibold text-ink">Seller</h2>
              <div className="mt-3">{seller && <AgentCard agent={seller} />}</div>
            </section>

            <VerificationSection state={vehicle.verificationState} detail={vehicle.verificationDetail} category="vehicle" />

            <LocationPreview areaLabel={vehicle.location.label} />

            <div className="border-t border-line pt-5">
              <ReportListingLink />
            </div>
          </div>

          <aside className="hidden flex-col gap-4 lg:flex">{seller && <AgentCard agent={seller} />}</aside>
        </div>

        {similar.length > 0 && (
          <div className="mt-12">
            <DiscoveryRail
              title="Similar cars"
              items={similar}
              keyFor={(item) => item.slug}
              renderItem={(item) => <VehicleCard vehicle={item} />}
            />
          </div>
        )}
      </div>

      <VehicleActions vehicleTitle={vehicle.title} vehicleSlug={vehicle.slug} layout="sticky-mobile" />
    </main>
  );
}
