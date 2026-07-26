import type { DashboardModel } from "@/lib/model";

/** Top-of-page hero for mobile: the Real Blended Cost is the first thing seen. */
export default function MobileHero({ model }: { model: DashboardModel }) {
  const blended = model.delhi.blended_base;
  const quoted = model.delhi.quoted;
  const discountPct = Math.round((1 - blended / quoted) * 100);

  return (
    <div className="card-hero p-6 text-center lg:hidden">
      <div className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-400/80">
        Real Blended Cost
      </div>
      <div className="mt-2 text-6xl font-bold tabular-nums tracking-tighter text-emerald-300 drop-shadow-[0_0_24px_rgba(16,185,129,0.35)]">
        ₹{blended.toFixed(2)}
        <span className="text-2xl font-semibold text-emerald-400/70">/L</span>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 text-sm">
        <span className="text-slate-400">
          vs quoted <span className="tabular-nums line-through">₹{quoted.toFixed(2)}</span>
        </span>
        <span className="badge badge-green text-sm font-semibold">−{discountPct}%</span>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        What OMCs actually pay per litre of E{model.blendPct} feedstock — Delhi build-up
      </p>
    </div>
  );
}
