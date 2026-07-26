import { MapPin } from "lucide-react";
import type { DashboardModel } from "@/lib/model";

/** Quoted RSP vs real blended input cost per metro. Table on desktop, list rows on mobile. */
export default function CityPrices({ model }: { model: DashboardModel }) {
  const blended = model.delhi.blended_base; // national feedstock cost; RSP varies by state VAT
  const rows = model.cities
    .map((c) => ({ ...c, discount: Math.round((1 - blended / c.quoted) * 100) }))
    .sort((a, b) => b.quoted - a.quoted);

  return (
    <div className="card" id="cities">
      <div className="card-header">
        <h2 className="section-title flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-400" /> City Prices
        </h2>
        <span className="badge badge-slate">metro RSP vs real cost</span>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto sm:block">
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
              <tr key={c.name}>
                <td>
                  <span className="font-medium text-white">{c.name}</span>
                  <span className="ml-2 hidden text-xs text-slate-500 md:inline">{c.state}</span>
                </td>
                <td className="text-right">₹{c.quoted.toFixed(2)}</td>
                <td className="text-right font-semibold text-emerald-300">₹{blended.toFixed(2)}</td>
                <td className="text-right">
                  <span className="badge badge-green">−{c.discount}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list rows */}
      <ul className="divide-y divide-white/[0.05] sm:hidden">
        {rows.map((c) => (
          <li key={c.name} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-white">{c.name}</div>
              <div className="text-[11px] tabular-nums text-slate-500">
                pump ₹{c.quoted.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold tabular-nums text-emerald-300">
                ₹{blended.toFixed(2)}
              </span>
              <span className="badge badge-green">−{c.discount}%</span>
            </div>
          </li>
        ))}
      </ul>

      <p className="source">
        Real cost is the national blended feedstock (₹{blended.toFixed(2)}/L); pump prices differ
        because state VAT differs — not because the fuel does.
      </p>
    </div>
  );
}
