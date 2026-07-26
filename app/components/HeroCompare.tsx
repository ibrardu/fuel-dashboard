import { MoveRight } from "lucide-react";
import type { DashboardModel } from "@/lib/model";

/** Quoted Retail vs Real Blended Cost — the centrepiece comparison. */
export default function HeroCompare({ model }: { model: DashboardModel }) {
  const { delhi } = model;
  const blended = delhi.blended_base;
  const discountPct = Math.round((1 - blended / delhi.quoted) * 100);

  const freightDealer = model.waterfall.freight + model.waterfall.dealer;
  const segments = [
    { label: "Base (OMC realisation)", value: model.waterfall.base, cls: "bg-emerald-500" },
    { label: "Freight + dealer", value: freightDealer, cls: "bg-slate-500" },
    { label: "Central excise", value: model.waterfall.excise, cls: "bg-slate-600" },
    { label: "State VAT", value: model.waterfall.vat, cls: "bg-slate-700" },
  ];

  return (
    <div className="card-hero p-6 sm:p-7">
      <div className="card-header mb-6">
        <h2 className="section-title">Quoted price vs real input cost</h2>
        <span className="badge badge-green font-semibold">−{discountPct}% input cost</span>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
            Quoted Retail (Delhi)
          </div>
          <div className="mt-1 text-4xl font-semibold tabular-nums tracking-tighter text-slate-400 sm:text-5xl">
            ₹{delhi.quoted.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">what you pay at the pump</div>
        </div>

        <MoveRight className="mb-6 hidden h-6 w-6 shrink-0 text-slate-600 sm:block" />

        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-emerald-400/80">
            Real Blended Cost
          </div>
          <div className="mt-1 text-5xl font-bold tabular-nums tracking-tighter text-emerald-300 drop-shadow-[0_0_28px_rgba(16,185,129,0.4)] sm:text-6xl">
            ₹{blended.toFixed(2)}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400/70">
            what the E{model.blendPct} feedstock actually costs OMCs
          </div>
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs font-medium text-slate-400">
            Where your ₹{delhi.quoted.toFixed(2)} goes
          </span>
          <span className="text-[11px] tabular-nums text-slate-500">₹/L, Delhi build-up</span>
        </div>
        <div className="flex h-4 w-full gap-[2px] overflow-hidden rounded-full">
          {segments.map((s) => (
            <div
              key={s.label}
              className={`${s.cls} first:rounded-l-full last:rounded-r-full`}
              style={{ width: `${(s.value / delhi.quoted) * 100}%` }}
              title={`${s.label}: ₹${s.value.toFixed(2)}`}
            />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className={`h-2 w-2 shrink-0 rounded-full ${s.cls}`} />
              <span className="truncate">{s.label}</span>
              <span className="ml-auto tabular-nums text-slate-300">₹{s.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <p className="source">
          Taxes and levies are ₹{(model.waterfall.excise + model.waterfall.vat).toFixed(2)}/L of
          the pump price. The ₹{model.waterfall.base.toFixed(2)} base is charged as petrol-equivalent
          — the blended feedstock inside it costs ₹{blended.toFixed(2)} with ethanol at ₹
          {model.ethanolPrice.toFixed(2)}/L, and pump prices did not move when the blend did.
        </p>
      </div>
    </div>
  );
}
