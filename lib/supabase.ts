import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { DashboardData } from "./types";
import { SEED_DATA } from "./seedData";

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export type DataSource = "supabase" | "seed";

/**
 * Fetch every table the dashboard needs. Falls back to the bundled seed
 * dataset (same shapes) when env vars are missing, a query errors, or the
 * core tables come back empty — the page must render without a configured
 * Supabase project.
 */
export async function getDashboardData(): Promise<{ data: DashboardData; source: DataSource }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: SEED_DATA, source: "seed" };

  try {
    const [cities, fuelPrices, priceBuildup, ethanolPrices, blendConfig, crudePrices, assumptions] =
      await Promise.all([
        supabase.from("cities").select("*").order("id"),
        supabase.from("fuel_prices").select("*").order("date"),
        supabase.from("price_buildup").select("*").order("date"),
        supabase.from("ethanol_prices").select("*").order("id"),
        supabase.from("blend_config").select("*").order("effective_from"),
        supabase.from("crude_prices").select("*").order("date"),
        supabase.from("assumptions").select("*").order("id"),
      ]);

    const responses = [cities, fuelPrices, priceBuildup, ethanolPrices, blendConfig, crudePrices, assumptions];
    if (responses.some((r) => r.error)) throw responses.find((r) => r.error)!.error;
    if (!cities.data?.length || !fuelPrices.data?.length || !priceBuildup.data?.length || !blendConfig.data?.length) {
      throw new Error("Supabase core tables are empty — run the seed");
    }

    return {
      data: {
        cities: cities.data,
        fuel_prices: fuelPrices.data,
        price_buildup: priceBuildup.data,
        ethanol_prices: ethanolPrices.data ?? [],
        blend_config: blendConfig.data,
        crude_prices: crudePrices.data ?? [],
        assumptions: assumptions.data ?? [],
      },
      source: "supabase",
    };
  } catch {
    return { data: SEED_DATA, source: "seed" };
  }
}
