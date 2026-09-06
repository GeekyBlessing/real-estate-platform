/**
 * A real client-local feature, not seed data dressed up as one: what
 * this browser actually searched, kept in localStorage rather than
 * anything server-side, since there is no account-linked search
 * history backend yet. Read defensively everywhere (private browsing,
 * a cleared store, or a disabled storage API can all make these calls
 * throw or return nothing), since a recent search list is a
 * convenience, nothing else depends on it existing.
 */
const STORAGE_KEY = "ownit.recent-searches";
const MAX_ENTRIES = 6;

export interface RecentSearch {
  label: string;
  href: string;
}

export function getRecentSearches(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(entry: RecentSearch): void {
  if (typeof window === "undefined") return;
  try {
    const withoutDuplicate = getRecentSearches().filter((item) => item.href !== entry.href);
    const next = [entry, ...withoutDuplicate].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: recent searches just won't be remembered this time.
  }
}
