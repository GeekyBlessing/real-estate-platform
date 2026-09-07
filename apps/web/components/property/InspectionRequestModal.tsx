"use client";

import { FormEvent, useId, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export interface InspectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The property or vehicle this request is for, shown in the confirmation copy below. */
  assetTitle: string;
  /** Called once the (simulated) request actually succeeds, never on cancel, so a caller can record real state (see PropertyActions / lib/rental-lifecycle-context.tsx) rather than guessing from onClose alone. */
  onSubmitted?: () => void;
}

/**
 * Shared by the property and vehicle detail pages (see PropertyActions
 * and components/vehicle/VehicleActions.tsx), since requesting an
 * inspection works the same way regardless of what is being
 * inspected. Only the asset being inspected differs.
 */
export function InspectionRequestModal({ isOpen, onClose, assetTitle, onSubmitted }: InspectionRequestModalProps) {
  const { showToast } = useToast();
  const [preferredDate, setPreferredDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // PropertyActions/VehicleActions mount this component twice on one
  // page (inline desktop copy + sticky mobile bar), so a static form
  // id here would collide: the submit button's form="..." attribute
  // matches by id anywhere in the document, and a duplicate id means
  // the wrong instance's form could receive the submit. useId keeps
  // each mounted instance's form/button pairing unique.
  const formId = useId();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    // Phase 6 wires this to POST /inspections. Simulated here so the
    // flow, including the confirmation state, is real to review now.
    setTimeout(() => {
      setSubmitting(false);
      onClose();
      onSubmitted?.();
      showToast("Inspection request sent. The seller has one business day to confirm.", "success");
    }, 600);
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Request an inspection"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" className="w-full" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} className="w-full" loading={submitting}>
            Send request
          </Button>
        </div>
      }
    >
      <p className="text-body-sm text-ink-soft">
        For {assetTitle}. Propose a time, the seller can confirm it or suggest another.
      </p>
      <form id={formId} onSubmit={handleSubmit} className="mt-5">
        <Input
          label="Preferred date and time"
          type="datetime-local"
          required
          value={preferredDate}
          onChange={(event) => setPreferredDate(event.target.value)}
        />
      </form>
    </BottomSheet>
  );
}
