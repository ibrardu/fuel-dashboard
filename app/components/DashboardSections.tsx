"use client";

import { useState } from "react";
import type { DashboardModel } from "@/lib/model";
import GapHero, { type ViewMode } from "./GapHero";
import PriceWaterfall from "./PriceWaterfall";
import TrendChart from "./TrendChart";
import CityGapTable from "./CityGapTable";

export default function DashboardSections({ model }: { model: DashboardModel }) {
  const [view, setView] = useState<ViewMode>("litre");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end gap-2 text-xs">
        <span className="text-slate-400">Show figures</span>
        <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900 p-0.5">
          <button
            onClick={() => setView("litre")}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              view === "litre" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Per litre
          </button>
          <button
            onClick={() => setView("energy")}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              view === "energy" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Energy-adjusted
          </button>
        </div>
      </div>

      <GapHero model={model} view={view} />

      <div className="grid gap-6 xl:grid-cols-2">
        <PriceWaterfall waterfall={model.waterfall} />
        <TrendChart trend={model.trend} energyFactor={model.energyFactor} view={view} />
      </div>

      <CityGapTable cities={model.cities} energyFactor={model.energyFactor} view={view} />
    </div>
  );
}
