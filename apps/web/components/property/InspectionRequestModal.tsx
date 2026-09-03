"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export interface InspectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyTitle: string;
}

export function InspectionRequestModal({ isOpen, onClose, propertyTitle }: InspectionRequestModalProps) {
  const { showToast } = useToast();
  const [preferredDate, setPreferredDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    // Phase 6 wires this to POST /inspections. Simulated here so the
    // flow, including the confirmation state, is real to review now.
    setTimeout(() => {
      setSubmitting(false);
      onClose();
      showToast("Inspection request sent. The agent has one business day to confirm.", "success");
    }, 600);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request an inspection">
      <p className="text-sm text-ink-soft">
        For {propertyTitle}. Propose a time, the agent can confirm it or suggest another.
      </p>
      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <Input
          label="Preferred date and time"
          type="datetime-local"
          required
          value={preferredDate}
          onChange={(event) => setPreferredDate(event.target.value)}
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={submitting}>Send request</Button>
        </div>
      </form>
    </Modal>
  );
}
