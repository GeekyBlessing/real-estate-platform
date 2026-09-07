"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { VerificationBadge } from "@/components/ui/Badge";
import { MediaUploader } from "@/components/ui/MediaUploader";
import { StepShell, ChipToggle, DocumentSlot, ReviewRow, StepHeader, StepFooter, StepDef } from "@/components/ui/StepFlow";
import {
  VEHICLE_MAKES,
  VEHICLE_MODELS_BY_MAKE,
  VEHICLE_BODY_TYPES,
  VEHICLE_CONDITIONS,
  VEHICLE_TRANSMISSIONS,
  VEHICLE_FUEL_TYPES,
} from "@/lib/vehicles";
import { STATES, LAUNCH_CITIES, isLaunchCity } from "@/lib/locations";
import type { AuthUser } from "@/lib/auth-context";

const STEPS: StepDef[] = [
  { key: "vehicle", label: "Vehicle" },
  { key: "specifications", label: "Specifications" },
  { key: "location", label: "Location" },
  { key: "features", label: "Features" },
  { key: "price", label: "Price" },
  { key: "photos", label: "Photos" },
  { key: "description", label: "Description" },
  { key: "documents", label: "Documents" },
  { key: "review", label: "Review" },
];

const LAUNCH_CITY_OPTIONS = STATES.flatMap((state) =>
  state.cities.filter((city) => isLaunchCity(city.slug)).map((city) => ({ value: city.slug, label: city.name }))
);

const FEATURES = ["Leather seats", "Reverse camera", "Alloy wheels", "Keyless entry", "Sunroof", "Navigation system"];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 25 }, (_, index) => String(currentYear - index));

interface SellCarForm {
  make: string;
  model: string;
  year: string;
  bodyType: string;
  condition: string;
  transmission: string;
  fuelType: string;
  mileageKm: string;
  citySlug: string;
  features: string[];
  price: string;
  description: string;
  ownershipDocumentName: string | null;
}

const EMPTY_FORM: SellCarForm = {
  make: "",
  model: "",
  year: "",
  bodyType: "",
  condition: "",
  transmission: "",
  fuelType: "",
  mileageKm: "",
  citySlug: "",
  features: [],
  price: "",
  description: "",
  ownershipDocumentName: null,
};

/**
 * The vehicle equivalent of components/listings/PropertyListingFlow.tsx,
 * built on the same StepFlow primitives Become an agent introduced.
 * Same honesty rule as the other two flows: no POST /vehicles endpoint
 * exists yet, so this ends in a real "submitted for review" state
 * instead of pretending the car is live in search.
 */
