"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/model";
import type { ViewMode } from "./GapHero";

// Validated pair on the slate-900 surface: blue = quoted, emerald = fair.
const QUOTED = "#3987e5";
const FAIR = "#059669";

const inr = (n: number) => `₹${n.toFixed(2)}`;
const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function TrendChart({
  trend,
  energyFactor,
  view,
}: {
  trend: TrendPoint[];
  energyFactor: number;
  view: ViewMode;
}) {
  const f = view === "energy" ? 1 / energyFactor : 1;
  const data = trend.map((p) => ({
    ...p,
    quoted: p.quoted * f,
    fair: p.fair * f,
    band: [p.fair * f, p.quoted * f] as [number, number],
  }));

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="section-title">Quoted price vs fair price</h2>
          <p className="subtle">
            Delhi, weekly build-up snapshots — the pump price holds flat while the fair pass-through price moves
            with crude and ethanol{view === "energy" ? " (energy-adjusted, per petrol-equivalent litre)" : ""}
          </p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#1e293b" />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              domain={["dataMin - 1", "dataMax + 1"]}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `₹${Math.round(v)}`}
              width={48}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as (typeof data)[number];
                return (
                  <div className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs shadow-lg">
                    <div className="font-medium text-slate-100">{shortDate(String(label))}</div>
                    <div className="mt-1 space-y-0.5 font-mono">
                      <div className="text-slate-300">Quoted {inr(row.quoted)}</div>
                      <div className="text-slate-300">Fair {inr(row.fair)}</div>
                      <div className="text-slate-400">Gap {inr(row.quoted - row.fair)}</div>
                    </div>
                  </div>
                );
              }}
            />
            <Area dataKey="band" stroke="none" fill="#c98500" fillOpacity={0.14} isAnimationActive={false} />
            <Line
              dataKey="quoted"
              stroke={QUOTED}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
            <Line
              dataKey="fair"
              stroke={FAIR}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded" style={{ background: QUOTED }} /> Quoted pump price
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded" style={{ background: FAIR }} /> Fair pass-through price
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#c98500] opacity-40" /> Gap
        </span>
      </div>
    </div>
  );
}
