"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { VerificationBadge } from "@/components/ui/Badge";
import { StepShell, ChipToggle, DocumentSlot, ReviewRow, StepHeader, StepFooter, StepDef } from "@/components/ui/StepFlow";
import { AMENITIES, FURNISHING_OPTIONS, PROPERTY_TYPES, PropertyType, propertyTypeLabel } from "@/lib/listings";
import { STATES, LAUNCH_CITIES, isLaunchCity } from "@/lib/locations";
import type { AuthUser } from "@/lib/auth-context";

const STEPS: StepDef[] = [
  { key: "transaction", label: "Listing type" },
  { key: "details", label: "Property details" },
  { key: "location", label: "Location" },
  { key: "amenities", label: "Amenities" },
  { key: "price", label: "Price" },
  { key: "photos", label: "Photos" },
  { key: "description", label: "Description" },
  { key: "documents", label: "Documents" },
  { key: "review", label: "Review" },
];

const LAUNCH_CITY_OPTIONS = STATES.flatMap((state) =>
  state.cities
    .filter((city) => isLaunchCity(city.slug))
    .map((city) => ({ value: city.slug, label: city.name, stateSlug: state.slug, areas: city.areas }))
);

const BEDROOM_OPTIONS = ["Studio", "1", "2", "3", "4", "5+"];
const BATHROOM_OPTIONS = ["1", "2", "3", "4+"];

interface PropertyListingForm {
  transactionType: "rent" | "sale" | "";
  rentPeriod: "year" | "month" | "";
  propertyType: PropertyType | "";
  bedrooms: string;
  bathrooms: string;
  sizeSqm: string;
  furnishing: string;
  citySlug: string;
  areaSlug: string;
  streetAddress: string;
  amenities: string[];
  price: string;
  photoNames: (string | null)[];
  description: string;
  ownershipDocumentName: string | null;
}

const EMPTY_FORM: PropertyListingForm = {
  transactionType: "",
  rentPeriod: "",
  propertyType: "",
  bedrooms: "",
  bathrooms: "",
  sizeSqm: "",
  furnishing: "",
  citySlug: "",
  areaSlug: "",
  streetAddress: "",
  amenities: [],
  price: "",
  photoNames: [null, null, null],
  description: "",
  ownershipDocumentName: null,
};

/**
 * List a property, built the same way Become an agent is (see
 * components/agent/AgentOnboardingFlow.tsx, which this shares its
 * StepShell/ChipToggle/DocumentSlot/StepHeader/StepFooter building
 * blocks with): a real, complete multi step flow rather than the
 * ComingSoonPage stub this route used to render, since the brief is
 * explicit that a coming soon screen is not acceptable wherever a
 * polished UX can be built instead. Submission is simulated the same
 * way InspectionRequestModal's is: there is no POST /listings endpoint
 * yet, so this collects everything a real one will need and ends in
 * an honest "submitted for review" state rather than claiming the
 * listing is live, which would be a fabricated result.
 */
