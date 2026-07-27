// Daily ingestion entrypoint, run on a schedule by
// .github/workflows/ingest.yml. Each source is fetched and upserted
// independently — one source failing (a scraped page changing shape, a
// timeout, etc.) must not block the others. Every step is attempted before
// the process decides its exit code, so a partial failure still gets
// whatever data it could.

import { getSupabaseAdmin } from "../lib/supabaseAdmin";
import { loadCityIdMap } from "../lib/cities";
import { upsertCrudePrices, upsertFuelPrices } from "../lib/upsert";
import { fetchFxRateToday } from "../sources/frankfurterFx";
import { fetchCrudeBasketCurrentFy } from "../sources/ppacCrudeBasket";
import { fetchMetroRspHistory } from "../sources/ppacMetroRsp";
import { fetchCityRetailToday, NON_METRO_CITY_NAMES } from "../sources/cityRetailPrices";
import type { CrudePrice, FuelPrice } from "../../lib/types";

const PPAC_METRO_PAGE =
  "https://ppac.gov.in/retail-selling-price-rsp-of-petrol-diesel-and-domestic-lpg/rsp-of-petrol-and-diesel-in-metro-cities-since-16-6-2017";
const GOODRETURNS_SOURCE = "https://www.goodreturns.in/petrol-price.html";

// PPAC's PDF is re-parsed in full every run (there's no "just today" variant
// of that source), but only recent rows are re-upserted — old history was
// already written by the backfill and doesn't need daily rewriting. Wide
// enough to catch same-week revisions PPAC sometimes makes to recent dates.
const RECENT_WINDOW_DAYS = 14;

interface StepResult {
  step: string;
  ok: boolean;
  detail: string;
}

async function step(name: string, fn: () => Promise<string>): Promise<StepResult> {
  try {
    const detail = await fn();
    console.log(`[ok] ${name}: ${detail}`);
    return { step: name, ok: true, detail };
  } catch (err) {
    const message = (err as Error).message ?? String(err);
    console.error(`[fail] ${name}: ${message}`);
    return { step: name, ok: false, detail: message };
  }
}

function recentCutoff(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - RECENT_WINDOW_DAYS);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const supabase = getSupabaseAdmin();
  const cityIds = await loadCityIdMap(supabase);
  const results: StepResult[] = [];

  results.push(
    await step("fx + crude basket", async () => {
      const [fx, crudeRows] = await Promise.all([fetchFxRateToday(), fetchCrudeBasketCurrentFy()]);
      if (!fx) throw new Error("Frankfurter returned no rate for today");

      const latestCrude = crudeRows.at(-1);
      const rows: CrudePrice[] = [{ date: fx.date, usd_inr: fx.usd_inr, indian_basket_usd: latestCrude?.indian_basket_usd ?? null }];
      if (latestCrude && latestCrude.date !== fx.date) {
        rows.push({ date: latestCrude.date, usd_inr: fx.usd_inr, indian_basket_usd: latestCrude.indian_basket_usd });
      }
      const result = await upsertCrudePrices(supabase, rows);
      if (result.error) throw new Error(result.error);
      return `upserted ${result.attempted} row(s), usd_inr=${fx.usd_inr}`;
    })
  );

  results.push(
    await step("PPAC metro RSP", async () => {
      const cutoff = recentCutoff();
      const allRows = await fetchMetroRspHistory();
      const recent = allRows.filter((r) => r.date >= cutoff);

      const fuelPrices: FuelPrice[] = recent.flatMap((r) => {
        const city_id = cityIds.byName.get(r.city);
        if (!city_id) return [];
        return [{ city_id, date: r.date, petrol_retail: r.petrol_retail, diesel_retail: r.diesel_retail, source_url: PPAC_METRO_PAGE }];
      });
      const result = await upsertFuelPrices(supabase, fuelPrices);
      if (result.error) throw new Error(result.error);
      return `upserted ${result.attempted} row(s) from the last ${RECENT_WINDOW_DAYS} days`;
    })
  );

  for (const cityName of NON_METRO_CITY_NAMES) {
    results.push(
      await step(`non-metro retail: ${cityName}`, async () => {
        const city_id = cityIds.byName.get(cityName);
        if (!city_id) throw new Error(`"${cityName}" not found in cities table`);
        const r = await fetchCityRetailToday(cityName);
        const result = await upsertFuelPrices(supabase, [
          { city_id, date: r.date, petrol_retail: r.petrol_retail, diesel_retail: r.diesel_retail, source_url: GOODRETURNS_SOURCE },
        ]);
        if (result.error) throw new Error(result.error);
        return `petrol ${r.petrol_retail}, diesel ${r.diesel_retail ?? "—"}`;
      })
    );
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} steps succeeded.`);
  if (failed.length > 0) {
    console.error(`Failed: ${failed.map((f) => f.step).join(", ")}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Ingestion crashed before completing all steps:", err);
  process.exitCode = 1;
});
