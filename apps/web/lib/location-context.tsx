"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { LAUNCH_CITIES, PopularCity } from "@/lib/locations";

const STORAGE_KEY = "ownit:selected-city";

interface LocationContextValue {
  city: PopularCity;
  cities: PopularCity[];
  setCitySlug: (citySlug: string) => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

/**
 * The one piece of state the whole homepage and discovery experience
 * hangs off (Section: Location First). Deliberately restricted to
 * LAUNCH_CITIES (lib/locations.ts), not the full STATES hierarchy:
 * a user can only ever be "in" Lagos or Abeokuta right now, so the
 * rest of the product never has to handle a selected city with no
 * real listings behind it. Persisted to localStorage so the choice
 * survives a reload; defaults to Lagos on first visit and on the
 * server, since a locale-less default has to be something.
 */
export function LocationProvider({ children }: { children: ReactNode }) {
  const [citySlug, setCitySlugState] = useState<string>(LAUNCH_CITIES[0]!.citySlug);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && LAUNCH_CITIES.some((city) => city.citySlug === stored)) {
      setCitySlugState(stored);
    }
  }, []);

  function setCitySlug(next: string) {
    if (!LAUNCH_CITIES.some((city) => city.citySlug === next)) return;
    setCitySlugState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Best effort only; a private browsing session simply won't persist the choice.
    }
  }

  const value = useMemo<LocationContextValue>(() => {
    const city = LAUNCH_CITIES.find((item) => item.citySlug === citySlug) ?? LAUNCH_CITIES[0]!;
    return { city, cities: LAUNCH_CITIES, setCitySlug };
  }, [citySlug]);

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useSelectedLocation(): LocationContextValue {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useSelectedLocation must be used within a LocationProvider");
  }
  return context;
}