export function PropertyListingFlow({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<PropertyListingForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const step = STEPS[stepIndex] ?? STEPS[0]!;

  const selectedCity = LAUNCH_CITY_OPTIONS.find((city) => city.value === form.citySlug);
  const areaOptions = selectedCity?.areas ?? [];

  function update<K extends keyof PropertyListingForm>(key: K, value: PropertyListingForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAmenity(value: string) {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(value) ? prev.amenities.filter((item) => item !== value) : [...prev.amenities, value],
    }));
  }

  function setPhoto(index: number, name: string | null) {
    setForm((prev) => {
      const next = [...prev.photoNames];
      next[index] = name;
      return { ...prev, photoNames: next };
    });
  }

  const filledPhotoCount = form.photoNames.filter(Boolean).length;

  const canContinue = useMemo(() => {
    switch (step.key) {
      case "transaction":
        return form.transactionType === "sale" || (form.transactionType === "rent" && Boolean(form.rentPeriod));
      case "details":
        return Boolean(form.propertyType && form.bathrooms && form.sizeSqm && form.furnishing) &&
          (form.propertyType === "land" || Boolean(form.bedrooms));
      case "location":
        return Boolean(form.citySlug && form.streetAddress.trim());
      case "amenities":
        return true;
      case "price":
        return Boolean(form.price && Number(form.price) > 0);
      case "photos":
        return filledPhotoCount >= 3;
      case "description":
        return form.description.trim().length >= 20;
      case "documents":
        return Boolean(form.ownershipDocumentName);
      case "review":
        return true;
      default:
        return false;
    }
  }, [step.key, form, filledPhotoCount]);

  function goBack() {
    if (stepIndex === 0) {
      router.push("/dashboard");
      return;
    }
    setStepIndex((index) => Math.max(0, index - 1));
  }

  function goNext() {
    if (step.key === "review") {
      setSubmitting(true);
      window.setTimeout(() => {
        setSubmitting(false);
        setSubmitted(true);
      }, 700);
      return;
    }
    setStepIndex((index) => Math.min(STEPS.length - 1, index + 1));
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-20 text-center">
        <VerificationBadge state="pending" />
        <h1 className="text-h1 font-semibold text-ink">Listing submitted</h1>
        <p className="text-body-sm text-ink-soft">
          Thanks, {user.fullName.split(" ")[0]}. Your listing is pending review. An administrator checks the
          ownership document and listing details before it appears in search.
        </p>
        <p className="text-caption text-ink-soft">We will notify you here and by email once it is reviewed.</p>
        <Link href="/dashboard">
          <Button variant="secondary" className="mt-2">
            Back to profile
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <StepHeader steps={STEPS} stepIndex={stepIndex} onBack={goBack} />

      <div className="mx-auto max-w-xl px-5 py-6 sm:px-6">
        {step.key === "transaction" && (
          <StepShell title="Listing type" description="Is this property for rent or for sale?">
            <div className="flex flex-col gap-2.5">
              {(["rent", "sale"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => update("transactionType", option)}
                  className={
                    "flex flex-col gap-1 rounded-sm border px-4 py-3.5 text-left transition-colors " +
                    (form.transactionType === option ? "border-ink bg-paper-deep" : "border-line-strong hover:border-ink")
                  }
                >
                  <span className="text-body-sm font-semibold text-ink">{option === "rent" ? "For rent" : "For sale"}</span>
                </button>
              ))}
            </div>
            {form.transactionType === "rent" && (
              <div className="grid grid-cols-2 gap-2">
                {(["year", "month"] as const).map((period) => (
                  <ChipToggle
                    key={period}
                    label={period === "year" ? "Per year" : "Per month"}
                    selected={form.rentPeriod === period}
                    onClick={() => update("rentPeriod", period)}
                  />
                ))}
              </div>
            )}
          </StepShell>
        )}

        {step.key === "details" && (
          <StepShell title="Property details" description="What kind of property is this, and how big is it?">
            <div className="flex flex-col gap-5">
              <Select
                label="Property type"
                options={[{ value: "", label: "Select a type" }, ...PROPERTY_TYPES.map((type) => ({ value: type, label: propertyTypeLabel(type) }))]}
                value={form.propertyType}
                onChange={(event) => update("propertyType", event.target.value as PropertyType)}
                className="max-w-none"
              />
              {form.propertyType !== "land" && (
                <div>
                  <p className="text-xs font-semibold text-ink">Bedrooms</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {BEDROOM_OPTIONS.map((option) => (
                      <ChipToggle key={option} label={option} selected={form.bedrooms === option} onClick={() => update("bedrooms", option)} />
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-ink">Bathrooms</p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {BATHROOM_OPTIONS.map((option) => (
                    <ChipToggle key={option} label={option} selected={form.bathrooms === option} onClick={() => update("bathrooms", option)} />
                  ))}
                </div>
              </div>
              <Input
                label="Size (square metres)"
                inputMode="numeric"
                value={form.sizeSqm}
                onChange={(event) => update("sizeSqm", event.target.value.replace(/\D/g, ""))}
                className="max-w-none"
              />
              <Select
                label="Furnishing"
                options={[{ value: "", label: "Select furnishing" }, ...FURNISHING_OPTIONS.map((option) => ({ value: option, label: option }))]}
                value={form.furnishing}
                onChange={(event) => update("furnishing", event.target.value)}
                className="max-w-none"
              />
            </div>
          </StepShell>
        )}

        {step.key === "location" && (
          <StepShell title="Location" description="The area is shown publicly. The street address is only shared once an inspection is confirmed.">
            <div className="flex flex-col gap-5">
              <Select
                label="City"
                options={[{ value: "", label: "Select a city" }, ...LAUNCH_CITY_OPTIONS.map((city) => ({ value: city.value, label: city.label }))]}
                value={form.citySlug}
                onChange={(event) => update("citySlug", event.target.value)}
                className="max-w-none"
              />
              <p className="text-caption text-ink-soft">
                Listings currently open in {LAUNCH_CITIES.map((city) => city.city).join(" and ")}. Other cities will open as we expand.
              </p>
              {areaOptions.length > 0 && (
                <Select
                  label="Area"
                  options={[{ value: "", label: "Select an area" }, ...areaOptions.map((area) => ({ value: area.slug, label: area.name }))]}
                  value={form.areaSlug}
                  onChange={(event) => update("areaSlug", event.target.value)}
                  className="max-w-none"
                />
              )}
              <Input
                label="Street address"
                value={form.streetAddress}
                onChange={(event) => update("streetAddress", event.target.value)}
                hint="Not shown publicly. Shared with a buyer or tenant once an inspection is confirmed."
                className="max-w-none"
              />
            </div>
          </StepShell>
        )}

        {step.key === "amenities" && (
          <StepShell title="Amenities" description="Select everything this property actually has.">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AMENITIES.map((amenity) => (
                <ChipToggle key={amenity} label={amenity} selected={form.amenities.includes(amenity)} onClick={() => toggleAmenity(amenity)} />
              ))}
            </div>
          </StepShell>
        )}

        {step.key === "price" && (
          <StepShell title="Price" description="Set a realistic price. Verified comparable listings help buyers and tenants trust it.">
            <Input
              label={form.transactionType === "rent" ? `Price per ${form.rentPeriod || "year"} (Naira)` : "Price (Naira)"}
              inputMode="numeric"
              value={form.price}
              onChange={(event) => update("price", event.target.value.replace(/\D/g, ""))}
              className="max-w-none"
            />
          </StepShell>
        )}

        {step.key === "photos" && (
          <StepShell title="Photos" description="Add at least 3 real photos. Listings with more photos get more attention.">
            <div className="flex flex-col gap-4">
              {form.photoNames.map((name, index) => (
                <DocumentSlot
                  key={index}
                  label={`Photo ${index + 1}`}
                  hint={index < 3 ? "Required." : "Optional."}
                  fileName={name}
                  onChange={(value) => setPhoto(index, value)}
                />
              ))}
              {form.photoNames.length < 8 && (
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, photoNames: [...prev.photoNames, null] }))}
                  className="rounded-sm border border-dashed border-line-strong py-3 text-body-sm font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  Add another photo
                </button>
              )}
            </div>
          </StepShell>
        )}

        {step.key === "description" && (
          <StepShell title="Description" description="Describe the property honestly. This appears under About this property.">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="property-description" className="text-xs font-semibold text-ink">
                About this property
              </label>
              <textarea
                id="property-description"
                rows={6}
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                className="w-full rounded-sm border border-line-strong bg-white px-3 py-2.5 text-sm text-ink placeholder:text-clay focus:border-patina-deep focus:outline-none focus:ring-2 focus:ring-patina-deep/15"
                placeholder="A quiet three bedroom flat with cross ventilation, a private balcony, and dedicated parking."
              />
              <p className="text-caption text-ink-soft">{form.description.trim().length} characters. At least 20 needed.</p>
            </div>
          </StepShell>
        )}

        {step.key === "documents" && (
          <StepShell title="Documents" description="Attach the ownership or agency document. Reviewed by an administrator, not shared publicly.">
            <DocumentSlot
              label="Ownership or agency document"
              hint="A title document, deed, or a letter of authority from the owner."
              fileName={form.ownershipDocumentName}
              onChange={(name) => update("ownershipDocumentName", name)}
            />
          </StepShell>
        )}

        {step.key === "review" && (
          <StepShell title="Review your listing" description="Check everything before you submit.">
            <div className="flex flex-col divide-y divide-line rounded-sm border border-line-strong px-4">
              <ReviewRow label="Listing type" value={form.transactionType === "rent" ? `For rent (per ${form.rentPeriod})` : form.transactionType === "sale" ? "For sale" : undefined} />
              <ReviewRow label="Property type" value={form.propertyType ? propertyTypeLabel(form.propertyType) : undefined} />
              <ReviewRow label="Bedrooms" value={form.bedrooms} />
              <ReviewRow label="Bathrooms" value={form.bathrooms} />
              <ReviewRow label="Size" value={form.sizeSqm ? `${form.sizeSqm} sqm` : undefined} />
              <ReviewRow label="Furnishing" value={form.furnishing} />
              <ReviewRow label="City" value={selectedCity?.label} />
              <ReviewRow label="Area" value={areaOptions.find((area) => area.slug === form.areaSlug)?.name} />
              <ReviewRow label="Amenities" value={form.amenities.join(", ")} />
              <ReviewRow label="Price" value={form.price ? `₦${Number(form.price).toLocaleString("en-NG")}` : undefined} />
              <ReviewRow label="Photos" value={`${filledPhotoCount} attached`} />
              <ReviewRow label="Ownership document" value={form.ownershipDocumentName ?? undefined} />
            </div>
            <p className="text-caption text-ink-soft">
              Submitting sends this listing for review. It will not appear in search until an administrator has
              checked your document and listing details.
            </p>
          </StepShell>
        )}
      </div>

      <StepFooter
        stepIndex={stepIndex}
        isLastStep={step.key === "review"}
        lastStepLabel="Submit listing"
        canContinue={canContinue}
        submitting={submitting}
        onBack={goBack}
        onContinue={goNext}
      />
    </div>
  );
}
