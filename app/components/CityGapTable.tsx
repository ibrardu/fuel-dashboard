"use client";

import type { CityRow } from "@/lib/model";
import type { ViewMode } from "./GapHero";

const inr = (n: number) => `₹${n.toFixed(2)}`;

export default function CityGapTable({
  cities,
  energyFactor,
  view,
}: {
  cities: CityRow[];
  energyFactor: number;
  view: ViewMode;
}) {
  const f = view === "energy" ? 1 / energyFactor : 1;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="section-title">Metro cities — the gap, city by city</h2>
          <p className="subtle">
            {view === "energy"
              ? "All figures per petrol-equivalent litre (energy-adjusted)"
              : "Per litre at the pump; “real” divides by the blend’s energy content"}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>City</th>
              <th className="text-right">Pump price</th>
              <th className="text-right">Fair price</th>
              <th className="text-right">Gap</th>
              {view === "litre" && <th className="text-right">Real (energy-adj.)</th>}
            </tr>
          </thead>
          <tbody>
            {cities.map((c) => {
              const gap = c.gap * f;
              return (
                <tr key={c.name}>
                  <td>
                    <span className="font-medium text-white">{c.name}</span>
                    <span className="ml-2 hidden text-xs text-slate-500 sm:inline">{c.state}</span>
                  </td>
                  <td className="text-right font-mono tabular-nums">{inr(c.quoted * f)}</td>
                  <td className="text-right font-mono tabular-nums">{inr(c.fair * f)}</td>
                  <td
                    className={`text-right font-mono tabular-nums ${
                      gap > 0 ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {gap > 0 ? "+" : "−"}
                    {inr(Math.abs(gap))}
                  </td>
                  {view === "litre" && (
                    <td className="text-right font-mono tabular-nums text-slate-300">{inr(c.effective)}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="source">
        Gap = pump price − fair pass-through price. Positive (amber) = consumers overpay withheld savings;
        negative (green) = the pump price sits below the fair cost-reflective price, because blending currently
        adds cost. Fair price recomputes VAT on the blended base, since VAT is ad-valorem.
      </p>
    </div>
  );
}
