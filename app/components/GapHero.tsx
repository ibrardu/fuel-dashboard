"use client";

import { annualImpact } from "@/lib/costModel";
import type { DashboardModel } from "@/lib/model";

const inr = (n: number, digits = 2) => `₹${n.toFixed(digits)}`;

export type ViewMode = "litre" | "energy";

export default function GapHero({ model, view }: { model: DashboardModel; view: ViewMode }) {
  const { delhi, energyFactor, blendPct, kmPerYear, kmplE0 } = model;

  // Per-litre view: the pass-through gap (quoted − fair). Energy view: what the
  // 3.6% energy shortfall costs per litre at the pump price.
  const headline = view === "litre" ? delhi.gap : delhi.energy_penalty;
  const overpaying = headline > 0;
  const annual = annualImpact({
    per_litre: Math.abs(headline),
    km_per_year: kmPerYear,
    kmpl_e0: kmplE0,
    energy_factor: energyFactor,
  });

  const f = view === "energy" ? 1 / energyFactor : 1;

  return (
    <section className="card">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="uppercase tracking-[3px] text-xs text-emerald-500 font-medium">
            Delhi · E{blendPct} petrol
          </div>
          <div
            className={`mt-3 text-6xl font-semibold tracking-tighter tabular-nums ${
              overpaying ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {inr(Math.abs(headline))}
            <span className="text-2xl text-slate-400 font-normal"> /L</span>
          </div>
          <p className="mt-3 text-lg text-slate-300 max-w-md">
            {view === "litre" ? (
              overpaying ? (
                <>what you overpay on every litre — blending savings that were never passed through to the pump.</>
              ) : (
                <>
                  is what blending currently <span className="text-slate-100 font-medium">adds</span>{" "}
                  to the fair
                  cost of a litre — at today&apos;s procurement prices, ethanol is dearer than the petrol it
                  displaces, so there is no pass-through saving to withhold.
                </>
              )
            ) : (
              <>
                the hidden energy cost in every litre: E{blendPct} carries ≈{" "}
                {Math.round((1 - energyFactor) * 1000) / 10}% less energy than pure petrol, so a litre at{" "}
                {inr(delhi.quoted)} really costs {inr(delhi.effective_retail)} per petrol-equivalent litre.
              </>
            )}
          </p>
          <p className="mt-4 text-sm text-slate-400">
            For a 2-wheeler doing {kmPerYear.toLocaleString("en-IN")} km/yr ≈{" "}
            <span className="font-mono text-slate-200">₹{Math.round(annual).toLocaleString("en-IN")}/yr</span>
            {view === "litre" && !overpaying ? " of extra blend cost in the fair price" : ""}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="stat">
            <div className="stat-label">Quoted pump price</div>
            <div className="stat-value">{inr(delhi.quoted * f)}</div>
            <div className="stat-sub">what politicians cite</div>
          </div>
          <div className="stat border-emerald-800/60">
            <div className="stat-label">Fair pass-through price</div>
            <div className="stat-value text-emerald-400">{inr(delhi.fair_retail * f)}</div>
            <div className="stat-sub">blended base + same taxes</div>
          </div>
          <div className="stat border-amber-800/60">
            <div className="stat-label">Real energy-adjusted</div>
            <div className="stat-value text-amber-400">{inr(delhi.effective_retail)}</div>
            <div className="stat-sub">per petrol-equivalent litre</div>
          </div>
        </div>
      </div>
    </section>
  );
}
