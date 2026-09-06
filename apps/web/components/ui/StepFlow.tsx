"use client";

import { ReactNode, useId } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/Button";

/**
 * Shared building blocks for a multi-step application flow (Become an
 * agent, List a property, Sell a car): the step header/description
 * pattern, a toggleable chip for single or multi select facts, and a
 * document attach slot. Extracted out of the first flow that needed
 * them (components/agent/AgentOnboardingFlow.tsx) so every step-based
 * flow in the app shares one visual language instead of each one
 * reinventing chip and upload styling slightly differently.
 */
export function StepShell({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-h2 font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1.5 text-body-sm text-ink-soft">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function ChipToggle({
  label,
  selected,
  disabled,
  disabledHint,
  onClick,
}: {
  label: string;
  selected: boolean;
  disabled?: boolean;
  disabledHint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-2 rounded-sm border px-3.5 py-2.5 text-left text-body-sm font-semibold transition-colors",
        disabled && "cursor-not-allowed border-line bg-paper-deep text-clay",
        !disabled && selected && "border-ink bg-ink text-parchment",
        !disabled && !selected && "border-line-strong text-ink hover:border-ink"
      )}
    >
      <span>{label}</span>
      {disabled ? (
        <span className="text-caption font-normal">{disabledHint}</span>
      ) : selected ? (
        <CheckIcon size={14} active />
      ) : null}
    </button>
  );
}

export function DocumentSlot({
  label,
  hint,
  fileName,
  onChange,
}: {
  label: string;
  hint: string;
  fileName: string | null;
  onChange: (name: string | null) => void;
}) {
  const inputId = useId();
  return (
    <div className="rounded-sm border border-line-strong p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-body-sm font-semibold text-ink">{label}</p>
          <p className="mt-0.5 text-caption text-ink-soft">{hint}</p>
        </div>
        {fileName && <CheckIcon size={16} active className="mt-0.5 flex-none text-verified" />}
      </div>
      <label
        htmlFor={inputId}
        className="mt-3 inline-flex h-10 cursor-pointer items-center justify-center rounded-sm border border-line-strong px-4 text-body-sm font-semibold text-ink transition-colors hover:border-ink"
      >
        {fileName ? "Change file" : "Choose file"}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/*,.pdf"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0]?.name ?? null)}
      />
      {fileName && <p className="mt-2 truncate text-caption text-ink-soft">{fileName}</p>}
    </div>
  );
}

export function ReviewRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-caption text-ink-soft">{label}</span>
      <span className="text-body-sm font-semibold text-ink">{value}</span>
    </div>
  );
}

export interface StepDef {
  key: string;
  label: string;
}

/**
 * The sticky top header every step flow uses: back chevron (exits on
 * the first step, goes to the previous step otherwise), current step
 * label, "Step X of Y", and a segmented progress bar. A flow renders
 * this once above its own step content.
 */
export function StepHeader({
  steps,
  stepIndex,
  onBack,
}: {
  steps: StepDef[];
  stepIndex: number;
  onBack: () => void;
}) {
  const step = steps[stepIndex] ?? steps[0]!;
  return (
    <div className="sticky top-0 z-10 border-b border-line bg-parchment/95 px-5 py-3 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={stepIndex === 0 ? "Exit" : "Previous step"}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-deep"
        >
          <ChevronLeftGlyph />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-sm font-semibold text-ink">{step.label}</p>
          <p className="text-caption text-ink-soft">
            Step {stepIndex + 1} of {steps.length}
          </p>
        </div>
      </div>
      <div className="mx-auto mt-2.5 flex max-w-xl gap-1">
        {steps.map((item, index) => (
          <span
            key={item.key}
            className={cn("h-1 flex-1 rounded-full transition-colors", index <= stepIndex ? "bg-patina-deep" : "bg-line")}
          />
        ))}
      </div>
    </div>
  );
}

function ChevronLeftGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

/** The sticky bottom Back/Continue action bar every step flow uses. */
export function StepFooter({
  stepIndex,
  isLastStep,
  lastStepLabel = "Submit",
  canContinue,
  submitting,
  onBack,
  onContinue,
}: {
  stepIndex: number;
  isLastStep: boolean;
  lastStepLabel?: string;
  canContinue: boolean;
  submitting: boolean;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-parchment px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6">
      <div className="mx-auto flex max-w-xl gap-3">
        {stepIndex > 0 && (
          <ButtonGhostBack onClick={onBack} />
        )}
        <ButtonPrimaryContinue disabled={!canContinue} loading={submitting} onClick={onContinue}>
          {isLastStep ? lastStepLabel : "Continue"}
        </ButtonPrimaryContinue>
      </div>
    </div>
  );
}

function ButtonGhostBack({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="secondary" className="w-full" onClick={onClick}>
      Back
    </Button>
  );
}

function ButtonPrimaryContinue({
  disabled,
  loading,
  onClick,
  children,
}: {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button type="button" className="w-full" disabled={disabled} loading={loading} onClick={onClick}>
      {children}
    </Button>
  );
}
