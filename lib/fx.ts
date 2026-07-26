// Live USD/INR spot rate, fetched server-side. Falls back to whatever the
// caller already has (the seed/Supabase crude_prices row) if the fetch
// fails, times out, or the API shape changes — this must never block the
// page render.

const FX_ENDPOINT = "https://open.er-api.com/v6/latest/USD";

export async function fetchLiveUsdInr(): Promise<number | null> {
  try {
    const res = await fetch(FX_ENDPOINT, {
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const rate = json?.rates?.INR;
    return typeof rate === "number" && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}
