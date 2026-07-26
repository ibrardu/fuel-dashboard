"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WaterfallInput } from "@/lib/model";

// Palette validated against the slate-900 card surface (dataviz six checks):
// blue = cost components, amber = taxes, emerald = fair price.
const COLOR = {
  cost: "#3987e5",
  tax: "#c98500",
  fair: "#059669",
  total: "#475569",
  delta: "#c98500",
} as const;

interface Row {
  name: string;
  offset: number;
  value: number;
  extra: number;
  kind: keyof typeof COLOR;
  note: string;
}

function buildRows(w: WaterfallInput): Row[] {
  const steps: [string, number, "cost" | "tax", string][] = [
    ["Base price", w.base, "cost", "Refinery-gate petrol-equivalent base"],
    ["Freight", w.freight, "cost", "Freight to depot"],
    ["Dealer", w.dealer, "cost", "Dealer commission"],
    ["Excise", w.excise, "tax", "Central excise duty"],
    ["VAT", w.vat, "tax", "State VAT (ad-valorem)"],
  ];
  let running = 0;
  const rows: Row[] = steps.map(([name, value, kind, note]) => {
    const row: Row = { name, offset: running, value, extra: 0, kind, note };
    running += value;
    return row;
  });

  const common = Math.min(w.quoted, w.fair);
  rows.push({
    name: "Pump price",
    offset: 0,
    value: common,
    extra: w.quoted - common,
    kind: "total",
    note: "Quoted retail price",
  });
  rows.push({
    name: "Fair price",
    offset: 0,
    value: common,
    extra: w.fair - common,
    kind: "fair",
    note:
      w.fair > w.quoted
        ? "Blended base through the same tax stack — the amber slice is the blend premium"
        : "Blended base through the same tax stack — the amber slice on the pump bar is withheld savings",
  });
  return rows;
}

const inr = (n: number) => `₹${n.toFixed(2)}`;

export default function PriceWaterfall({ waterfall }: { waterfall: WaterfallInput }) {
  const rows = buildRows(waterfall);
  const premium = waterfall.fair - waterfall.quoted;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="section-title">Where a litre&apos;s price comes from</h2>
          <p className="subtle">
            Delhi build-up, PPAC methodology — and what the price would be if the blended feedstock cost were
            charged instead ({premium > 0 ? `+${inr(premium)} blend premium` : `${inr(-premium)} withheld saving`})
          </p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="25%">
            <CartesianGrid vertical={false} stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#334155" }} />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `₹${v}`}
              width={48}
            />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as Row;
                return (
                  <div className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs shadow-lg">
                    <div className="font-medium text-slate-100">{row.name}</div>
                    <div className="mt-0.5 font-mono text-slate-300">{inr(row.value + row.extra)}</div>
                    <div className="mt-1 max-w-[200px] text-slate-400">{row.note}</div>
                  </div>
                );
              }}
            />
            <Bar dataKey="offset" stackId="w" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="value" stackId="w" isAnimationActive={false}>
              {rows.map((row) => (
                <Cell key={row.name} fill={COLOR[row.kind]} />
              ))}
            </Bar>
            <Bar dataKey="extra" stackId="w" fill={COLOR.delta} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLOR.cost }} /> Cost components
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLOR.tax }} /> Taxes
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLOR.total }} /> Quoted retail
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLOR.fair }} /> Fair pass-through price
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLOR.delta }} /> Blend premium / withheld saving
        </span>
      </div>
    </div>
  );
}
