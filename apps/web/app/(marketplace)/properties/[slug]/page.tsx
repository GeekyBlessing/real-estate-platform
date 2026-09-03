import { notFound } from "next/navigation";
import { getPropertyBySlug, getAgentBySlug } from "@/lib/mock-data";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyActions } from "@/components/property/PropertyActions";
import { ReportListingLink } from "@/components/property/ReportListingLink";
import { VerificationDisclosure } from "@/components/verification/VerificationDisclosure";
import { AgentCard } from "@/components/agent/AgentCard";
import { formatNaira } from "@/lib/utils";

/**
 * Reading order per Section 11 of the blueprint: what is this, where
 * is it, how much, is it verified, who listed it, what are the
 * features, what can I do next. Contact, Message, and Request
 * inspection stay visible inline on desktop and as a sticky bar on
 * mobile, never behind a menu.
 */
export default function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const property = getPropertyBySlug(params.slug);
  if (!property) notFound();

  const agent = getAgentBySlug(property.agentSlug);
  const priceLabel =
    property.listingType === "sale"
      ? `${formatNaira(property.priceInKobo)}, for sale`
      : `${formatNaira(property.priceInKobo)}, per ${property.rentPeriod === "month" ? "month" : "year"}`;

  return (
    <main className="pb-24 lg:pb-0">
      <div className="px-6 pt-8">
        <div className="mx-auto max-w-5xl">
          <PropertyGallery title={property.title} baseVariant={property.mediaVariant} imageCount={property.imageCount} />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="font-display text-3xl text-ink">{priceLabel}</p>
            <h1 className="mt-2 text-xl font-semibold text-ink">{property.title}</h1>
            <p className="mt-1 text-sm text-ink-soft">{property.locationLabel}</p>

            <div className="mt-5 flex gap-6 border-y border-line py-4 text-sm text-ink-soft">
              <span><strong className="text-ink">{property.bedrooms ?? "N/A"}</strong> beds</span>
              <span><strong className="text-ink">{property.bathrooms}</strong> baths</span>
              <span><strong className="text-ink">{property.sizeSqm}</strong> sqm</span>
              <span className="text-clay">{property.furnishingStatus}</span>
            </div>

            <div className="mt-6">
              <VerificationDisclosure state={property.verificationState} detail={property.verificationDetail} />
            </div>

            <div className="mt-6 hidden lg:block">
              <PropertyActions propertyTitle={property.title} />
            </div>

            <section className="mt-10">
              <h2 className="text-sm font-semibold text-ink">About this property</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{property.description}</p>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-semibold text-ink">Amenities</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-ink-soft sm:grid-cols-3">
                {property.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-bark" aria-hidden="true" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-semibold text-ink">Availability</h2>
              <p className="mt-2 text-sm text-ink-soft">{property.availability}</p>
            </section>

            <div className="mt-10 border-t border-line pt-6">
              <ReportListingLink />
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            {agent && <AgentCard agent={agent} />}
          </aside>
        </div>
      </div>

      <PropertyActions propertyTitle={property.title} layout="sticky-mobile" />
    </main>
  );
}
