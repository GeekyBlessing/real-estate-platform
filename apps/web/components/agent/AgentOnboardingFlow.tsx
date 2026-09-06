"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { VerificationBadge } from "@/components/ui/Badge";
import { StepShell, ChipToggle, DocumentSlot, ReviewRow, StepHeader, StepFooter, StepDef } from "@/components/ui/StepFlow";
import { STATES, LAUNCH_CITIES, isLaunchCity } from "@/lib/locations";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/lib/auth-context";

type StepKey =
  | "account"
  | "personal"
  | "identity"
  | "professional"
  | "agency"
  | "locations"
  | "documents"
  | "review";

const STEPS: StepDef[] = [
  { key: "account", label: "Account" },
  { key: "personal", label: "Personal information" },
  { key: "identity", label: "Identity verification" },
  { key: "professional", label: "Professional information" },
  { key: "agency", label: "Agency information" },
  { key: "locations", label: "Operating locations" },
  { key: "documents", label: "Documents" },
  { key: "review", label: "Review" },
];

const SPECIALIZATIONS = ["Residential sales", "Commercial", "Land", "Vehicles", "Property management"];

const YEARS_OPTIONS = [
  { value: "under-1", label: "Less than 1 year" },
  { value: "1-3", label: "1 to 3 years" },
  { value: "3-5", label: "3 to 5 years" },
  { value: "5-plus", label: "5 years or more" },
];

const RESIDENCE_STATE_OPTIONS = STATES.map((state) => ({ value: state.slug, label: state.name }));

const ALL_CITIES = STATES.flatMap((state) => state.cities.map((city) => ({ ...city, stateName: state.name })));

interface AgentApplicationForm {
  dateOfBirth: string;
  residentialAddress: string;
  stateOfResidence: string;
  nin: string;
  yearsExperience: string;
  specializations: string[];
  licenseNumber: string;
  operatesAs: "independent" | "agency" | "";
  agencyName: string;
  agencyRegistrationNumber: string;
  operatingCitySlugs: string[];
  idDocumentName: string | null;
  proofOfAddressName: string | null;
  certificationName: string | null;
}

const EMPTY_FORM: AgentApplicationForm = {
  dateOfBirth: "",
  residentialAddress: "",
  stateOfResidence: "",
  nin: "",
  yearsExperience: "",
  specializations: [],
  licenseNumber: "",
  operatesAs: "",
  agencyName: "",
  agencyRegistrationNumber: "",
  operatingCitySlugs: [],
  idDocumentName: null,
  proofOfAddressName: null,
  certificationName: null,
};

/**
 * The full nine step application described in the blueprint: Account,
 * Personal information, Identity verification, Professional
 * information, Agency information, Operating locations, Documents,
 * Review, and a submit action that ends in "Verification pending"
 * (the only honest end state, since nothing here is actually reviewed
 * yet). Submission is simulated the same way InspectionRequestModal's
 * is (components/property/InspectionRequestModal.tsx): the UX is real
 * to review now, a real POST /agents/applications endpoint and a real
 * document upload land later. The NIN field in the identity step is
 * the same story: it collects the number so the architecture exists,
 * but nothing here calls out to an external NIN verification
 * provider, matching the instruction not to wire one until a real
 * provider is configured.
 */
