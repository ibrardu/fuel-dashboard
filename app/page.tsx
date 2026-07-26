import { Fuel, ExternalLink } from "lucide-react";
import { getDashboardData } from "@/lib/supabase";
import { buildDashboardModel } from "@/lib/model";
import { formatDate } from "@/lib/utils";
import DashboardSections from "./components/DashboardSections";
import InteractiveCalculator from "./components/InteractiveCalculator";
import CompatibilityTable from "./components/CompatibilityTable";
import Methodology from "./components/Methodology";

export const revalidate = 3600;

export default async function Page() {
  const { data, source } = await getDashboardData();
  const model = buildDashboardModel(data);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
              <Fuel className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight">FuelLedger</div>
              <div className="-mt-1 text-[10px] text-emerald-400">E20 real-cost dashboard</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="hidden items-center gap-2 text-slate-400 sm:flex">
              Data as of <span className="font-mono text-slate-300">{formatDate(model.asOf)}</span>
              <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-500">
                {source === "supabase" ? "live · Supabase" : "bundled seed"}
              </span>
            </div>
            <a
              href="https://ppac.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-emerald-400 hover:underline"
            >
              PPAC <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[3px] text-emerald-500">
              The quoted price vs the real cost
            </div>
            <h1 className="mt-1 text-4xl font-semibold tracking-tighter text-white">
              India moved petrol to E{model.blendPct}. What did that really do to the price of a litre?
            </h1>
            <p className="mt-2 max-w-2xl text-slate-400">
              Every litre of petrol is now {model.blendPct}% ethanol. This dashboard rebuilds the pump price from
              the PPAC build-up, swaps in the real blended feedstock cost, and shows the per-litre gap — including
              the energy you no longer get.
            </p>
          </div>

          <div className="flex gap-3 text-sm">
            {model.crude && (
              <div className="stat">
                <div className="stat-label">Indian basket crude</div>
                <div className="stat-value">${model.crude.usd.toFixed(1)}</div>
                <div className="stat-sub">USD/INR {model.crude.inr.toFixed(2)}</div>
              </div>
            )}
            <div className="stat">
              <div className="stat-label">Ethanol (landed)</div>
              <div className="stat-value">₹{model.ethanolPrice.toFixed(2)}</div>
              <div className="stat-sub">vs petrol base ₹{model.delhi.basePrice.toFixed(2)}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Blend mandate</div>
              <div className="stat-value">E{model.blendPct}</div>
              <div className="stat-sub">energy factor {model.energyFactor}</div>
            </div>
          </div>
        </div>

        <DashboardSections model={model} />

        <InteractiveCalculator
          defaultBase={model.delhi.basePrice}
          defaultEthanol={model.ethanolPrice}
          defaultBlendPct={model.blendPct}
          defaultEnergyFactor={model.energyFactor}
          quotedRetail={model.delhi.quoted}
        />

        <CompatibilityTable />

        <Methodology
          assumptions={data.assumptions}
          ethanolPrices={data.ethanol_prices}
          blendConfig={data.blend_config}
        />
      </main>

      <footer className="border-t border-slate-800 py-6">
        <div className="mx-auto max-w-7xl px-6 text-center text-[10px] text-slate-500">
          FuelLedger · estimates for education, not accusations — verify against PPAC and MoPNG before citing ·
          Next.js + Supabase
        </div>
      </footer>
    </div>
  );
}
