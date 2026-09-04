/**
 * Location as a real hierarchy: country, state, city, and named area,
 * instead of a flat display string. Seed data builds a Location with
 * makeLocation() below rather than writing strings by hand, so every
 * listing's location is guaranteed to exist in the same hierarchy
 * that search, filters, and the popular locations list all read
 * from. Adding a new city or area later means adding one entry to
 * STATES, not touching every place a location happens to be printed.
 */

export interface Area {
  name: string;
  slug: string;
}

export interface City {
  name: string;
  slug: string;
  areas: Area[];
}

export interface StateRegion {
  name: string;
  slug: string;
  /**
   * Whether a formatted label spells out the state, for example
   * "Ogun State". Lagos, the FCT, and Rivers are recognizable enough
   * on their own, matching the shorter labels already used across
   * the application (for example "Lekki Phase 1, Lagos"). A newer or
   * less immediately recognizable state, such as Ogun, includes the
   * state name so the location still reads clearly on its own.
   */
  includeInLabel: boolean;
  cities: City[];
}

export const COUNTRY = "Nigeria";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function areas(names: string[]): Area[] {
  return names.map((name) => ({ name, slug: slugify(name) }));
}

export const STATES: StateRegion[] = [
  {
    name: "Lagos",
    slug: "lagos",
    includeInLabel: false,
    cities: [
      {
        name: "Lagos",
        slug: "lagos",
        areas: areas(["Lekki Phase 1", "Ikoyi", "Epe", "Ikeja"]),
      },
    ],
  },
  {
    name: "FCT",
    slug: "fct",
    includeInLabel: false,
    cities: [
      {
        name: "Abuja",
        slug: "abuja",
        areas: areas(["Wuse 2"]),
      },
    ],
  },
  {
    name: "Rivers",
    slug: "rivers",
    includeInLabel: false,
    cities: [
      {
        name: "Port Harcourt",
        slug: "port-harcourt",
        areas: areas(["Old GRA"]),
      },
    ],
  },
  {
    name: "Ogun",
    slug: "ogun",
    includeInLabel: true,
    cities: [
      {
        name: "Abeokuta",
        slug: "abeokuta",
        areas: areas([
          "GRA",
          "Oke Ilewo",
          "Kuto",
          "Asero",
          "Oke Mosan",
          "Ibara",
          "Obantoko",
          "Adatan",
          "Panseke",
          "Lafenwa",
        ]),
      },
    ],
  },
  {
    name: "Oyo",
    slug: "oyo",
    includeInLabel: true,
    cities: [
      {
        name: "Ibadan",
        slug: "ibadan",
        areas: areas(["Bodija", "Ring Road"]),
      },
    ],
  },
  {
    name: "Edo",
    slug: "edo",
    includeInLabel: true,
    cities: [
      {
        name: "Benin City",
        slug: "benin-city",
        areas: [],
      },
    ],
  },
  {
    name: "Kwara",
    slug: "kwara",
    includeInLabel: true,
    cities: [
      {
        name: "Ilorin",
        slug: "ilorin",
        areas: [],
      },
    ],
  },
];

export interface Location {
  state: string;
  stateSlug: string;
  city: string;
  citySlug: string;
  area?: string;
  areaSlug?: string;
  /** Precomputed display label, for example "Oke Ilewo, Abeokuta, Ogun State". */
  label: string;
}

interface LocationInput {
  stateSlug: string;
  citySlug: string;
  areaSlug?: string;
}

/**
 * Builds a complete Location, including its display label, by
 * looking the state, city, and area up in STATES. Throws during
 * development if a seed listing references a location that has not
 * been added to the hierarchy, which is deliberate: a typo in a
 * location slug should fail loudly here rather than silently
 * printing the wrong place on a real listing.
 */
export function makeLocation(input: LocationInput): Location {
  const state = STATES.find((item) => item.slug === input.stateSlug);
  if (!state) {
    throw new Error(`Unknown state slug in makeLocation: ${input.stateSlug}`);
  }
  const city = state.cities.find((item) => item.slug === input.citySlug);
  if (!city) {
    throw new Error(`Unknown city slug in makeLocation: ${input.citySlug} (state: ${state.name})`);
  }
  const area = input.areaSlug ? city.areas.find((item) => item.slug === input.areaSlug) : undefined;
  if (input.areaSlug && !area) {
    throw new Error(`Unknown area slug in makeLocation: ${input.areaSlug} (city: ${city.name})`);
  }

  const labelParts = [area?.name, city.name, state.includeInLabel ? `${state.name} State` : undefined].filter(
    (part): part is string => Boolean(part)
  );

  return {
    state: state.name,
    stateSlug: state.slug,
    city: city.name,
    citySlug: city.slug,
    area: area?.name,
    areaSlug: area?.slug,
    label: labelParts.join(", "),
  };
}

export interface PopularCity {
  city: string;
  citySlug: string;
  stateSlug: string;
}

/**
 * Cities surfaced on the homepage location strip. Every entry here
 * needs at least one real seed listing behind it, matching the
 * existing rule against a decorative map of the whole country:
 * do not add a city here without also adding listing data for it.
 */
export const POPULAR_CITIES: PopularCity[] = [
  { city: "Lagos", citySlug: "lagos", stateSlug: "lagos" },
  { city: "Abuja", citySlug: "abuja", stateSlug: "fct" },
  { city: "Abeokuta", citySlug: "abeokuta", stateSlug: "ogun" },
  { city: "Ibadan", citySlug: "ibadan", stateSlug: "oyo" },
  { city: "Port Harcourt", citySlug: "port-harcourt", stateSlug: "rivers" },
];

/**
 * True when a free text query matches a location's area, city, or
 * state name. Backs the search page's location filtering until a
 * real backend query replaces client side filtering of the full
 * listing set.
 */
export function locationMatches(location: Location, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    location.label.toLowerCase().includes(needle) ||
    location.city.toLowerCase().includes(needle) ||
    location.state.toLowerCase().includes(needle) ||
    (location.area ?? "").toLowerCase().includes(needle)
  );
}
