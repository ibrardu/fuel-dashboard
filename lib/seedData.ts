// Fallback dataset mirroring supabase/seed.sql. Used when the Supabase env
// vars are absent or a fetch fails, so the dashboard renders fully without a
// configured project. All values are deterministic (no Date.now / random) so
// server renders are stable.

import type {
  Assumption,
  BlendConfig,
  City,
  CrudePrice,
  DashboardData,
  EthanolPrice,
  FuelPrice,
  PriceBuildup,
} from "./types";

const PPAC = "https://ppac.gov.in/";
const MOPNG = "https://mopng.gov.in/en/refining/ethanol-blended-petrol";

// vat_rate calibrated so base + freight + commission + excise, grossed up by
// VAT, reproduces the quoted metro RSPs.
export const SEED_CITIES: City[] = [
  { id: 1, name: "Delhi", state: "Delhi", vat_rate: 0.194 },
  { id: 2, name: "Mumbai", state: "Maharashtra", vat_rate: 0.303 },
  { id: 3, name: "Kolkata", state: "West Bengal", vat_rate: 0.3205 },
  { id: 4, name: "Chennai", state: "Tamil Nadu", vat_rate: 0.2678 },
  { id: 5, name: "Bengaluru", state: "Karnataka", vat_rate: 0.2954 },
  { id: 6, name: "Hyderabad", state: "Telangana", vat_rate: 0.3512 },
];

const CITY_RETAIL: Record<number, number> = {
  1: 94.77,
  2: 103.5,
  3: 104.95,
  4: 100.8,
  5: 102.92,
  6: 107.46,
};

const CITY_FREIGHT: Record<number, number> = {
  1: 0.24,
  2: 0.3,
  3: 0.35,
  4: 0.38,
  5: 0.32,
  6: 0.4,
};

const DEALER_COMMISSION = 3.77;
const CENTRAL_EXCISE = 19.9;
const LATEST_BUILDUP_DATE = "2026-07-20";
const HISTORY_END = "2026-07-25";
const HISTORY_DAYS = 90;

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const round2 = (n: number) => Math.round(n * 100) / 100;

// ~90 days of daily retail quotes per city. Pump prices have been flat — that
// is the point the trend chart makes.
export const SEED_FUEL_PRICES: FuelPrice[] = SEED_CITIES.flatMap((city) =>
  Array.from({ length: HISTORY_DAYS }, (_, i) => ({
    city_id: city.id,
    date: addDays(HISTORY_END, i - (HISTORY_DAYS - 1)),
    petrol_retail: CITY_RETAIL[city.id],
    diesel_retail: null,
    source_url: PPAC,
  }))
);

function buildup(cityId: number, date: string, basePrice: number, vatRate: number): PriceBuildup {
  const freight = CITY_FREIGHT[cityId];
  const preTax = basePrice + freight + DEALER_COMMISSION + CENTRAL_EXCISE;
  return {
    city_id: cityId,
    date,
    base_price: basePrice,
    freight,
    dealer_commission: DEALER_COMMISSION,
    central_excise: CENTRAL_EXCISE,
    state_vat: round2(preTax * vatRate),
  };
}

// Weekly Delhi base-price snapshots (refinery-gate drift with crude) for the
// quoted-vs-fair trend chart; latest week matches the canonical ₹55.46 case.
const DELHI_WEEKLY_BASE: [string, number][] = [
  ["2026-04-27", 56.2],
  ["2026-05-04", 56.05],
  ["2026-05-11", 55.8],
  ["2026-05-18", 55.55],
  ["2026-05-25", 55.3],
  ["2026-06-01", 55.1],
  ["2026-06-08", 54.95],
  ["2026-06-15", 55.05],
  ["2026-06-22", 55.25],
  ["2026-06-29", 55.4],
  ["2026-07-06", 55.52],
  ["2026-07-13", 55.6],
  [LATEST_BUILDUP_DATE, 55.46],
];

export const SEED_PRICE_BUILDUP: PriceBuildup[] = [
  ...DELHI_WEEKLY_BASE.map(([date, base]) => buildup(1, date, base, 0.194)),
  ...SEED_CITIES.filter((c) => c.id !== 1).map((c) =>
    buildup(c.id, LATEST_BUILDUP_DATE, 55.46, c.vat_rate)
  ),
];

// MoPNG announced procurement prices by feedstock, ESY 2025-26.
export const SEED_ETHANOL_PRICES: EthanolPrice[] = [
  { supply_year: "ESY 2025-26", feedstock: "C-heavy molasses", price_per_litre: 57.97, source_url: MOPNG },
  { supply_year: "ESY 2025-26", feedstock: "B-heavy molasses", price_per_litre: 60.73, source_url: MOPNG },
  { supply_year: "ESY 2025-26", feedstock: "Sugarcane juice / syrup", price_per_litre: 65.61, source_url: MOPNG },
  { supply_year: "ESY 2025-26", feedstock: "Maize (grain)", price_per_litre: 71.86, source_url: MOPNG },
];

export const SEED_BLEND_CONFIG: BlendConfig[] = [
  { effective_from: "2019-04-01", blend_pct: 10, energy_factor: 0.982 },
  { effective_from: "2023-06-01", blend_pct: 12, energy_factor: 0.978 },
  { effective_from: "2024-11-01", blend_pct: 15, energy_factor: 0.973 },
  { effective_from: "2025-04-01", blend_pct: 20, energy_factor: 0.964 },
];

// Indian-basket crude with a gentle deterministic wobble, for context only.
export const SEED_CRUDE_PRICES: CrudePrice[] = Array.from({ length: HISTORY_DAYS }, (_, i) => ({
  date: addDays(HISTORY_END, i - (HISTORY_DAYS - 1)),
  indian_basket_usd: round2(68.5 + 2.8 * Math.sin(i / 9)),
  usd_inr: round2(86.1 + 0.5 * Math.sin(i / 14 + 1)),
}));

export const SEED_ASSUMPTIONS: Assumption[] = [
  {
    key: "effective_ethanol_price",
    value: 65.0,
    note: "Volume-weighted average OMC landed cost of ethanol incl. GST & transport (estimate across feedstocks)",
    source_url: MOPNG,
    as_of: "2026-07-01",
  },
  {
    key: "two_wheeler_km_per_year",
    value: 10000,
    note: "Typical annual usage for the annualised-impact figure",
    source_url: null,
    as_of: "2026-07-01",
  },
  {
    key: "two_wheeler_kmpl_e0",
    value: 50,
    note: "Typical 2-wheeler mileage on E0 petrol, km/L",
    source_url: null,
    as_of: "2026-07-01",
  },
];

export const SEED_DATA: DashboardData = {
  cities: SEED_CITIES,
  fuel_prices: SEED_FUEL_PRICES,
  price_buildup: SEED_PRICE_BUILDUP,
  ethanol_prices: SEED_ETHANOL_PRICES,
  blend_config: SEED_BLEND_CONFIG,
  crude_prices: SEED_CRUDE_PRICES,
  assumptions: SEED_ASSUMPTIONS,
};
