"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "ownit:favorites";

type FavoriteCategory = "property" | "vehicle";

type FavoriteMap = Record<FavoriteCategory, string[]>;

const EMPTY: FavoriteMap = { property: [], vehicle: [] };

interface FavoritesContextValue {
  isFavorited: (category: FavoriteCategory, slug: string) => boolean;
  toggleFavorite: (category: FavoriteCategory, slug: string) => void;
  favoriteSlugs: FavoriteMap;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/**
 * One shared favorites store for the whole app, replacing the
 * per-grid local state PropertyGrid and VehicleGrid used to keep
 * (and the entirely separate, disconnected favorite toggle that
 * lived inside PropertyActions/VehicleActions on the detail pages).
 * Saving a listing from a card, from a detail page's action bar, or
 * from the Saved tab now all read and write the same place, and it
 * survives a reload via localStorage, which is the minimum bar for
 * a "Saved" experience to feel real rather than decorative.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteMap>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<FavoriteMap>;
        setFavorites({ property: parsed.property ?? [], vehicle: parsed.vehicle ?? [] });
      }
    } catch {
      // Corrupt or inaccessible storage: fall back to an empty favorites list.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Best effort only.
    }
  }, [favorites, hydrated]);

  const toggleFavorite = useCallback((category: FavoriteCategory, slug: string) => {
    setFavorites((current) => {
      const list = current[category];
      const next = list.includes(slug) ? list.filter((item) => item !== slug) : [...list, slug];
      return { ...current, [category]: next };
    });
  }, []);

  const isFavorited = useCallback(
    (category: FavoriteCategory, slug: string) => favorites[category].includes(slug),
    [favorites]
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({ isFavorited, toggleFavorite, favoriteSlugs: favorites }),
    [isFavorited, toggleFavorite, favorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
