import type { DashboardModel } from "@/lib/model";

interface Kpi {
  label: string;
  value: string;
  sub: string;
  hero?: boolean;
  /** Hidden on mobile because the MobileHero card already shows it. */
  desktopOnly?: boolean;
}

export default function KpiStrip({ model }: { model: DashboardModel }) {
  const { delhi, blendPct, ethanolPrice, crude } = model;
  const blended = delhi.blended_base;
  const discountPct = Math.round((1 - blended / delhi.quoted) * 100);
  const spread = delhi.quoted - blended;

  const kpis: Kpi[] = [
    {
      label: "Indian Basket Crude",
      value: crude ? `$${crude.usd.toFixed(1)}` : "—",
      sub: crude ? `USD/INR ${crude.inr.toFixed(2)}` : "no data",
    },
    {
      label: "Delhi Petrol RSP",
      value: `₹${delhi.quoted.toFixed(2)}`,
      sub: "quoted at the pump",
    },
    {
      label: "Ethanol Price",
      value: `₹${ethanolPrice.toFixed(2)}/L`,
      sub: "OMC landed cost",
    },
    {
      label: "National Blend",
      value: `E${blendPct}`,
      sub: `${blendPct}% ethanol mandate`,
    },
    {
      label: "Real Blended Cost",
      value: `₹${blended.toFixed(2)}/L`,
      sub: `−${discountPct}% vs pump price`,
      hero: true,
      desktopOnly: true,
    },
    {
      label: "Est. Gross Spread",
      value: `₹${spread.toFixed(2)}/L`,
      sub: "pump − feedstock, incl. taxes",
      desktopOnly: true,
    },
  ];

  return (
    <div className="lg:sticky lg:top-16 lg:z-40 lg:border-b lg:border-white/[0.06] lg:bg-[#0b1120]/85 lg:backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-3 px-4 py-3 sm:px-6 lg:grid-cols-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={[
              "kpi",
              kpi.hero ? "kpi-hero" : "",
              kpi.desktopOnly ? "hidden lg:block" : "",
            ].join(" ")}
          >
            <div className={`kpi-label ${kpi.hero ? "text-emerald-400/80" : ""}`}>
              {kpi.label}
            </div>
            <div
              className={
                kpi.hero
                  ? "mt-1 text-2xl font-bold tabular-nums tracking-tight text-emerald-300"
                  : "kpi-value"
              }
            >
              {kpi.value}
            </div>
            <div className={`kpi-sub ${kpi.hero ? "text-emerald-400/70" : ""}`}>{kpi.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
