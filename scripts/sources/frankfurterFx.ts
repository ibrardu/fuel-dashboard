// USD/INR exchange rate history — api.frankfurter.dev (ECB reference rates,
// free, no API key). Verified live: a single range call returns thousands of
// daily rates back to the earliest requested date.
//
// This is a separate, historical-storage concern from lib/fx.ts, which
// fetches today's live rate on every page render for display — that stays
// unchanged. This module is only for populating crude_prices.usd_inr.

const BASE_URL = "https://api.frankfurter.dev/v1";

export interface FxRate {
  date: string; // YYYY-MM-DD
  usd_inr: number;
}

// Frankfurter's /latest and range endpoints return differently-shaped
// `rates`: /latest is flat ({ INR: number }), the range endpoint nests one
// level deeper, keyed by date ({ "2026-07-27": { INR: number } }).
interface FrankfurterLatestResponse {
  amount: number;
  base: string;
  date: string;
  rates: { INR?: number };
}

interface FrankfurterRangeResponse {
  amount: number;
  base: string;
  start_date: string;
  end_date: string;
  rates: Record<string, { INR?: number }>;
}

// Verified by hand: a request starting 2000-01-03 404s outright (the whole
// range, not just the early dates), while 2000-06-01 succeeds — so ECB's
// INR reference series starts somewhere in H1 2000. Rather than hardcode a
// guessed exact cutover (getting it wrong loses the *entire* range, since
// Frankfurter 404s the whole request rather than returning partial data),
// start from a date confirmed safe and back off automatically if it still 404s.
export const FX_HISTORY_START = "2000-07-01";

async function fetchRangeOnce(startDate: string, endDate: string): Promise<Response> {
  const url = `${BASE_URL}/${startDate}..${endDate}?from=USD&to=INR`;
  return fetch(url, { signal: AbortSignal.timeout(30_000) });
}

/**
 * Fetches the full USD/INR daily series for [startDate, endDate]. If the
 * series doesn't go back as far as startDate, Frankfurter 404s the whole
 * request rather than truncating — so on a 404 this steps startDate forward
 * a year at a time and retries, up to a few attempts, instead of failing
 * the whole backfill over an unknown-in-advance history boundary.
 */
export async function fetchFxRateRange(startDate: string, endDate: string): Promise<FxRate[]> {
  let attemptStart = startDate;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetchRangeOnce(attemptStart, endDate);
    if (res.status === 404) {
      const nextYear = Number(attemptStart.slice(0, 4)) + 1;
      attemptStart = `${nextYear}-01-01`;
      if (attemptStart >= endDate) return [];
      continue;
    }
    if (!res.ok) throw new Error(`Frankfurter range fetch failed: ${res.status} ${res.statusText}`);

    const body = (await res.json()) as FrankfurterRangeResponse;
    return Object.entries(body.rates)
      .filter(([, r]) => r.INR != null)
      .map(([date, r]) => ({ date, usd_inr: r.INR! }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
  throw new Error(`Frankfurter range fetch: could not find a valid start date after backing off from ${startDate}`);
}

export async function fetchFxRateToday(): Promise<FxRate | null> {
  const res = await fetch(`${BASE_URL}/latest?from=USD&to=INR`, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) return null;

  const body = (await res.json()) as FrankfurterLatestResponse;
  const inr = body.rates.INR;
  const date = body.date;
  if (inr == null || !date) return null;
  return { date, usd_inr: inr };
}
