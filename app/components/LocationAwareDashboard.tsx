"use client";

import { useEffect, useState } from "react";
import { LocateFixed, MapPin, ChevronDown } from "lucide-react";
import type { CityDetail, TrendPoint } from "@/lib/model";
import { nearestCityId } from "@/lib/geo";
import KpiStrip from "./KpiStrip";
import MobileHero from "./MobileHero";
import HeroCompare from "./HeroCompare";
import WhatIf from "./WhatIf";
import CityPrices from "./CityPrices";
import RealCostTrend from "./RealCostTrend";
import OmcProfits from "./OmcProfits";
import VehicleImpact from "./VehicleImpact";

const STORAGE_KEY = "fuelledger:cityId";

interface Props {
  cities: CityDetail[];
  defaultCityId: number;
  nationalBlendedCost: number;
  ethanolPrice: number;
  blendPct: number;
  crude: { usd: number | null; inr: number; date: string } | null;
  trend: TrendPoint[];
}

/**
 * Owns the location-aware city selection (default Delhi, geolocate on request,
 * or pick manually) and renders every section whose numbers depend on it.
 */
export default function LocationAwareDashboard({
  cities,
  defaultCityId,
  nationalBlendedCost,
  ethanolPrice,
  blendPct,
  crude,
  trend,
}: Props) {
  const [selectedCityId, setSelectedCityId] = useState(defaultCityId);
  const [locating, setLocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  useEffect(() => {
    // One-time hydration of a persisted choice: localStorage isn't available
    // during SSR, so this can't move into the useState initializer without
    // causing a hydration mismatch — the effect-based restore is intentional.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const storedId = stored ? Number(stored) : null;
    if (storedId && cities.some((c) => c.id === storedId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCityId(storedId);
    }
  }, [cities]);

  function selectCity(id: number) {
    setSelectedCityId(id);
    window.localStorage.setItem(STORAGE_KEY, String(id));
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setGeoMessage("Location isn't available in this browser.");
      return;
    }
    setLocating(true);
    setGeoMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const id = nearestCityId(pos.coords.latitude, pos.coords.longitude, cities);
        selectCity(id);
        setLocating(false);
      },
      () => {
        setGeoMessage("Couldn't get your location — showing the current city.");
        setLocating(false);
      },
      { timeout: 8000 }
    );
  }

  const activeCity = cities.find((c) => c.id === selectedCityId) ?? cities[0];

  return (
    <>
      <KpiStrip
        activeCity={activeCity}
        nationalBlendedCost={nationalBlendedCost}
        ethanolPrice={ethanolPrice}
        blendPct={blendPct}
        crude={crude}
      />

      <main className="mx-auto max-w-[1400px] space-y-4 px-4 pb-24 pt-4 sm:px-6 lg:space-y-5 lg:pb-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-white/[0.06] bg-surface/60 px-4 py-2.5 text-xs">
          <span className="inline-flex items-center gap-1.5 text-slate-300">
            <MapPin className="h-3.5 w-3.5 text-emerald-400" />
            Showing <span className="font-semibold text-white">{activeCity.name}</span>
            {activeCity.id === defaultCityId && <span className="text-slate-500">(default)</span>}
          </span>

          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-60"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            {locating ? "Locating…" : "Use my location"}
          </button>

          <label className="ml-auto inline-flex items-center gap-1.5 text-slate-400">
            <span className="hidden sm:inline">City</span>
            <span className="relative inline-flex items-center">
              <select
                value={selectedCityId}
                onChange={(e) => selectCity(Number(e.target.value))}
                className="appearance-none rounded-lg border border-white/10 bg-background py-1 pl-2.5 pr-6 text-xs font-medium text-slate-200 focus:border-emerald-500/50 focus:outline-none"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 h-3 w-3 text-slate-500" />
            </span>
          </label>

          {geoMessage && <span className="w-full text-amber-400/80">{geoMessage}</span>}
        </div>

        <MobileHero activeCity={activeCity} nationalBlendedCost={nationalBlendedCost} blendPct={blendPct} />

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <div className="space-y-4 lg:space-y-5">
            <HeroCompare
              activeCity={activeCity}
              nationalBlendedCost={nationalBlendedCost}
              ethanolPrice={ethanolPrice}
              blendPct={blendPct}
            />
            <WhatIf
              defaultBase={activeCity.basePrice}
              defaultEthanol={ethanolPrice}
              defaultBlendPct={blendPct}
              quotedRetail={activeCity.quoted}
            />
          </div>
          <div className="space-y-4 lg:space-y-5">
            <CityPrices cities={cities} nationalBlendedCost={nationalBlendedCost} activeCityId={activeCity.id} />
            <RealCostTrend trend={trend} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <OmcProfits />
          <VehicleImpact />
        </div>
      </main>
    </>
  );
}