export function AgentOnboardingFlow({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<AgentApplicationForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // stepIndex is always kept within [0, STEPS.length - 1] by goBack/goNext.
  const step = STEPS[stepIndex] ?? STEPS[0]!;

  function update<K extends keyof AgentApplicationForm>(key: K, value: AgentApplicationForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleFromList(key: "specializations" | "operatingCitySlugs", value: string) {
    setForm((prev) => {
      const current = prev[key];
      const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
      return { ...prev, [key]: next };
    });
  }

  const canContinue = useMemo(() => {
    switch (step.key) {
      case "account":
        return true;
      case "personal":
        return Boolean(form.dateOfBirth && form.residentialAddress.trim() && form.stateOfResidence);
      case "identity":
        return /^\d{11}$/.test(form.nin);
      case "professional":
        return Boolean(form.yearsExperience && form.specializations.length > 0);
      case "agency":
        return form.operatesAs === "independent" || (form.operatesAs === "agency" && form.agencyName.trim().length > 0);
      case "locations":
        return form.operatingCitySlugs.length > 0;
      case "documents":
        return Boolean(form.idDocumentName && form.proofOfAddressName);
      case "review":
        return true;
      default:
        return false;
    }
  }, [step.key, form]);

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
        <h1 className="text-h1 font-semibold text-ink">Application submitted</h1>
        <p className="text-body-sm text-ink-soft">
          Thanks, {user.fullName.split(" ")[0]}. Your agent application is now pending review. An administrator will
          check your identity information and documents before your profile is marked as a verified agent.
        </p>
        <p className="text-caption text-ink-soft">
          We will notify you here and by email once a decision has been made. This usually does not guarantee a
          specific timeframe.
        </p>
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
        {step.key === "account" && (
          <StepShell
            title="Your account"
            description="Your agent profile will be linked to the account you are signed in with."
          >
            <div className="rounded-sm border border-line-strong p-4">
              <p className="text-body-sm font-semibold text-ink">{user.fullName}</p>
              <p className="mt-0.5 text-caption text-ink-soft">{user.email}</p>
              {user.phone && <p className="text-caption text-ink-soft">{user.phone}</p>}
            </div>
          </StepShell>
        )}

        {step.key === "personal" && (
          <StepShell title="Personal information" description="This is used only for identity and address verification.">
            <div className="flex flex-col gap-5">
              <Input
                label="Date of birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(event) => update("dateOfBirth", event.target.value)}
                className="max-w-none"
                required
              />
              <Input
                label="Residential address"
                value={form.residentialAddress}
                onChange={(event) => update("residentialAddress", event.target.value)}
                className="max-w-none"
                required
              />
              <Select
                label="State of residence"
                options={[{ value: "", label: "Select a state" }, ...RESIDENCE_STATE_OPTIONS]}
                value={form.stateOfResidence}
                onChange={(event) => update("stateOfResidence", event.target.value)}
                className="max-w-none"
              />
            </div>
          </StepShell>
        )}

        {step.key === "identity" && (
          <StepShell
            title="Identity verification"
            description="Your National Identification Number confirms who you are. In this preview, an administrator reviews it directly; automatic verification will be added once a licensed provider is connected."
          >
            <Input
              label="National Identification Number (NIN)"
              inputMode="numeric"
              maxLength={11}
              value={form.nin}
              onChange={(event) => update("nin", event.target.value.replace(/\D/g, ""))}
              hint="11 digits, as printed on your NIN slip or card."
              className="max-w-none"
              required
            />
          </StepShell>
        )}

        {step.key === "professional" && (
          <StepShell title="Professional information" description="Tell us what you do and how long you've been doing it.">
            <div className="flex flex-col gap-5">
              <Select
                label="Years of experience"
                options={[{ value: "", label: "Select a range" }, ...YEARS_OPTIONS]}
                value={form.yearsExperience}
                onChange={(event) => update("yearsExperience", event.target.value)}
                className="max-w-none"
              />
              <div>
                <p className="text-xs font-semibold text-ink">Specializations</p>
                <p className="mt-1 text-caption text-ink-soft">Select every area you actively work in.</p>
                <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SPECIALIZATIONS.map((option) => (
                    <ChipToggle
                      key={option}
                      label={option}
                      selected={form.specializations.includes(option)}
                      onClick={() => toggleFromList("specializations", option)}
                    />
                  ))}
                </div>
              </div>
              <Input
                label="Professional license or membership number"
                value={form.licenseNumber}
                onChange={(event) => update("licenseNumber", event.target.value)}
                hint="For example a NIESV membership number. Optional."
                className="max-w-none"
              />
            </div>
          </StepShell>
        )}

        {step.key === "agency" && (
          <StepShell title="Agency information" description="Let buyers and tenants know who you work with.">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2.5">
                {(["independent", "agency"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => update("operatesAs", option)}
                    className={cn(
                      "flex flex-col gap-1 rounded-sm border px-4 py-3.5 text-left transition-colors",
                      form.operatesAs === option ? "border-ink bg-paper-deep" : "border-line-strong hover:border-ink"
                    )}
                  >
                    <span className="text-body-sm font-semibold text-ink">
                      {option === "independent" ? "Independent agent" : "Registered agency"}
                    </span>
                    <span className="text-caption text-ink-soft">
                      {option === "independent"
                        ? "You work on your own, not under a registered agency."
                        : "You work under a registered real estate or vehicle sales agency."}
                    </span>
                  </button>
                ))}
              </div>
              {form.operatesAs === "agency" && (
                <>
                  <Input
                    label="Agency name"
                    value={form.agencyName}
                    onChange={(event) => update("agencyName", event.target.value)}
                    className="max-w-none"
                    required
                  />
                  <Input
                    label="Agency registration number"
                    value={form.agencyRegistrationNumber}
                    onChange={(event) => update("agencyRegistrationNumber", event.target.value)}
                    hint="Your CAC registration number, if the agency has one. Optional."
                    className="max-w-none"
                  />
                </>
              )}
            </div>
          </StepShell>
        )}

        {step.key === "locations" && (
          <StepShell
            title="Operating locations"
            description="Choose every city where you actively list or manage properties and vehicles."
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ALL_CITIES.map((city) => {
                const launch = isLaunchCity(city.slug);
                return (
                  <ChipToggle
                    key={city.slug}
                    label={city.name}
                    selected={form.operatingCitySlugs.includes(city.slug)}
                    disabled={!launch}
                    disabledHint="Soon"
                    onClick={() => toggleFromList("operatingCitySlugs", city.slug)}
                  />
                );
              })}
            </div>
            <p className="text-caption text-ink-soft">
              {LAUNCH_CITIES.map((city) => city.city).join(" and ")} are open for agent applications now. Other
              cities will open as we expand.
            </p>
          </StepShell>
        )}

        {step.key === "documents" && (
          <StepShell
            title="Documents"
            description="Attach clear photos or scans. These are reviewed by an administrator, not shared publicly."
          >
            <div className="flex flex-col gap-4">
              <DocumentSlot
                label="Government issued ID"
                hint="National ID, international passport, or driver's license."
                fileName={form.idDocumentName}
                onChange={(name) => update("idDocumentName", name)}
              />
              <DocumentSlot
                label="Proof of address"
                hint="A recent utility bill or bank statement with your address."
                fileName={form.proofOfAddressName}
                onChange={(name) => update("proofOfAddressName", name)}
              />
              <DocumentSlot
                label="Professional certification"
                hint="A membership certificate or CAC document, if you have one. Optional."
                fileName={form.certificationName}
                onChange={(name) => update("certificationName", name)}
              />
            </div>
          </StepShell>
        )}

        {step.key === "review" && (
          <StepShell title="Review your application" description="Check everything before you submit.">
            <div className="flex flex-col divide-y divide-line rounded-sm border border-line-strong px-4">
              <ReviewRow label="Date of birth" value={form.dateOfBirth} />
              <ReviewRow label="Residential address" value={form.residentialAddress} />
              <ReviewRow
                label="State of residence"
                value={RESIDENCE_STATE_OPTIONS.find((option) => option.value === form.stateOfResidence)?.label}
              />
              <ReviewRow label="NIN" value={form.nin ? `${"•".repeat(7)}${form.nin.slice(-4)}` : undefined} />
              <ReviewRow
                label="Experience"
                value={YEARS_OPTIONS.find((option) => option.value === form.yearsExperience)?.label}
              />
              <ReviewRow label="Specializations" value={form.specializations.join(", ")} />
              <ReviewRow label="License number" value={form.licenseNumber} />
              <ReviewRow
                label="Works as"
                value={form.operatesAs === "agency" ? "Registered agency" : form.operatesAs === "independent" ? "Independent agent" : undefined}
              />
              <ReviewRow label="Agency name" value={form.agencyName} />
              <ReviewRow
                label="Operating cities"
                value={ALL_CITIES.filter((city) => form.operatingCitySlugs.includes(city.slug))
                  .map((city) => city.name)
                  .join(", ")}
              />
              <ReviewRow label="Government ID" value={form.idDocumentName ?? undefined} />
              <ReviewRow label="Proof of address" value={form.proofOfAddressName ?? undefined} />
            </div>
            <p className="text-caption text-ink-soft">
              Submitting sends this application for review. You will not be listed as a verified agent until an
              administrator has checked your identity and documents.
            </p>
          </StepShell>
        )}
      </div>

      <StepFooter
        stepIndex={stepIndex}
        isLastStep={step.key === "review"}
        lastStepLabel="Submit application"
        canContinue={canContinue}
        submitting={submitting}
        onBack={goBack}
        onContinue={goNext}
      />
    </div>
  );
}
