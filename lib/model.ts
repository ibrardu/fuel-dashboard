// Turns raw DB rows into the serializable view-model the page passes to the
// client islands. Pure — unit-testable alongside costModel.ts.

import { computeCost, type CostBreakdown } from "./costModel";
import type { DashboardData, PriceBuildup } from "./types";

export interface CityRow {
  name: string;
  state: string;
  quoted: number;
  fair: number;
  gap: number;
  effective: number;
}

export interface TrendPoint {
  date: string;
  quoted: number;
  fair: number;
  /** Real blended feedstock cost, ₹/L: (1−p)·base + p·ethanol. */
  blended: number;
  /** Diesel retail, ₹/L — reference only, not ethanol-blended. */
  diesel: number | null;
}

export interface WaterfallInput {
  base: number;
  freight: number;
  dealer: number;
  excise: number;
  vat: number;
  quoted: number;
  fair: number;
}

/** Full cost breakdown for one city — the location-aware unit the UI switches on. */
export interface CityDetail extends CostBreakdown {
  id: number;
  name: string;
  state: string;
  lat: number;
  lng: number;
  quoted: number;
  /** Diesel retail, ₹/L — reference only, not ethanol-blended. */
  dieselRetail: number | null;
  basePrice: number;
  waterfall: WaterfallInput;
}

export interface DashboardModel {
  asOf: string;
  blendPct: number;
  energyFactor: number;
  ethanolPrice: number;
  crude: { usd: number | null; inr: number; date: string } | null;
  delhi: CostBreakdown & { quoted: number; basePrice: number };
  waterfall: WaterfallInput;
  cities: CityRow[];
  cityDetails: CityDetail[];
  /** Real blended feedstock cost, ₹/L — national, identical across cities. */
  nationalBlendedCost: number;
  trend: TrendPoint[];
  kmPerYear: number;
  kmplE0: number;
}

function latestBuildupFor(data: DashboardData, cityId: number): PriceBuildup | undefined {
  return data.price_buildup
    .filter((b) => b.city_id === cityId)
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(-1);
}

function quotedRetailFor(data: DashboardData, cityId: number, onOrBefore?: string): number | undefined {
  const prices = data.fuel_prices
    .filter((p) => p.city_id === cityId && (!onOrBefore || p.date <= onOrBefore))
    .sort((a, b) => a.date.localeCompare(b.date));
  return (prices.at(-1) ?? data.fuel_prices.filter((p) => p.city_id === cityId).at(0))?.petrol_retail;
}

function dieselRetailFor(data: DashboardData, cityId: number, onOrBefore?: string): number | null {
  const prices = data.fuel_prices
    .filter((p) => p.city_id === cityId && (!onOrBefore || p.date <= onOrBefore))
    .sort((a, b) => a.date.localeCompare(b.date));
  const row = prices.at(-1) ?? data.fuel_prices.filter((p) => p.city_id === cityId).at(0);
  return row?.diesel_retail != null ? Number(row.diesel_retail) : null;
}

export function assumption(data: DashboardData, key: string, fallback: number): number {
  const row = data.assumptions.find((a) => a.key === key);
  return row ? Number(row.value) : fallback;
}

export function buildDashboardModel(data: DashboardData): DashboardModel {
  const blend = [...data.blend_config].sort((a, b) => a.effective_from.localeCompare(b.effective_from)).at(-1)!;
  const blendFraction = Number(blend.blend_pct) / 100;
  const energyFactor = Number(blend.energy_factor);

  const feedstockAvg =
    data.ethanol_prices.length > 0
      ? data.ethanol_prices.reduce((s, e) => s + Number(e.price_per_litre), 0) / data.ethanol_prices.length
      : 65;
  const ethanolPrice = assumption(data, "effective_ethanol_price", feedstockAvg);

  const cityModels = data.cities.map((city) => {
    const buildup = latestBuildupFor(data, city.id)!;
    const quoted = quotedRetailFor(data, city.id) ?? 0;
    const diesel = dieselRetailFor(data, city.id);
    const cost = computeCost({
      buildup: {
        base_price: Number(buildup.base_price),
        freight: Number(buildup.freight),
        dealer_commission: Number(buildup.dealer_commission),
        central_excise: Number(buildup.central_excise),
      },
      vat_rate: Number(city.vat_rate),
      quoted_retail: quoted,
      ethanol_price: ethanolPrice,
      blend_fraction: blendFraction,
      energy_factor: energyFactor,
    });
    return { city, buildup, quoted, diesel, cost };
  });

  const delhi = cityModels.find((m) => m.city.name === "Delhi") ?? cityModels[0];

  const trend: TrendPoint[] = data.price_buildup
    .filter((b) => b.city_id === delhi.city.id)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((b) => {
      const quoted = quotedRetailFor(data, delhi.city.id, b.date) ?? delhi.quoted;
      const cost = computeCost({
        buildup: {
          base_price: Number(b.base_price),
          freight: Number(b.freight),
          dealer_commission: Number(b.dealer_commission),
          central_excise: Number(b.central_excise),
        },
        vat_rate: Number(delhi.city.vat_rate),
        quoted_retail: quoted,
        ethanol_price: ethanolPrice,
        blend_fraction: blendFraction,
        energy_factor: energyFactor,
      });
      const diesel = dieselRetailFor(data, delhi.city.id, b.date);
      return { date: b.date, quoted, fair: cost.fair_retail, blended: cost.blended_base, diesel };
    });

  const latestCrude = [...data.crude_prices].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  const asOf = data.fuel_prices.map((p) => p.date).sort().at(-1) ?? delhi.buildup.date;

  return {
    asOf,
    blendPct: Number(blend.blend_pct),
    energyFactor,
    ethanolPrice,
    crude: latestCrude
      ? {
          usd: latestCrude.indian_basket_usd != null ? Number(latestCrude.indian_basket_usd) : null,
          inr: Number(latestCrude.usd_inr),
          date: latestCrude.date,
        }
      : null,
    delhi: { ...delhi.cost, quoted: delhi.quoted, basePrice: Number(delhi.buildup.base_price) },
    waterfall: {
      base: Number(delhi.buildup.base_price),
      freight: Number(delhi.buildup.freight),
      dealer: Number(delhi.buildup.dealer_commission),
      excise: Number(delhi.buildup.central_excise),
      vat: delhi.cost.vat,
      quoted: delhi.quoted,
      fair: delhi.cost.fair_retail,
    },
    cities: cityModels.map(({ city, quoted, cost }) => ({
      name: city.name,
      state: city.state,
      quoted,
      fair: cost.fair_retail,
      gap: cost.gap,
      effective: cost.effective_retail,
    })),
    cityDetails: cityModels.map(({ city, buildup, quoted, diesel, cost }) => ({
      ...cost,
      id: city.id,
      name: city.name,
      state: city.state,
      lat: Number(city.lat),
      lng: Number(city.lng),
      quoted,
      dieselRetail: diesel,
      basePrice: Number(buildup.base_price),
      waterfall: {
        base: Number(buildup.base_price),
        freight: Number(buildup.freight),
        dealer: Number(buildup.dealer_commission),
        excise: Number(buildup.central_excise),
        vat: cost.vat,
        quoted,
        fair: cost.fair_retail,
      },
    })),
    nationalBlendedCost: delhi.cost.blended_base,
    trend,
    kmPerYear: assumption(data, "two_wheeler_km_per_year", 10000),
    kmplE0: assumption(data, "two_wheeler_kmpl_e0", 50),
  };
}
