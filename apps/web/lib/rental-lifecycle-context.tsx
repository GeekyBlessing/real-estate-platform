"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { RentalStage, ResidentFeedbackEntry } from "@/lib/rental-lifecycle";

const STAGE_STORAGE_KEY = "ownit:rental-stages";
const FEEDBACK_STORAGE_KEY = "ownit:resident-feedback";

type StageMap = Record<string, RentalStage[]>;

interface RentalLifecycleContextValue {
  stagesFor: (listingSlug: string) => RentalStage[];
  recordStage: (listingSlug: string, stage: RentalStage) => void;
  feedbackFor: (listingSlug: string) => ResidentFeedbackEntry | null;
  submitFeedback: (entry: ResidentFeedbackEntry) => void;
}

const RentalLifecycleContext = createContext<RentalLifecycleContextValue | null>(null);

/**
 * Same shape and same honesty rule as FavoritesProvider
 * (lib/favorites-context.tsx): local to this browser, not a real
 * account-wide record, because there is no lease or feedback backend
 * behind this yet (see lib/rental-lifecycle.ts for why only two
 * stages can be reached this way at all). This is real state,
 * though, not decoration: it reflects an action this browser's user
 * actually took, and disappears honestly if they clear storage or
 * switch device, rather than pretending to be account-wide when it
 * is not.
 */
export function RentalLifecycleProvider({ children }: { children: ReactNode }) {
  const [stages, setStages] = useState<StageMap>({});
  const [feedback, setFeedback] = useState<Record<string, ResidentFeedbackEntry>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedStages = window.localStorage.getItem(STAGE_STORAGE_KEY);
      if (storedStages) setStages(JSON.parse(storedStages) as StageMap);
      const storedFeedback = window.localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (storedFeedback) setFeedback(JSON.parse(storedFeedback) as Record<string, ResidentFeedbackEntry>);
    } catch {
      // Corrupt or inaccessible storage: fall back to empty state.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STAGE_STORAGE_KEY, JSON.stringify(stages));
    } catch {
      // Best effort only.
    }
  }, [stages, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedback));
    } catch {
      // Best effort only.
    }
  }, [feedback, hydrated]);

  const recordStage = useCallback((listingSlug: string, stage: RentalStage) => {
    setStages((current) => {
      const existing = current[listingSlug] ?? [];
      if (existing.includes(stage)) return current;
      return { ...current, [listingSlug]: [...existing, stage] };
    });
  }, []);

  const stagesFor = useCallback((listingSlug: string) => stages[listingSlug] ?? [], [stages]);

  const submitFeedback = useCallback((entry: ResidentFeedbackEntry) => {
    setFeedback((current) => ({ ...current, [entry.listingSlug]: entry }));
    setStages((current) => {
      const existing = current[entry.listingSlug] ?? [];
      if (existing.includes("feedback_shared")) return current;
      return { ...current, [entry.listingSlug]: [...existing, "feedback_shared"] };
    });
  }, []);

  const feedbackFor = useCallback((listingSlug: string) => feedback[listingSlug] ?? null, [feedback]);

  const value = useMemo<RentalLifecycleContextValue>(
    () => ({ stagesFor, recordStage, feedbackFor, submitFeedback }),
    [stagesFor, recordStage, feedbackFor, submitFeedback]
  );

  return <RentalLifecycleContext.Provider value={value}>{children}</RentalLifecycleContext.Provider>;
}

export function useRentalLifecycle(): RentalLifecycleContextValue {
  const context = useContext(RentalLifecycleContext);
  if (!context) {
    throw new Error("useRentalLifecycle must be used within a RentalLifecycleProvider");
  }
  return context;
}
