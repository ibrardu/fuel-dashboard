// Row shapes mirror the Supabase schema (snake_case = DB column names),
// so rows from supabase-js and from lib/seedData.ts are interchangeable.

export interface City {
  id: number;
  name: string;
  state: string;
  /** Ad-valorem VAT rate on the pre-VAT price, e.g. 0.194 for Delhi. */
  vat_rate: number;
  /** Decimal degrees — used for nearest-city geolocation matching. */
  lat: number;
  lng: number;
}

export interface FuelPrice {
  id?: number;
  city_id: number;
  date: string; // YYYY-MM-DD
  petrol_retail: number;
  diesel_retail: number | null;
  source_url: string | null;
}

/** PPAC-style price build-up snapshot. state_vat is the ₹/L snapshot amount. */
export interface PriceBuildup {
  id?: number;
  city_id: number;
  date: string;
  base_price: number;
  freight: number;
  dealer_commission: number;
  central_excise: number;
  state_vat: number;
}

export interface EthanolPrice {
  id?: number;
  supply_year: string; // e.g. "ESY 2025-26"
  feedstock: string;
  price_per_litre: number;
  source_url: string | null;
}

export interface BlendConfig {
  id?: number;
  effective_from: string;
  /** Mandated blend share in percent, e.g. 20 for E20. */
  blend_pct: number;
  /** Energy content of the blend relative to E0 petrol, e.g. 0.964. */
  energy_factor: number;
}

export interface CrudePrice {
  id?: number;
  date: string;
  indian_basket_usd: number;
  usd_inr: number;
}

/** Named model assumptions surfaced in the Methodology section. */
export interface Assumption {
  id?: number;
  key: string;
  value: number;
  note: string | null;
  source_url: string | null;
  as_of: string | null;
}

export interface DashboardData {
  cities: City[];
  fuel_prices: FuelPrice[];
  price_buildup: PriceBuildup[];
  ethanol_prices: EthanolPrice[];
  blend_config: BlendConfig[];
  crude_prices: CrudePrice[];
  assumptions: Assumption[];
}