export function SellACarFlow({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<SellCarForm>(EMPTY_FORM);
  const [photoCount, setPhotoCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const step = STEPS[stepIndex] ?? STEPS[0]!;
  const modelOptions = form.make ? VEHICLE_MODELS_BY_MAKE[form.make] ?? [] : [];

  function update<K extends keyof SellCarForm>(key: K, value: SellCarForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleFeature(value: string) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(value) ? prev.features.filter((item) => item !== value) : [...prev.features, value],
    }));
  }

  const canContinue = useMemo(() => {
    switch (step.key) {
      case "vehicle":
        return Boolean(form.make && form.model && form.year && form.bodyType);
      case "specifications":
        return Boolean(form.condition && form.transmission && form.fuelType && form.mileageKm);
      case "location":
        return Boolean(form.citySlug);
      case "features":
        return true;
      case "price":
        return Boolean(form.price && Number(form.price) > 0);
      case "photos":
        return photoCount >= 3;
      case "description":
        return form.description.trim().length >= 20;
      case "documents":
        return Boolean(form.ownershipDocumentName);
      case "review":
        return true;
      default:
        return false;
    }
  }, [step.key, form, photoCount]);

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
          Thanks, {user.fullName.split(" ")[0]}. Your vehicle listing is pending review. An administrator checks the
          ownership document before it appears in search.
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
        {step.key === "vehicle" && (
          <StepShell title="Vehicle" description="What are you selling?">
            <div className="flex flex-col gap-5">
              <Select
                label="Make"
                options={[{ value: "", label: "Select a make" }, ...VEHICLE_MAKES.map((make) => ({ value: make, label: make }))]}
                value={form.make}
                onChange={(event) => update("make", event.target.value)}
                className="max-w-none"
              />
              <Select
                label="Model"
                options={[{ value: "", label: form.make ? "Select a model" : "Select a make first" }, ...modelOptions.map((model) => ({ value: model, label: model }))]}
                value={form.model}
                onChange={(event) => update("model", event.target.value)}
                className="max-w-none"
                disabled={!form.make}
              />
              <Select
                label="Year"
                options={[{ value: "", label: "Select a year" }, ...YEAR_OPTIONS.map((year) => ({ value: year, label: year }))]}
                value={form.year}
                onChange={(event) => update("year", event.target.value)}
                className="max-w-none"
              />
              <div>
                <p className="text-xs font-semibold text-ink">Body type</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {VEHICLE_BODY_TYPES.map((type) => (
                    <ChipToggle key={type} label={type} selected={form.bodyType === type} onClick={() => update("bodyType", type)} />
                  ))}
                </div>
              </div>
            </div>
          </StepShell>
        )}

        {step.key === "specifications" && (
          <StepShell title="Specifications" description="Condition and mechanical details.">
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-semibold text-ink">Condition</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {VEHICLE_CONDITIONS.map((option) => (
                    <ChipToggle key={option} label={option} selected={form.condition === option} onClick={() => update("condition", option)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">Transmission</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {VEHICLE_TRANSMISSIONS.map((option) => (
                    <ChipToggle key={option} label={option} selected={form.transmission === option} onClick={() => update("transmission", option)} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">Fuel type</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {VEHICLE_FUEL_TYPES.map((option) => (
                    <ChipToggle key={option} label={option} selected={form.fuelType === option} onClick={() => update("fuelType", option)} />
                  ))}
                </div>
              </div>
              <Input
                label="Mileage (km)"
                inputMode="numeric"
                value={form.mileageKm}
                onChange={(event) => update("mileageKm", event.target.value.replace(/\D/g, ""))}
                className="max-w-none"
              />
            </div>
          </StepShell>
        )}

        {step.key === "location" && (
          <StepShell title="Location" description="Where is the vehicle for viewing?">
            <div className="flex flex-col gap-3">
              <Select
                label="City"
                options={[{ value: "", label: "Select a city" }, ...LAUNCH_CITY_OPTIONS]}
                value={form.citySlug}
                onChange={(event) => update("citySlug", event.target.value)}
                className="max-w-none"
              />
              <p className="text-caption text-ink-soft">
                Listings currently open in {LAUNCH_CITIES.map((city) => city.city).join(" and ")}. Other cities will open as we expand.
              </p>
            </div>
          </StepShell>
        )}

        {step.key === "features" && (
          <StepShell title="Features" description="Select everything this vehicle actually has.">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {FEATURES.map((feature) => (
                <ChipToggle key={feature} label={feature} selected={form.features.includes(feature)} onClick={() => toggleFeature(feature)} />
              ))}
            </div>
          </StepShell>
        )}

        {step.key === "price" && (
          <StepShell title="Price" description="Set a realistic price based on the vehicle's condition and mileage.">
            <Input
              label="Price (Naira)"
              inputMode="numeric"
              value={form.price}
              onChange={(event) => update("price", event.target.value.replace(/\D/g, ""))}
              className="max-w-none"
            />
          </StepShell>
        )}

        {step.key === "photos" && (
          <StepShell title="Photos" description="Add at least 3 real photos, including the exterior and interior.">
            <MediaUploader minRequired={3} maxPhotos={12} viewerLabel="buyers" onChange={(items) => setPhotoCount(items.length)} />
          </StepShell>
        )}

        {step.key === "description" && (
          <StepShell title="Description" description="Describe the vehicle honestly. This appears under About this vehicle.">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="vehicle-description" className="text-xs font-semibold text-ink">
                About this vehicle
              </label>
              <textarea
                id="vehicle-description"
                rows={6}
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                className="w-full rounded-sm border border-line-strong bg-white px-3 py-2.5 text-sm text-ink placeholder:text-clay focus:border-patina-deep focus:outline-none focus:ring-2 focus:ring-patina-deep/15"
                placeholder="A well kept second owner car, always parked under cover, recently serviced with a full detail before listing."
              />
              <p className="text-caption text-ink-soft">{form.description.trim().length} characters. At least 20 needed.</p>
            </div>
          </StepShell>
        )}

        {step.key === "documents" && (
          <StepShell title="Documents" description="Attach the registration or ownership document. Reviewed by an administrator, not shared publicly.">
            <DocumentSlot
              label="Registration or ownership document"
              hint="A vehicle registration certificate, custom papers, or a letter of authority from the owner."
              fileName={form.ownershipDocumentName}
              onChange={(name) => update("ownershipDocumentName", name)}
            />
          </StepShell>
        )}

        {step.key === "review" && (
          <StepShell title="Review your listing" description="Check everything before you submit.">
            <div className="flex flex-col divide-y divide-line rounded-sm border border-line-strong px-4">
              <ReviewRow label="Vehicle" value={form.make && form.model ? `${form.year} ${form.make} ${form.model}` : undefined} />
              <ReviewRow label="Body type" value={form.bodyType} />
              <ReviewRow label="Condition" value={form.condition} />
              <ReviewRow label="Transmission" value={form.transmission} />
              <ReviewRow label="Fuel type" value={form.fuelType} />
              <ReviewRow label="Mileage" value={form.mileageKm ? `${Number(form.mileageKm).toLocaleString("en-NG")} km` : undefined} />
              <ReviewRow label="City" value={LAUNCH_CITY_OPTIONS.find((city) => city.value === form.citySlug)?.label} />
              <ReviewRow label="Features" value={form.features.join(", ")} />
              <ReviewRow label="Price" value={form.price ? `₦${Number(form.price).toLocaleString("en-NG")}` : undefined} />
              <ReviewRow label="Photos" value={`${photoCount} uploaded`} />
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
