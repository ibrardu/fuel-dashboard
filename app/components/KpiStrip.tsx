import type { CityDetail } from "@/lib/model";

interface Kpi {
  label: string;
  value: string;
  sub: string;
  hero?: boolean;
  saffron?: boolean;
  /** Hidden on mobile because the MobileHero card already shows it. */
  desktopOnly?: boolean;
}

export default function KpiStrip({
  activeCity,
  nationalBlendedCost,
  ethanolPrice,
  blendPct,
  crude,
}: {
  activeCity: CityDetail;
  nationalBlendedCost: number;
  ethanolPrice: number;
  blendPct: number;
  crude: { usd: number | null; inr: number; date: string } | null;
}) {
  const discountPct = Math.round((1 - nationalBlendedCost / activeCity.quoted) * 100);
  const spread = activeCity.quoted - nationalBlendedCost;

  const kpis: Kpi[] = [
    {
      label: "Indian Basket Crude",
      value: crude?.usd != null ? `$${crude.usd.toFixed(1)}` : "—",
      sub: crude ? `USD/INR ${crude.inr.toFixed(2)}` : "no data",
    },
    {
      label: `${activeCity.name} Petrol RSP`,
      value: `₹${activeCity.quoted.toFixed(2)}`,
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
      value: `₹${nationalBlendedCost.toFixed(2)}/L`,
      sub: `−${discountPct}% vs pump price`,
      hero: true,
      desktopOnly: true,
    },
    {
      label: "Est. Gross Spread",
      value: `₹${spread.toFixed(2)}/L`,
      sub: "pump − feedstock, incl. taxes",
      desktopOnly: true,
      saffron: true,
    },
  ];

  return (
    <div className="lg:sticky lg:top-16 lg:z-40 lg:border-b lg:border-white/[0.06] lg:bg-background/85 lg:backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-3 px-4 py-3 sm:px-6 lg:grid-cols-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={[
              "kpi",
              kpi.hero ? "kpi-hero" : "",
              kpi.saffron ? "border-amber-500/30" : "",
              kpi.desktopOnly ? "hidden lg:block" : "",
            ].join(" ")}
          >
            <div
              className={`kpi-label ${kpi.hero ? "text-emerald-400/80" : kpi.saffron ? "text-amber-400/80" : ""}`}
            >
              {kpi.label}
            </div>
            <div
              className={
                kpi.hero
                  ? "mt-1 text-2xl font-bold tabular-nums tracking-tight text-emerald-300"
                  : kpi.saffron
                    ? "kpi-value text-amber-300"
                    : "kpi-value"
              }
            >
              {kpi.value}
            </div>
            <div
              className={`kpi-sub ${kpi.hero ? "text-emerald-400/70" : kpi.saffron ? "text-amber-400/60" : ""}`}
            >
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
