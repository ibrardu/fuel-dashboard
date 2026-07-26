"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import type { TrendPoint } from "@/lib/model";

// Series colors validated for the #0B1120 surface (CVD-safe pair).
const QUOTED = "#4A8FE0";
const REAL = "#0DA271";

function TooltipCard({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const quoted = payload.find((p) => p.dataKey === "quoted")?.value;
  const blended = payload.find((p) => p.dataKey === "blended")?.value;
  return (
    <div className="rounded-xl border border-white/10 bg-[#16213a] px-3 py-2 text-xs shadow-xl">
      <div className="mb-1 font-medium text-slate-300">
        {label ? format(new Date(label), "dd MMM yyyy") : ""}
      </div>
      {quoted !== undefined && (
        <div className="flex items-center gap-2 text-slate-400">
          <span className="h-2 w-2 rounded-full" style={{ background: QUOTED }} />
          Quoted retail <span className="ml-auto pl-3 tabular-nums text-white">₹{quoted.toFixed(2)}</span>
        </div>
      )}
      {blended !== undefined && (
        <div className="mt-0.5 flex items-center gap-2 text-slate-400">
          <span className="h-2 w-2 rounded-full" style={{ background: REAL }} />
          Real blended cost <span className="ml-auto pl-3 tabular-nums text-white">₹{blended.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

export default function RealCostTrend({ trend }: { trend: TrendPoint[] }) {
  const days =
    trend.length > 1
      ? Math.round(
          (new Date(trend[trend.length - 1].date).getTime() - new Date(trend[0].date).getTime()) /
            86_400_000
        )
      : 0;
  const last = trend[trend.length - 1];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="section-title">Real Cost Trend</h2>
        <span className="badge badge-slate">{days}-day · Delhi</span>
      </div>

      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: QUOTED }} />
          Quoted retail <span className="tabular-nums text-slate-300">₹{last.quoted.toFixed(2)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: REAL }} />
          Real blended cost{" "}
          <span className="tabular-nums text-emerald-300">₹{last.blended.toFixed(2)}</span>
        </span>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id="realFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={REAL} stopOpacity={0.28} />
                <stop offset="100%" stopColor={REAL} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => format(new Date(d), "dd MMM")}
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis
              domain={[40, "dataMax + 8"]}
              tickFormatter={(v: number) => `₹${v}`}
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<TooltipCard />} cursor={{ stroke: "rgba(148,163,184,0.25)" }} />
            <Area
              type="monotone"
              dataKey="quoted"
              stroke={QUOTED}
              strokeWidth={2}
              fill="none"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#0b1120" }}
            />
            <Area
              type="monotone"
              dataKey="blended"
              stroke={REAL}
              strokeWidth={2}
              fill="url(#realFill)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#0b1120" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="source">
        The pump price has been flat while the blended input cost tracks refinery-gate petrol and
        ethanol procurement — the gap between the lines is taxes, margins and the blend arithmetic.
      </p>
    </div>
  );
}
