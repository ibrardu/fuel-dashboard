// PPAC's daily metro retail-selling-price PDF — the single richest real
// source this project has: verified by hand to contain the FULL daily
// history since 16-Jun-2017 (the day India moved to daily fuel-price
// revision), not just "today". One download covers ~3,300 days for all 4
// metro cities (Delhi, Mumbai, Chennai, Kolkata), petrol + diesel.
//
// The page linking to it always shows "Current" as the label; the actual
// PDF filename/URL changes daily (it embeds an upload timestamp), so the
// link has to be re-discovered from the listing page on every run rather
// than hardcoded.

import { PDFParse } from "pdf-parse";

const LISTING_PAGE_URL =
  "https://ppac.gov.in/retail-selling-price-rsp-of-petrol-diesel-and-domestic-lpg/rsp-of-petrol-and-diesel-in-metro-cities-since-16-6-2017";

const USER_AGENT = "Mozilla/5.0 (compatible; FuelLedger-ingest/1.0)";

// Column order in the PDF, left-to-right, for both the petrol and diesel tables.
const METRO_COLUMNS = ["Delhi", "Mumbai", "Chennai", "Kolkata"] as const;

const MONTHS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

// Matches one data row: "DD-Mon-YY p1 p2 p3 p4 DD-Mon-YY d1 d2 d3 d4"
// (petrol-table date/values, then diesel-table date/values — always equal).
const ROW_RE =
  /^(\d{1,2})-([A-Za-z]{3})-(\d{2})\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+\d{1,2}-[A-Za-z]{3}-\d{2}\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)$/;

export interface MetroRspRow {
  city: (typeof METRO_COLUMNS)[number];
  date: string; // YYYY-MM-DD
  petrol_retail: number;
  diesel_retail: number;
}

function toIsoDate(day: string, mon: string, twoDigitYear: string): string {
  const month = MONTHS[mon];
  if (!month) throw new Error(`Unrecognized month abbreviation: ${mon}`);
  // Series only ever spans 2017-2026+, so 20xx is unambiguous.
  const year = `20${twoDigitYear}`;
  return `${year}-${month}-${day.padStart(2, "0")}`;
}

async function findTodaysPdfUrl(): Promise<string> {
  const res = await fetch(LISTING_PAGE_URL, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`PPAC listing page fetch failed: ${res.status} ${res.statusText}`);
  const html = await res.text();

  const match = html.match(/href="(https:\/\/ppac\.gov\.in\/uploads\/page-images\/[^"]*DailyPriceMSHSD_Metro[^"]*\.pdf)"/i);
  if (!match) throw new Error("Could not find the metro RSP PDF link on the PPAC listing page — page structure may have changed.");
  return match[1];
}

/** Parses the full text of the metro RSP PDF into per-city, per-day rows. */
export function parseMetroRspText(text: string): MetroRspRow[] {
  const rows: MetroRspRow[] = [];
  for (const line of text.split("\n")) {
    const m = ROW_RE.exec(line.trim());
    if (!m) continue;
    const [, day, mon, yy, p1, p2, p3, p4, d1, d2, d3, d4] = m;
    const date = toIsoDate(day, mon, yy);
    const petrol = [p1, p2, p3, p4];
    const diesel = [d1, d2, d3, d4];
    METRO_COLUMNS.forEach((city, i) => {
      rows.push({ city, date, petrol_retail: Number(petrol[i]), diesel_retail: Number(diesel[i]) });
    });
  }
  return rows;
}

/** Fetches and parses PPAC's metro RSP PDF. Returns the full available history in one call. */
export async function fetchMetroRspHistory(): Promise<MetroRspRow[]> {
  const pdfUrl = await findTodaysPdfUrl();
  const res = await fetch(pdfUrl, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`PPAC metro RSP PDF fetch failed: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const parser = new PDFParse({ data: buf });
  try {
    const result = await parser.getText();
    return parseMetroRspText(result.text);
  } finally {
    await parser.destroy();
  }
}
