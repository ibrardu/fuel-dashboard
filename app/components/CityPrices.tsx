import { MapPin } from "lucide-react";
import type { CityDetail } from "@/lib/model";

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
  const rows = cities
    .map((c) => ({ ...c, discount: Math.round((1 - nationalBlendedCost / c.quoted) * 100) }))
    .sort((a, b) => b.quoted - a.quoted);

  return (
    <div className="card" id="cities">
      <div className="card-header">
        <h2 className="section-title flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-400" /> City Prices
        </h2>
        <span className="badge badge-slate">{cities.length} cities · pump vs real cost</span>
      </div>

      {/* Desktop table */}
      <div className="hidden max-h-[420px] overflow-y-auto sm:block">
        <table className="table">
          <thead>
            <tr>
              <th>City</th>
              <th className="text-right">Quoted RSP</th>
              <th className="text-right">Real Cost</th>
              <th className="text-right">Gap</th>
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
                <td className="text-right">₹{c.quoted.toFixed(2)}</td>
                <td className="text-right font-semibold text-emerald-300">
                  ₹{nationalBlendedCost.toFixed(2)}
                </td>
                <td className="text-right">
                  <span className="badge badge-green">−{c.discount}%</span>
                </td>
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
                pump ₹{c.quoted.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold tabular-nums text-emerald-300">
                ₹{nationalBlendedCost.toFixed(2)}
              </span>
              <span className="badge badge-green">−{c.discount}%</span>
            </div>
          </li>
        ))}
      </ul>

      <p className="source">
        Real cost is the national blended feedstock (₹{nationalBlendedCost.toFixed(2)}/L); pump
        prices differ because state VAT differs — not because the fuel does.
      </p>
    </div>
  );
}
