// Maps city labels as they appear in scraped sources (which vary in
// spelling/casing/older names) to this project's canonical `cities.name`
// values, then resolves those to DB ids.

import type { SupabaseClient } from "@supabase/supabase-js";

// Canonical name -> aliases seen in PPAC PDFs / OMC pages / news aggregators.
const ALIASES: Record<string, string[]> = {
  Delhi: ["New Delhi", "NCT of Delhi", "NCR Delhi"],
  Mumbai: ["Bombay", "Greater Mumbai"],
  Kolkata: ["Calcutta"],
  Chennai: ["Madras"],
  Bengaluru: ["Bangalore"],
  Hyderabad: [],
  Pune: ["Poona"],
  Ahmedabad: ["Amdavad"],
  Jaipur: [],
  Lucknow: [],
  Chandigarh: [],
  Kochi: ["Cochin", "Ernakulam"],
  Bhopal: [],
  Patna: [],
};

const LOOKUP: Map<string, string> = new Map();
for (const [canonical, aliases] of Object.entries(ALIASES)) {
  LOOKUP.set(normalize(canonical), canonical);
  for (const alias of aliases) LOOKUP.set(normalize(alias), canonical);
}

function normalize(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Resolves a scraped city label to this project's canonical city name, or null if unrecognized. */
export function canonicalCityName(label: string): string | null {
  return LOOKUP.get(normalize(label)) ?? null;
}

export interface CityIdMap {
  byName: Map<string, number>;
  /** Resolves a scraped label (any known alias/casing) straight to a city_id. */
  idFor(label: string): number | undefined;
}

export async function loadCityIdMap(supabase: SupabaseClient): Promise<CityIdMap> {
  const { data, error } = await supabase.from("cities").select("id, name");
  if (error) throw error;

  const byName = new Map<string, number>();
  for (const row of data ?? []) byName.set(row.name, row.id);

  return {
    byName,
    idFor(label: string) {
      const canonical = canonicalCityName(label);
      return canonical ? byName.get(canonical) : undefined;
    },
  };
}

export const METRO_CITY_NAMES = ["Delhi", "Mumbai", "Kolkata", "Chennai"] as const;
export const NON_METRO_CITY_NAMES = [
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Chandigarh",
  "Kochi",
  "Bhopal",
  "Patna",
] as const;
