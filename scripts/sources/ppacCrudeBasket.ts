// Indian Crude Basket FOB price ($/bbl) — PPAC's "International Prices of
// Crude Oil" page.
//
// Verified by hand: the page's own "Download Historical Report" control is
// login-gated (class `reportDownloadWithLogin`, opens a sign-in modal) — we
// don't have a PPAC account and this project won't attempt to work around
// that gate. The "Download Current Report" control (`reportDownloadWithoutLogin`)
// IS freely accessible, but only serves the *current financial year's*
// monthly averages (India's FY runs April-March) — typically 1-12 data
// points, not a deep daily series. That's the real, honest ceiling on how
// much crude-basket history this source can give us; FX (frankfurterFx.ts)
// remains the deep series. Every ingestion run appends whatever the current
// FY has published so far, so depth grows by ~1 point/month over time.
//
// The underlying call is the same XHR the page itself makes on load
// (found by reading the page's inline <script>, not a documented API):
//   POST https://ppac.gov.in/AjaxController/getInternationalPricesCrudeOil
//   body: financialYear=<FY>&reportBy=4&pageId=<id>
// reportBy=4 means "$/bbl." (the only unit offered). financialYear and
// pageId are re-read from the page on every call rather than hardcoded, in
// case PPAC ever changes the current FY option or the CMS page id.

const PAGE_URL = "https://ppac.gov.in/prices/international-prices-of-crude-oil";
const AJAX_URL = "https://ppac.gov.in/AjaxController/getInternationalPricesCrudeOil";
const USER_AGENT = "Mozilla/5.0 (compatible; FuelLedger-ingest/1.0)";

const MONTH_TO_NUM: Record<string, string> = {
  april: "04", may: "05", june: "06", july: "07", august: "08", september: "09",
  october: "10", november: "11", december: "12", january: "01", february: "02", march: "03",
};
// India's FY runs April-March: Apr-Dec fall in the FY's first calendar year, Jan-Mar in its second.
const FY_FIRST_YEAR_MONTHS = new Set(["april", "may", "june", "july", "august", "september", "october", "november", "december"]);

interface CrudeReportRow {
  title: string;
  [month: string]: string | number;
}

interface AjaxResponse {
  result: Record<string, CrudeReportRow> | null;
}

export interface CrudeBasketRow {
  date: string; // YYYY-MM-01 — monthly average, anchored to the 1st
  indian_basket_usd: number;
}

async function fetchPageContext(): Promise<{ financialYear: string; pageId: string }> {
  const res = await fetch(PAGE_URL, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`PPAC crude price page fetch failed: ${res.status} ${res.statusText}`);
  const html = await res.text();

  const fyMatch = html.match(/<select[^>]*id="financialYear"[\s\S]*?<option value="([^"]+)" selected>/);
  const pageIdMatch = html.match(/id="page_id"\s+value="(\d+)"/);
  if (!fyMatch || !pageIdMatch) {
    throw new Error("Could not find financialYear/page_id on the PPAC crude price page — page structure may have changed.");
  }
  return { financialYear: fyMatch[1], pageId: pageIdMatch[1] };
}

function rowsFromReport(financialYear: string, row: CrudeReportRow): CrudeBasketRow[] {
  // financialYear looks like "2026-2027"; the report's own "title" (e.g. "2026-27")
  // is a display label, not reliably parseable — derive the calendar year from financialYear instead.
  const [fyStartYear] = financialYear.split("-");
  const rows: CrudeBasketRow[] = [];
  for (const [month, num] of Object.entries(MONTH_TO_NUM)) {
    const raw = row[month];
    if (raw === "" || raw == null) continue;
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    const year = FY_FIRST_YEAR_MONTHS.has(month) ? fyStartYear : String(Number(fyStartYear) + 1);
    rows.push({ date: `${year}-${num}-01`, indian_basket_usd: value });
  }
  return rows.sort((a, b) => a.date.localeCompare(b.date));
}

/** Fetches the current financial year's published monthly Indian Crude Basket averages. */
export async function fetchCrudeBasketCurrentFy(): Promise<CrudeBasketRow[]> {
  const { financialYear, pageId } = await fetchPageContext();

  const res = await fetch(AJAX_URL, {
    method: "POST",
    headers: {
      "User-Agent": USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: new URLSearchParams({ financialYear, reportBy: "4", pageId }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`PPAC crude basket AJAX call failed: ${res.status} ${res.statusText}`);

  const body = (await res.json()) as AjaxResponse;
  const monthlyRow = body.result?.["1"];
  if (!monthlyRow) throw new Error("PPAC crude basket AJAX response had no data row at index 1 — response shape may have changed.");

  return rowsFromReport(financialYear, monthlyRow);
}
