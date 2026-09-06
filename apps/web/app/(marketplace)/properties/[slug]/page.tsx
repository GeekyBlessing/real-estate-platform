import { notFound } from "next/navigation";
import { getPropertyBySlug, getAgentBySlug, properties } from "@/lib/mock-data";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyActions } from "@/components/property/PropertyActions";
import { PropertyCard } from "@/components/property/PropertyCard";
import { ReportListingLink } from "@/components/property/ReportListingLink";
import { VerificationBadge } from "@/components/ui/Badge";
import { VerificationSection } from "@/components/marketplace/VerificationSection";
import { LocationPreview } from "@/components/marketplace/LocationPreview";
import { DiscoveryRail } from "@/components/marketplace/DiscoveryRail";
import { FeatureChips } from "@/components/marketplace/FeatureChips";
import { ReadMoreText } from "@/components/ui/ReadMoreText";
import { AgentCard } from "@/components/agent/AgentCard";
import { formatNaira } from "@/lib/utils";

/**
 * Reading order per the product spec: what is this, where is it, how
 * much, is it verified, what's it like, is it trustworthy, who listed
 * it, what do residents say, what else is like it, what can I do
 * next. Message and Request inspection stay visible inline on desktop
 * and as a sticky bar on mobile, never behind a menu.
 */
export default function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const property = getPropertyBySlug(params.slug);
  if (!property) notFound();

  const agent = getAgentBySlug(property.listedBy.slug);
  const priceLabel =
    property.listingType === "sale"
      ? formatNaira(property.priceInKobo)
      : `${formatNaira(property.priceInKobo)} / ${property.rentPeriod === "month" ? "month" : "year"}`;

  const similar = properties
    .filter((item) => item.slug !== property.slug && item.propertyType === property.propertyType)
    .slice(0, 6);

  return (
    <main className="pb-40 md:pb-24 lg:pb-10">
      <PropertyGallery title={property.title} slug={property.slug} images={property.images} />

      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-8">
            <div>
              <div className="flex items-start justify-between gap-3">
                <p className="text-price-lg font-bold text-ink">{priceLabel}</p>
                <VerificationBadge state={property.verificationState} className="mt-1" />
              </div>
              <h1 className="mt-1 text-h1 font-semibold text-ink">{property.title}</h1>
              <p className="mt-1 text-body text-ink-soft">{property.location.label}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-body-sm">
                <span className="rounded-full border border-line-strong bg-parchment px-3 py-1.5 font-semibold text-ink">
                  {property.bedrooms ?? "N/A"} beds
                </span>
                <span className="rounded-full border border-line-strong bg-parchment px-3 py-1.5 font-semibold text-ink">
                  {property.bathrooms} baths
                </span>
                <span className="rounded-full border border-line-strong bg-parchment px-3 py-1.5 font-semibold text-ink">
                  {property.sizeSqm} sqm
                </span>
                <span className="rounded-full border border-line-strong bg-parchment px-3 py-1.5 font-semibold text-ink-soft">
                  {property.furnishingStatus}
                </span>
              </div>

              <div className="mt-5 hidden lg:block">
                <PropertyActions propertyTitle={property.title} propertySlug={property.slug} />
              </div>
            </div>

            <section>
              <h2 className="text-h3 font-semibold text-ink">About this property</h2>
              <div className="mt-2">
                <ReadMoreText text={property.description} />
              </div>
            </section>

            <section>
              <h2 className="text-h3 font-semibold text-ink">Amenities</h2>
              <div className="mt-3">
                <FeatureChips items={property.amenities} />
              </div>
            </section>

            <VerificationSection state={property.verificationState} detail={property.verificationDetail} category="property" />

            <LocationPreview areaLabel={property.location.label} />

            <section className="lg:hidden">
              <h2 className="text-h3 font-semibold text-ink">Agent</h2>
              <div className="mt-3">{agent && <AgentCard agent={agent} />}</div>
            </section>

            <section>
              <h2 className="text-h3 font-semibold text-ink">Resident insights</h2>
              <p className="mt-2 rounded border border-line bg-paper-deep px-4 py-3 text-body-sm text-ink-soft">
                Not enough resident feedback yet.
              </p>
            </section>

            <div className="border-t border-line pt-5">
              <ReportListingLink />
            </div>
          </div>

          <aside className="hidden flex-col gap-4 lg:flex">{agent && <AgentCard agent={agent} />}</aside>
        </div>

        {similar.length > 0 && (
          <div className="mt-12">
            <DiscoveryRail
              title="Similar properties"
              items={similar}
              keyFor={(item) => item.slug}
              renderItem={(item) => <PropertyCard property={item} />}
            />
          </div>
        )}
      </div>

      <PropertyActions propertyTitle={property.title} propertySlug={property.slug} layout="sticky-mobile" />
    </main>
  );
}
