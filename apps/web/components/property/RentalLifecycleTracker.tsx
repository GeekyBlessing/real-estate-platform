"use client";

import { RENTAL_STAGES } from "@/lib/rental-lifecycle";
import { useRentalLifecycle } from "@/lib/rental-lifecycle-context";
import { CheckIcon } from "@/components/ui/icons";

export interface RentalLifecycleTrackerProps {
  listingSlug: string;
}

/**
 * Shows the real, full lifecycle a rental moves through (see
 * lib/rental-lifecycle.ts), not just the two stages this build can
 * actually reach. A stage this browser has genuinely recorded shows
 * as done; every other stage shows as not started, honestly, rather
 * than the tracker quietly only listing the parts that work.
 */
export function RentalLifecycleTracker({ listingSlug }: RentalLifecycleTrackerProps) {
  const { stagesFor } = useRentalLifecycle();
  const reached = stagesFor(listingSlug);

  return (
    <section>
      <h2 className="text-h3 font-semibold text-ink">Rental status</h2>
      <div className="mt-3 rounded border border-line bg-parchment p-4">
        <ol className="flex flex-col gap-4">
          {RENTAL_STAGES.map((info) => {
            const done = reached.includes(info.stage);
            return (
              <li key={info.stage} className="flex gap-3">
                <span
                  className={
                    done
                      ? "flex h-5 w-5 flex-none items-center justify-center rounded-full bg-verified text-white"
                      : "flex h-5 w-5 flex-none items-center justify-center rounded-full border border-line-strong"
                  }
                >
                  {done && <CheckIcon size={11} active className="text-white" />}
                </span>
                <div>
                  <p className={done ? "text-body-sm font-semibold text-ink" : "text-body-sm font-semibold text-ink-soft"}>
                    {info.label}
                  </p>
                  <p className="mt-0.5 text-caption text-ink-soft">
                    {done ? info.description : info.reachableAlone ? "Not started yet." : "Confirmed by the landlord or agent once reached."}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
