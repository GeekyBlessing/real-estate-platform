"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StepShell, ReviewRow, StepHeader, StepFooter, StepDef } from "@/components/ui/StepFlow";
import { useRentalLifecycle } from "@/lib/rental-lifecycle-context";
import { ResidentFeedbackEntry } from "@/lib/rental-lifecycle";
import { StarIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/lib/auth-context";

type StepKey = "tenancy" | "ratings" | "comments" | "review";

const STEPS: StepDef[] = [
  { key: "tenancy", label: "Confirm your tenancy" },
  { key: "ratings", label: "Rate your experience" },
  { key: "comments", label: "Your feedback" },
  { key: "review", label: "Review" },
];

interface FeedbackForm {
  livedThereConfirmed: boolean | null;
  moveInApprox: string;
  moveOutApprox: string;
  accuracyRating: number;
  landlordRating: number;
  neighborhoodRating: number;
  comments: string;
}

const EMPTY_FORM: FeedbackForm = {
  livedThereConfirmed: null,
  moveInApprox: "",
  moveOutApprox: "",
  accuracyRating: 0,
  landlordRating: 0,
  neighborhoodRating: 0,
  comments: "",
};

function StarPicker({ label, value, onChange }: { label: string; value: number; onChange: (next: number) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold text-ink">{label}</p>
      <div className="mt-2 flex gap-1.5">
        {[1, 2, 3, 4, 5].map((score) => {
          const selected = score <= value;
          return (
            <button
              key={score}
              type="button"
              aria-label={`${score} out of 5`}
              aria-pressed={selected}
              onClick={() => onChange(score)}
              className="p-0.5"
            >
              <StarIcon size={26} active={selected} className={selected ? "text-patina-deep" : "text-clay"} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The other real end of the rental lifecycle (see
 * lib/rental-lifecycle.ts): a tenant telling the platform what living
 * somewhere was actually like. There is no lease record to check
 * this against, so the flow asks rather than assumes ("did you live
 * here" is its own required step, not a precondition silently
 * granted), and submitting never publishes straight to the listing's
 * Resident insights section (see ResidentInsightsSection): it lands
 * pending review, the same posture verification and listing checks
 * use elsewhere, so a listing's feedback section cannot be filled by
 * one person clicking through this form.
 */
export function ResidentFeedbackFlow({
  user,
  listingSlug,
  listingTitle,
}: {
  user: AuthUser;
  listingSlug: string;
  listingTitle: string;
}) {
  const router = useRouter();
  const { submitFeedback } = useRentalLifecycle();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FeedbackForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const step = STEPS[stepIndex] ?? STEPS[0]!;

  function update<K extends keyof FeedbackForm>(key: K, value: FeedbackForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const canContinue = useMemo(() => {
    switch (step.key as StepKey) {
      case "tenancy":
        return form.livedThereConfirmed === true && Boolean(form.moveInApprox) && Boolean(form.moveOutApprox);
      case "ratings":
        return form.accuracyRating > 0 && form.landlordRating > 0 && form.neighborhoodRating > 0;
      case "comments":
        return form.comments.trim().length > 0;
      case "review":
        return true;
      default:
        return false;
    }
  }, [step.key, form]);

  function goBack() {
    if (stepIndex === 0) {
      router.push(`/properties/${listingSlug}`);
      return;
    }
    setStepIndex((index) => Math.max(0, index - 1));
  }

  function goNext() {
    if (step.key === "review") {
      setSubmitting(true);
      const entry: ResidentFeedbackEntry = {
        listingSlug,
        livedThereConfirmed: form.livedThereConfirmed === true,
        moveInApprox: form.moveInApprox,
        moveOutApprox: form.moveOutApprox,
        accuracyRating: form.accuracyRating,
        landlordRating: form.landlordRating,
        neighborhoodRating: form.neighborhoodRating,
        comments: form.comments.trim(),
        submittedAt: new Date().toISOString(),
      };
      window.setTimeout(() => {
        submitFeedback(entry);
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
        <h1 className="text-h1 font-semibold text-ink">Feedback submitted</h1>
        <p className="text-body-sm text-ink-soft">
          Thanks, {user.fullName.split(" ")[0]}. Your feedback on {listingTitle} is pending review before it appears
          for other people looking at this listing.
        </p>
        <Link href={`/properties/${listingSlug}`}>
          <Button variant="secondary" className="mt-2">
            Back to listing
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <StepHeader steps={STEPS} stepIndex={stepIndex} onBack={goBack} />

      <div className="mx-auto max-w-xl px-5 py-6 sm:px-6">
        {step.key === "tenancy" && (
          <StepShell
            title="Confirm your tenancy"
            description={`We don't have a lease record for ${listingTitle} yet, so tell us directly.`}
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2.5">
                {[true, false].map((option) => (
                  <button
                    key={String(option)}
                    type="button"
                    onClick={() => update("livedThereConfirmed", option)}
                    className={cn(
                      "flex flex-col gap-1 rounded-sm border px-4 py-3.5 text-left transition-colors",
                      form.livedThereConfirmed === option ? "border-ink bg-paper-deep" : "border-line-strong hover:border-ink"
                    )}
                  >
                    <span className="text-body-sm font-semibold text-ink">
                      {option ? "Yes, I lived here" : "No, I have not lived here"}
                    </span>
                  </button>
                ))}
              </div>
              {form.livedThereConfirmed === false && (
                <p className="text-caption text-danger">Feedback is only for people who actually lived at this listing.</p>
              )}
              {form.livedThereConfirmed === true && (
                <div className="flex gap-4">
                  <Input
                    label="Moved in (approx.)"
                    type="month"
                    value={form.moveInApprox}
                    onChange={(event) => update("moveInApprox", event.target.value)}
                    className="max-w-none"
                    required
                  />
                  <Input
                    label="Moved out (approx.)"
                    type="month"
                    value={form.moveOutApprox}
                    onChange={(event) => update("moveOutApprox", event.target.value)}
                    className="max-w-none"
                    required
                  />
                </div>
              )}
            </div>
          </StepShell>
        )}

        {step.key === "ratings" && (
          <StepShell title="Rate your experience" description="Based on your own tenancy, not what the listing promised.">
            <div className="flex flex-col gap-6">
              <StarPicker
                label="How accurate was the listing?"
                value={form.accuracyRating}
                onChange={(value) => update("accuracyRating", value)}
              />
              <StarPicker
                label="How responsive was the landlord or agent?"
                value={form.landlordRating}
                onChange={(value) => update("landlordRating", value)}
              />
              <StarPicker
                label="How was the neighborhood?"
                value={form.neighborhoodRating}
                onChange={(value) => update("neighborhoodRating", value)}
              />
            </div>
          </StepShell>
        )}

        {step.key === "comments" && (
          <StepShell title="Your feedback" description="What would help someone else deciding whether to live here?">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="feedback-comments" className="text-xs font-semibold text-ink">
                Comments
              </label>
              <textarea
                id="feedback-comments"
                rows={6}
                value={form.comments}
                onChange={(event) => update("comments", event.target.value)}
                placeholder="What was genuinely true about this place and the landlord?"
                className="w-full rounded-sm border border-line-strong bg-white px-3 py-2.5 text-sm text-ink placeholder:text-clay focus:border-patina-deep focus:outline-none focus:ring-2 focus:ring-patina-deep/15"
              />
            </div>
          </StepShell>
        )}

        {step.key === "review" && (
          <StepShell title="Review your feedback" description="Check everything before you submit.">
            <div className="flex flex-col divide-y divide-line rounded-sm border border-line-strong px-4">
              <ReviewRow label="Listing" value={listingTitle} />
              <ReviewRow label="Moved in" value={form.moveInApprox} />
              <ReviewRow label="Moved out" value={form.moveOutApprox} />
              <ReviewRow label="Listing accuracy" value={`${form.accuracyRating} / 5`} />
              <ReviewRow label="Landlord responsiveness" value={`${form.landlordRating} / 5`} />
              <ReviewRow label="Neighborhood" value={`${form.neighborhoodRating} / 5`} />
              <ReviewRow label="Comments" value={form.comments} />
            </div>
            <p className="text-caption text-ink-soft">
              Submitting sends this for review. It will not appear on the listing until an administrator has checked
              it.
            </p>
          </StepShell>
        )}
      </div>

      <StepFooter
        stepIndex={stepIndex}
        isLastStep={step.key === "review"}
        lastStepLabel="Submit feedback"
        canContinue={canContinue}
        submitting={submitting}
        onBack={goBack}
        onContinue={goNext}
      />
    </div>
  );
}
