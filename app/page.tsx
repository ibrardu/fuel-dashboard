"use client";

import { useState } from "react";
import { Fuel, RefreshCw, ExternalLink } from "lucide-react";
import CityPrices from "./components/CityPrices";
import InteractiveCalculator from "./components/InteractiveCalculator";
import E20Impact from "./components/E20Impact";
import CompatibilityTable from "./components/CompatibilityTable";
import PnlYoY from "./components/PnlYoY";
import TankerMap from "./components/TankerMap";
import LiveRateBadge from "./components/LiveRateBadge";
import HistoricalCurrency from "./components/HistoricalCurrency";

const LAST_UPDATED = "7 Jul 2026, 20:45 IST";

export default function FuelLedgerDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
              <Fuel className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-semibold tracking-tight text-xl">FuelLedger</div>
              <div className="text-[10px] text-slate-500 -mt-1">India Fuel • Ethanol • OMC Analytics</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="hidden sm:flex items-center gap-2 text-slate-400">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Last updated: <span className="font-mono text-slate-300">{LAST_UPDATED}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="btn flex items-center gap-1.5 text-xs"
              title="Refresh data views"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <a
              href="https://ppac.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center gap-1 text-emerald-400 hover:underline"
            >
              PPAC <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Hero / KPIs */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="uppercase tracking-[3px] text-xs text-emerald-500 font-medium">Professional Analytics</div>
            <h1 className="text-4xl font-semibold tracking-tighter text-white mt-1">India Fuel Dashboard</h1>
            <p className="mt-2 max-w-md text-slate-400">
              E20 blending, city prices, daily logging, vehicle impact, OMC financials &amp; tanker logistics.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <div className="kpi min-w-[118px]">
              <div className="text-xs text-slate-400">Avg Petrol (Delhi)</div>
              <div className="text-2xl font-semibold tabular-nums tracking-tight">₹102.12</div>
            </div>
            <div className="kpi min-w-[118px]">
              <div className="text-xs text-slate-400">Current Blend</div>
              <div className="text-2xl font-semibold tabular-nums tracking-tight">E20</div>
            </div>
            <div className="kpi min-w-[118px]">
              <div className="text-xs text-slate-400">OMC Profit Growth</div>
              <div className="text-2xl font-semibold tabular-nums tracking-tight text-emerald-400">+130%</div>
            </div>
            <LiveRateBadge />
          </div>
        </div>

        {/* City Prices */}
        <CityPrices key={`city-${refreshKey}`} />

        {/* Calculator + P&L side-by-side on wide */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <InteractiveCalculator key={`calc-${refreshKey}`} />
          </div>
          <div className="lg:col-span-2">
            <PnlYoY key={`pnl-${refreshKey}`} />
          </div>
        </div>

        {/* Historical Currency Data (replaces Daily Data Logger) */}
        <HistoricalCurrency />

        {/* E20 Impact + Compatibility */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <E20Impact key={`impact-${refreshKey}`} />
          </div>
          <div className="lg:col-span-2">
            <CompatibilityTable key={`compat-${refreshKey}`} />
          </div>
        </div>

        {/* Tanker Map - full width */}
        <TankerMap key={`tanker-${refreshKey}`} />

        {/* Footer / Notes */}
        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col md:flex-row gap-y-2 md:items-center md:justify-between">
          <div>
            Built for professional use. All data is for illustrative and educational purposes. 
            Verify against official PPAC, company filings, and OEM manuals before use.
          </div>
          <div className="font-mono">
            Recommended domains: fuelledger.in • fuelledger.app
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-[10px] text-slate-500">
          FuelLedger • Next.js + TypeScript + Tailwind • Sources: PPAC, ARAI Journal, Company Filings, MarineTraffic (embed)
        </div>
      </footer>
    </div>
  );
}
