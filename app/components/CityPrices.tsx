"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import type { CityDetail } from "@/lib/model";

type FuelType = "petrol" | "diesel";

/** Quoted RSP vs real blended input cost per city. Table on desktop, list rows on mobile. */
export default function CityPrices({
  cities,
  nationalBlendedCost,
  activeCityId,
}: {
  cities: CityDetail[];
  nationalBlendedCost: number;
  activeCityId: number;
}) {
  const [fuel, setFuel] = useState<FuelType>("petrol");

  const rows: (CityDetail & { price: number; discount?: number })[] = (
    fuel === "petrol"
      ? cities.map((c) => ({
          ...c,
          price: c.quoted,
          discount: Math.round((1 - nationalBlendedCost / c.quoted) * 100),
        }))
      : cities.map((c) => ({ ...c, price: c.dieselRetail ?? 0 }))
  ).sort((a, b) => b.price - a.price);

  return (
    <div className="card" id="cities">
      <div className="card-header">
        <h2 className="section-title flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-400" /> City Prices
        </h2>
        <div className="inline-flex rounded-lg border border-white/10 bg-background p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setFuel("petrol")}
            className={`rounded-md px-2.5 py-1 font-medium transition ${
              fuel === "petrol" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Petrol
          </button>
          <button
            type="button"
            onClick={() => setFuel("diesel")}
            className={`rounded-md px-2.5 py-1 font-medium transition ${
              fuel === "diesel" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Diesel
          </button>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden max-h-[420px] overflow-y-auto sm:block">
        <table className="table">
          <thead>
            <tr>
              <th>City</th>
              <th className="text-right">{fuel === "petrol" ? "Quoted RSP" : "Diesel RSP"}</th>
              {fuel === "petrol" && (
                <>
                  <th className="text-right">Real Cost</th>
                  <th className="text-right">Gap</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.name} className={c.id === activeCityId ? "bg-emerald-500/[0.06]" : ""}>
                <td>
                  <span className="inline-flex items-center gap-1.5 font-medium text-white">
                    {c.id === activeCityId && <MapPin className="h-3 w-3 text-emerald-400" />}
                    {c.name}
                  </span>
                  <span className="ml-2 hidden text-xs text-slate-500 md:inline">{c.state}</span>
                </td>
                <td className="text-right">₹{c.price.toFixed(2)}</td>
                {c.discount !== undefined && (
                  <>
                    <td className="text-right font-semibold text-emerald-300">
                      ₹{nationalBlendedCost.toFixed(2)}
                    </td>
                    <td className="text-right">
                      <span className="badge badge-green">−{c.discount}%</span>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list rows */}
      <ul className="max-h-[420px] divide-y divide-white/[0.05] overflow-y-auto sm:hidden">
        {rows.map((c) => (
          <li
            key={c.name}
            className={`flex items-center justify-between gap-3 py-3 ${c.id === activeCityId ? "bg-emerald-500/[0.06]" : ""}`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate text-sm font-medium text-white">
                {c.id === activeCityId && <MapPin className="h-3 w-3 shrink-0 text-emerald-400" />}
                {c.name}
              </div>
              <div className="text-[11px] tabular-nums text-slate-500">
                {fuel === "petrol" ? "pump" : "diesel"} ₹{c.price.toFixed(2)}
              </div>
            </div>
            {c.discount !== undefined ? (
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold tabular-nums text-emerald-300">
                  ₹{nationalBlendedCost.toFixed(2)}
                </span>
                <span className="badge badge-green">−{c.discount}%</span>
              </div>
            ) : (
              <span className="text-sm font-semibold tabular-nums text-white">₹{c.price.toFixed(2)}</span>
            )}
          </li>
        ))}
      </ul>

      <p className="source">
        {fuel === "petrol"
          ? `Real cost is the national blended feedstock (₹${nationalBlendedCost.toFixed(2)}/L); pump prices differ because state VAT differs — not because the fuel does.`
          : "Diesel isn't ethanol-blended under the E20 mandate — shown as a reference retail price only, no real-cost comparison applies."}
      </p>
    </div>
  );
}
