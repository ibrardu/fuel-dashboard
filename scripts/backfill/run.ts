// One-time historical backfill. Safe to re-run (every write is an upsert on
// each table's natural key) — re-running just refreshes rows rather than
// duplicating them.
//
// Honest per-source depth (see plan / README "Data ingestion" section for
// the full reasoning):
//   - FX (USD/INR): deep — full Frankfurter history back to ~2000.
//   - PPAC metro RSP (Delhi/Mumbai/Chennai/Kolkata, petrol+diesel): deep —
//     PPAC's own PDF contains the full daily series since 2017-06-16.
//   - Indian Crude Basket ($/bbl): shallow — PPAC only frees the *current
//     financial year's* monthly averages without a login; deeper history is
//     gated behind a PPAC account this project doesn't have.
//   - Non-metro city retail (10 cities): no history available anywhere —
//     only "today" can be captured, from here forward.
//   - price_buildup, ethanol_prices, blend_config: not touched by this
//     script — no accessible automated source was found for build-up
//     components (see scripts/sources/README notes); these stay whatever
//     supabase/seed.sql inserted, updated manually as needed.

import { getSupabaseAdmin } from "../lib/supabaseAdmin";
import { loadCityIdMap } from "../lib/cities";
import { upsertCrudePrices, upsertFuelPrices } from "../lib/upsert";
import { fetchFxRateRange, FX_HISTORY_START } from "../sources/frankfurterFx";
import { fetchCrudeBasketCurrentFy } from "../sources/ppacCrudeBasket";
import { fetchMetroRspHistory } from "../sources/ppacMetroRsp";
import { fetchCityRetailToday, NON_METRO_CITY_NAMES } from "../sources/cityRetailPrices";
import type { CrudePrice, FuelPrice } from "../../lib/types";

const PPAC_METRO_PAGE =
  "https://ppac.gov.in/retail-selling-price-rsp-of-petrol-diesel-and-domestic-lpg/rsp-of-petrol-and-diesel-in-metro-cities-since-16-6-2017";
const GOODRETURNS_SOURCE = "https://www.goodreturns.in/petrol-price.html";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function backfillFxAndCrude(supabase: Awaited<ReturnType<typeof getSupabaseAdmin>>) {
  const [fxRows, crudeRows] = await Promise.all([
    fetchFxRateRange(FX_HISTORY_START, today()),
    fetchCrudeBasketCurrentFy().catch((err) => {
      console.error("Crude basket fetch failed, continuing with FX only:", err.message);
      return [] as Awaited<ReturnType<typeof fetchCrudeBasketCurrentFy>>;
    }),
  ]);

  const crudeByDate = new Map(crudeRows.map((r) => [r.date, r.indian_basket_usd]));
  const fxByDate = new Map(fxRows.map((r) => [r.date, r.usd_inr]));

  const combined: CrudePrice[] = fxRows.map((r) => ({
    date: r.date,
    usd_inr: r.usd_inr,
    indian_basket_usd: crudeByDate.get(r.date) ?? null,
  }));

  // Crude-basket points are month-anchored (the 1st); if that exact date has
  // no FX quote (weekend/holiday), fall back to the nearest earlier trading
  // day's rate rather than dropping the point outright — crude_prices.usd_inr
  // is NOT NULL, so every row needs some value.
  for (const [date, usd] of crudeByDate) {
    if (fxByDate.has(date)) continue;
    const nearby = fxRows.filter((r) => r.date <= date).at(-1);
    if (nearby) combined.push({ date, usd_inr: nearby.usd_inr, indian_basket_usd: usd });
    else console.error(`No FX rate found on or before ${date} — skipping crude basket point (usd_inr is required).`);
  }

  return upsertCrudePrices(supabase, combined);
}

async function backfillMetroFuelPrices(
  supabase: Awaited<ReturnType<typeof getSupabaseAdmin>>,
  cityIds: Awaited<ReturnType<typeof loadCityIdMap>>
) {
  const metroRows = await fetchMetroRspHistory();
  const fuelPrices: FuelPrice[] = metroRows.flatMap((r) => {
    const city_id = cityIds.byName.get(r.city);
    if (!city_id) {
      console.error(`Metro city "${r.city}" not found in cities table — skipping its rows.`);
      return [];
    }
    return [{
      city_id,
      date: r.date,
      petrol_retail: r.petrol_retail,
      diesel_retail: r.diesel_retail,
      source_url: PPAC_METRO_PAGE,
    }];
  });
  return upsertFuelPrices(supabase, fuelPrices);
}

async function backfillNonMetroToday(
  supabase: Awaited<ReturnType<typeof getSupabaseAdmin>>,
  cityIds: Awaited<ReturnType<typeof loadCityIdMap>>
) {
  const rows: FuelPrice[] = [];
  for (const cityName of NON_METRO_CITY_NAMES) {
    const city_id = cityIds.byName.get(cityName);
    if (!city_id) {
      console.error(`Non-metro city "${cityName}" not found in cities table — skipping.`);
      continue;
    }
    try {
      const r = await fetchCityRetailToday(cityName);
      rows.push({
        city_id,
        date: r.date,
        petrol_retail: r.petrol_retail,
        diesel_retail: r.diesel_retail,
        source_url: GOODRETURNS_SOURCE,
      });
    } catch (err) {
      console.error(`Non-metro retail fetch failed for ${cityName}, skipping:`, (err as Error).message);
    }
  }
  return upsertFuelPrices(supabase, rows);
}

async function summarize(table: string) {
  const supabase = getSupabaseAdmin();
  const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
  const { data: minRow } = await supabase.from(table).select("date").order("date", { ascending: true }).limit(1);
  const { data: maxRow } = await supabase.from(table).select("date").order("date", { ascending: false }).limit(1);
  console.log(`  ${table}: ${count ?? "?"} rows, ${minRow?.[0]?.date ?? "—"} to ${maxRow?.[0]?.date ?? "—"}`);
}

async function main() {
  const supabase = getSupabaseAdmin();
  const cityIds = await loadCityIdMap(supabase);

  console.log("Backfilling FX (deep) + Indian Crude Basket (current FY only)...");
  console.log(" ", await backfillFxAndCrude(supabase));

  console.log("Backfilling PPAC metro RSP (deep, since 2017-06-16)...");
  console.log(" ", await backfillMetroFuelPrices(supabase, cityIds));

  console.log("Backfilling non-metro city retail (today only — no public history exists)...");
  console.log(" ", await backfillNonMetroToday(supabase, cityIds));

  console.log("\nBackfill summary:");
  await summarize("crude_prices");
  await summarize("fuel_prices");
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exitCode = 1;
});
