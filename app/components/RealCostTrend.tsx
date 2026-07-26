"use client";

import { useState } from "react";
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
const DIESEL = "#F59E0B";

type FuelType = "petrol" | "diesel";

function TooltipCard({
  active,
  payload,
  label,
  fuel,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: string;
  fuel: FuelType;
}) {
  if (!active || !payload?.length) return null;
  const quoted = payload.find((p) => p.dataKey === "quoted")?.value;
  const blended = payload.find((p) => p.dataKey === "blended")?.value;
  const diesel = payload.find((p) => p.dataKey === "diesel")?.value;
  return (
    <div className="rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-xs shadow-xl">
      <div className="mb-1 font-medium text-slate-300">
        {label ? format(new Date(label), "dd MMM yyyy") : ""}
      </div>
      {fuel === "petrol" && quoted !== undefined && (
        <div className="flex items-center gap-2 text-slate-400">
          <span className="h-2 w-2 rounded-full" style={{ background: QUOTED }} />
          Quoted retail <span className="ml-auto pl-3 tabular-nums text-white">₹{quoted.toFixed(2)}</span>
        </div>
      )}
      {fuel === "petrol" && blended !== undefined && (
        <div className="mt-0.5 flex items-center gap-2 text-slate-400">
          <span className="h-2 w-2 rounded-full" style={{ background: REAL }} />
          Real blended cost <span className="ml-auto pl-3 tabular-nums text-white">₹{blended.toFixed(2)}</span>
        </div>
      )}
      {fuel === "diesel" && diesel !== undefined && (
        <div className="flex items-center gap-2 text-slate-400">
          <span className="h-2 w-2 rounded-full" style={{ background: DIESEL }} />
          Diesel retail <span className="ml-auto pl-3 tabular-nums text-white">₹{diesel.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

export default function RealCostTrend({ trend }: { trend: TrendPoint[] }) {
  const [fuel, setFuel] = useState<FuelType>("petrol");

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
        <div className="flex items-center gap-2">
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
          <span className="badge badge-slate">{days}-day · national build-up</span>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
        {fuel === "petrol" ? (
          <>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: QUOTED }} />
              Quoted retail <span className="tabular-nums text-slate-300">₹{last.quoted.toFixed(2)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: REAL }} />
              Real blended cost{" "}
              <span className="tabular-nums text-emerald-300">₹{last.blended.toFixed(2)}</span>
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: DIESEL }} />
            Diesel retail{" "}
            <span className="tabular-nums text-amber-300">₹{(last.diesel ?? 0).toFixed(2)}</span>
          </span>
        )}
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id="realFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={REAL} stopOpacity={0.28} />
                <stop offset="100%" stopColor={REAL} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dieselFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={DIESEL} stopOpacity={0.28} />
                <stop offset="100%" stopColor={DIESEL} stopOpacity={0} />
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
            <Tooltip content={<TooltipCard fuel={fuel} />} cursor={{ stroke: "rgba(148,163,184,0.25)" }} />
            {fuel === "petrol" ? (
              <>
                <Area
                  type="monotone"
                  dataKey="quoted"
                  stroke={QUOTED}
                  strokeWidth={2}
                  fill="none"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--bg)" }}
                />
                <Area
                  type="monotone"
                  dataKey="blended"
                  stroke={REAL}
                  strokeWidth={2}
                  fill="url(#realFill)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--bg)" }}
                />
              </>
            ) : (
              <Area
                type="monotone"
                dataKey="diesel"
                stroke={DIESEL}
                strokeWidth={2}
                fill="url(#dieselFill)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--bg)" }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="source">
        {fuel === "petrol"
          ? "The pump price has been flat while the blended input cost tracks refinery-gate petrol and ethanol procurement — the gap between the lines is taxes, margins and the blend arithmetic."
          : "Diesel isn't ethanol-blended under the E20 mandate — shown as a reference retail price only."}
      </p>
    </div>
  );
}
