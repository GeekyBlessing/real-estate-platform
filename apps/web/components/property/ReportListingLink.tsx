"use client";

import { useToast } from "@/components/ui/Toast";

/** Low priority relative to Contact and Inspection, but never hidden. */
export function ReportListingLink() {
  const { showToast } = useToast();

  return (
    <button
      type="button"
      onClick={() => showToast("Report received. An administrator will review this listing.")}
      className="text-xs text-clay hover:text-danger"
    >
      Report this listing
    </button>
  );
}
