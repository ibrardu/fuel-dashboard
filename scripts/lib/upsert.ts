// Thin upsert wrappers, one per table, using each table's natural-key unique
// constraint (see supabase/migrations/0001_schema.sql) so ingestion/backfill
// runs are idempotent — re-running never duplicates rows.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CrudePrice, FuelPrice, PriceBuildup } from "../../lib/types";

export interface UpsertResult {
  table: string;
  attempted: number;
  error: string | null;
}

// PostgREST/Supabase has a practical request-size ceiling — the metro RSP
// backfill alone is ~13k rows, so upserts are chunked rather than sent in one call.
const BATCH_SIZE = 1000;

async function upsert<T extends object>(
  supabase: SupabaseClient,
  table: string,
  rows: T[],
  onConflict: string
): Promise<UpsertResult> {
  if (rows.length === 0) return { table, attempted: 0, error: null };

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(table).upsert(batch, { onConflict });
    if (error) return { table, attempted: rows.length, error: error.message };
  }
  return { table, attempted: rows.length, error: null };
}

export function upsertFuelPrices(supabase: SupabaseClient, rows: FuelPrice[]) {
  return upsert(supabase, "fuel_prices", rows, "city_id,date");
}

export function upsertPriceBuildup(supabase: SupabaseClient, rows: PriceBuildup[]) {
  return upsert(supabase, "price_buildup", rows, "city_id,date");
}

export function upsertCrudePrices(supabase: SupabaseClient, rows: CrudePrice[]) {
  return upsert(supabase, "crude_prices", rows, "date");
}
