// Per-city petrol/diesel retail prices for the ~10 non-metro cities that
// PPAC's metro RSP PDF (ppacMetroRsp.ts) doesn't cover.
//
// Investigated and ruled out first, in order:
//   - BPCL's own "Petro Prices" page: the MS/HSD (petrol/diesel) price
//     button exists in the markup but its containing <li> is
//     `style="display:none"` — the live-price widget has been disabled
//     server-side.
//   - HPCL's "Price Buildup" page: a client-rendered SPA behind Cloudflare;
//     no price API call could be found in its shipped JS within a
//     reasonable amount of digging.
//   - IOCL's official price page: served behind a Sucuri CloudProxy
//     JS-challenge (`iocl.com/petrol-diesel-price` 307-redirects to a
//     "please enable javascript" interstitial) — not fetchable without a
//     real browser.
// None of the three OMCs expose a scrapable per-city price source. The
// fallback used here — goodreturns.in — is a real, apparently genuinely
// daily-updated news aggregator (its per-city page <title> embeds today's
// date and price server-side, verified by hand against the actual current
// date), not an official government/OMC source. Treat it as exactly that:
// a last-resort, single-vendor, unofficial source that can break or change
// structure without notice — hence the defensive regex + per-city
// try/catch in the caller, not a hard dependency the rest of ingestion
// trusts blindly.

const USER_AGENT = "Mozilla/5.0 (compatible; FuelLedger-ingest/1.0)";

// This project's canonical city name -> goodreturns.in URL slug.
// Verified individually; Kochi has no "kochi" slug on this site, it's filed under "ernakulam".
const CITY_SLUGS: Record<string, string> = {
  Bengaluru: "bangalore",
  Hyderabad: "hyderabad",
  Pune: "pune",
  Ahmedabad: "ahmedabad",
  Jaipur: "jaipur",
  Lucknow: "lucknow",
  Chandigarh: "chandigarh",
  Kochi: "ernakulam",
  Bhopal: "bhopal",
  Patna: "patna",
};

const MONTHS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

// e.g. "Petrol Price in Bangalore, Petrol Rate Today (27th Jul, 2026), Rs. 111.37/Ltr - Goodreturns"
const TITLE_RE = /\((\d{1,2})\w{2}\s+([A-Za-z]{3})[,]?\s+(\d{4})\)[,]?\s*-?\s*Rs\.\s*([\d.]+)\s*\/Ltr/;

function parseTitlePrice(title: string): { date: string; price: number } | null {
  const m = TITLE_RE.exec(title);
  if (!m) return null;
  const [, day, mon, year, price] = m;
  const month = MONTHS[mon];
  if (!month) return null;
  return { date: `${year}-${month}-${day.padStart(2, "0")}`, price: Number(price) };
}

async function fetchFuelTitle(fuel: "petrol" | "diesel", slug: string): Promise<string> {
  const url = `https://www.goodreturns.in/${fuel}-price-in-${slug}.html`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`goodreturns ${fuel} fetch failed for ${slug}: ${res.status} ${res.statusText}`);
  const html = await res.text();
  const match = html.match(/<title>([^<]*)<\/title>/);
  if (!match) throw new Error(`goodreturns ${fuel} page for ${slug} had no <title> tag — page structure may have changed.`);
  return match[1];
}

export interface CityRetailRow {
  cityName: string; // this project's canonical name, e.g. "Bengaluru"
  date: string;
  petrol_retail: number;
  diesel_retail: number | null;
}

/** Fetches today's petrol+diesel retail price for one non-metro city. Throws on any failure — callers should isolate per-city. */
export async function fetchCityRetailToday(cityName: string): Promise<CityRetailRow> {
  const slug = CITY_SLUGS[cityName];
  if (!slug) throw new Error(`No goodreturns slug mapped for city "${cityName}"`);

  const petrolTitle = await fetchFuelTitle("petrol", slug);
  const petrol = parseTitlePrice(petrolTitle);
  if (!petrol) throw new Error(`Could not parse petrol price from title for ${cityName}: "${petrolTitle}"`);

  let diesel: number | null = null;
  try {
    const dieselTitle = await fetchFuelTitle("diesel", slug);
    diesel = parseTitlePrice(dieselTitle)?.price ?? null;
  } catch {
    // Diesel is a reference-only series in this app's cost model (E20 is petrol-only) — don't fail the whole city over it.
  }

  return { cityName, date: petrol.date, petrol_retail: petrol.price, diesel_retail: diesel };
}

export const NON_METRO_CITY_NAMES = Object.keys(CITY_SLUGS);
