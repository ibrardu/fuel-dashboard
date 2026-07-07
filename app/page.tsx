"use client";

import { useState } from "react";
import { Fuel, RefreshCw, ExternalLink } from "lucide-react";
import CityPrices from "./components/CityPrices";
import InteractiveCalculator from "./components/InteractiveCalculator";
import E20Impact from "./components/E20Impact";
import CompatibilityTable from "./components/CompatibilityTable";
import PnlYoY from "./components/PnlYoY";
import TankerMap from "./components/TankerMap";
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
              <div className="text-[10px] text-emerald-400 -mt-1">With proper Ethanol Blending Adjustment</div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. Indian Basket Crude */}
            <div className="kpi">
              <div className="text-xs text-slate-400">INDIAN BASKET CRUDE</div>
              <div className="text-2xl font-semibold tabular-nums tracking-tight">$68.7 <span className="text-sm text-red-400">(−$3.2 today)</span></div>
              <div className="text-[10px] text-slate-500 mt-1">Source: PPAC • 7 Jul 2026</div>
            </div>

            {/* 2. Delhi Petrol Retail */}
            <div className="kpi">
              <div className="text-xs text-slate-400">DELHI PETROL RETAIL</div>
              <div className="text-2xl font-semibold tabular-nums tracking-tight">₹102.12 <span className="text-sm text-slate-400">(No change today)</span></div>
              <div className="text-[10px] text-slate-500 mt-1">Source: PPAC • Metro RSP</div>
            </div>

            {/* 3. Ethanol Blending */}
            <div className="kpi">
              <div className="text-xs text-slate-400">ETHANOL BLENDING</div>
              <div className="text-2xl font-semibold tabular-nums tracking-tight">20%</div>
              <div className="text-[10px] text-emerald-400 mt-1">E20 • Nationwide since Apr 2026</div>
            </div>

            {/* 4. Ethanol Cost to OMC */}
            <div className="kpi">
              <div className="text-xs text-slate-400">ETHANOL COST TO OMC</div>
              <div className="text-2xl font-semibold tabular-nums tracking-tight">₹71.50 /L</div>
              <div className="text-[10px] text-slate-500 mt-1">(incl. GST + transport)<br />MoPNG weighted avg • ESY 2025-26</div>
            </div>

            {/* 5. Blended E20 Feedstock Cost */}
            <div className="kpi">
              <div className="text-xs text-slate-400">BLENDED E20 FEEDSTOCK COST (TO OMC)</div>
              <div className="text-2xl font-semibold tabular-nums tracking-tight">₹58.40 /L</div>
              <div className="text-[10px] text-slate-500 mt-1">80% Petrol base + 20% Ethanol @ ₹71.50. This is the real input cost OMCs pay — much lower than pure petrol would be.</div>
            </div>
          </div>
        </div>

        {/* City Prices */}
        <CityPrices key={`city-${refreshKey}`} />

        {/* E20 Cost Breakdown (per litre) */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="section-title">E20 Cost Breakdown (per litre) — Delhi example</h2>
              <p className="subtle">Real OMC feedstock economics with 20% ethanol blending</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>80% Motor Spirit (base petrol)</span>
              <span className="font-mono">₹46.72</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>20% Ethanol</span>
              <span className="font-mono">₹14.30</span>
            </div>
            <div className="flex justify-between font-semibold border-b border-slate-800 pb-2 text-emerald-400">
              <span>Total OMC Feedstock Cost</span>
              <span className="font-mono">₹61.02</span>
            </div>
            <div className="flex justify-between">
              <span>Retail Price (Delhi)</span>
              <span className="font-mono">₹102.12</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800 font-medium">
              <span>Est. Gross Margin (before other costs)</span>
              <span className="font-mono text-emerald-400">~ ₹41 /L</span>
            </div>
          </div>

          <p className="source mt-4">
            Based on current MoPNG ethanol pricing and typical OMC landed costs for BS-VI compliant fuel.
          </p>
        </div>

        {/* Crude vs Retail: The Missing Adjustment */}
        <div>
          <h2 className="section-title mb-4">Crude vs Retail: The Missing Adjustment</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Without */}
            <div className="border border-red-900/50 bg-red-950/20 rounded-xl p-5">
              <div className="uppercase text-xs tracking-wider text-red-400 mb-2 font-medium">WITHOUT ETHANOL ADJUSTMENT (Misleading)</div>
              <div className="space-y-2 text-sm text-slate-300">
                <p>Crude at $68.7/bbl is assumed to fully drive retail prices with no credit for blending.</p>
                <p>Retail ₹102.12 looks like it has very high margins or &quot;windfall&quot;.</p>
                <p>Ignores that 20% of the fuel is now cheaper ethanol, distorting the picture of OMC profitability and policy impact.</p>
              </div>
            </div>

            {/* With */}
            <div className="border border-emerald-900/50 bg-emerald-950/20 rounded-xl p-5">
              <div className="uppercase text-xs tracking-wider text-emerald-400 mb-2 font-medium">WITH ETHANOL ADJUSTMENT (Correct)</div>
              <div className="space-y-2 text-sm text-slate-300">
                <p>Real blended feedstock cost drops to ~₹58–61/L thanks to 20% ethanol @ ₹71.50.</p>
                <p>Retail price of ₹102.12 reflects taxes + marketing + the adjusted input cost.</p>
                <p>Shows sustainable economics and the true benefit of E20 policy.</p>
              </div>
            </div>
          </div>

          {/* Key Insight */}
          <div className="mt-4 p-4 bg-slate-900 border border-slate-700 rounded-xl">
            <div className="font-semibold text-emerald-400 mb-1">Key Insight</div>
            <div className="text-sm text-slate-300">
              Proper ethanol blending adjustment is essential for accurate analysis. It strengthens India’s energy security, saves valuable foreign exchange on crude imports, and directly supports farmer incomes through the ethanol program.
            </div>
          </div>
        </div>

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
