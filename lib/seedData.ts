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

// vat_rate is calibrated (not sourced) so base + freight + commission + excise,
// grossed up by VAT, reproduces the quoted metro RSPs below — see
// `retailFromBuildup` in costModel.ts. lat/lng are used for nearest-city
// geolocation matching.
export const SEED_CITIES: City[] = [
  { id: 1, name: "Delhi", state: "Delhi", vat_rate: 0.2407, lat: 28.6139, lng: 77.209 },
  { id: 2, name: "Mumbai", state: "Maharashtra", vat_rate: 0.354, lat: 19.076, lng: 72.8777 },
  { id: 3, name: "Kolkata", state: "West Bengal", vat_rate: 0.3722, lat: 22.5726, lng: 88.3639 },
  { id: 4, name: "Chennai", state: "Tamil Nadu", vat_rate: 0.3174, lat: 13.0827, lng: 80.2707 },
  { id: 5, name: "Bengaluru", state: "Karnataka", vat_rate: 0.346, lat: 12.9716, lng: 77.5946 },
  { id: 6, name: "Hyderabad", state: "Telangana", vat_rate: 0.404, lat: 17.385, lng: 78.4867 },
  { id: 7, name: "Pune", state: "Maharashtra", vat_rate: 0.3325, lat: 18.5204, lng: 73.8567 },
  { id: 8, name: "Ahmedabad", state: "Gujarat", vat_rate: 0.2091, lat: 23.0225, lng: 72.5714 },
  { id: 9, name: "Jaipur", state: "Rajasthan", vat_rate: 0.3634, lat: 26.9124, lng: 75.7873 },
  { id: 10, name: "Lucknow", state: "Uttar Pradesh", vat_rate: 0.2235, lat: 26.8467, lng: 80.9462 },
  { id: 11, name: "Chandigarh", state: "Chandigarh", vat_rate: 0.1638, lat: 30.7333, lng: 76.7794 },
  { id: 12, name: "Kochi", state: "Kerala", vat_rate: 0.3041, lat: 9.9312, lng: 76.2673 },
  { id: 13, name: "Bhopal", state: "Madhya Pradesh", vat_rate: 0.3322, lat: 23.2599, lng: 77.4126 },
  { id: 14, name: "Patna", state: "Bihar", vat_rate: 0.289, lat: 25.5941, lng: 85.1376 },
];

const CITY_RETAIL: Record<number, number> = {
  1: 102.12,
  2: 111.53,
  3: 113.09,
  4: 108.62,
  5: 110.9,
  6: 115.79,
  7: 109.8,
  8: 99.5,
  9: 112.5,
  10: 101.0,
  11: 96.0,
  12: 107.5,
  13: 110.0,
  14: 106.5,
};

const CITY_FREIGHT: Record<number, number> = {
  1: 0.24,
  2: 0.3,
  3: 0.35,
  4: 0.38,
  5: 0.32,
  6: 0.4,
  7: 0.33,
  8: 0.22,
  9: 0.45,
  10: 0.48,
  11: 0.42,
  12: 0.36,
  13: 0.5,
  14: 0.55,
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
// quoted-vs-fair trend chart; latest week matches the canonical ₹58.40 case
// (0.8 × 58.40 + 0.2 × 71.50 = ₹61.02 real blended cost).
const DELHI_WEEKLY_BASE: [string, number][] = [
  ["2026-04-27", 59.18],
  ["2026-05-04", 59.02],
  ["2026-05-11", 58.76],
  ["2026-05-18", 58.49],
  ["2026-05-25", 58.23],
  ["2026-06-01", 58.02],
  ["2026-06-08", 57.86],
  ["2026-06-15", 57.97],
  ["2026-06-22", 58.18],
  ["2026-06-29", 58.34],
  ["2026-07-06", 58.46],
  ["2026-07-13", 58.55],
  [LATEST_BUILDUP_DATE, 58.4],
];

export const SEED_PRICE_BUILDUP: PriceBuildup[] = [
  ...DELHI_WEEKLY_BASE.map(([date, base]) => buildup(1, date, base, 0.2407)),
  ...SEED_CITIES.filter((c) => c.id !== 1).map((c) =>
    buildup(c.id, LATEST_BUILDUP_DATE, 58.4, c.vat_rate)
  ),
];

// MoPNG announced procurement prices by feedstock, ESY 2025-26.
export const SEED_ETHANOL_PRICES: EthanolPrice[] = [
  { supply_year: "ESY 2025-26", feedstock: "C-heavy molasses", price_per_litre: 64.71, source_url: MOPNG },
  { supply_year: "ESY 2025-26", feedstock: "B-heavy molasses", price_per_litre: 67.8, source_url: MOPNG },
  { supply_year: "ESY 2025-26", feedstock: "Sugarcane juice / syrup", price_per_litre: 73.25, source_url: MOPNG },
  { supply_year: "ESY 2025-26", feedstock: "Maize (grain)", price_per_litre: 80.22, source_url: MOPNG },
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
    value: 71.5,
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
