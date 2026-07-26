import { getDashboardData } from "@/lib/supabase";
import { buildDashboardModel } from "@/lib/model";
import Header from "./components/Header";
import KpiStrip from "./components/KpiStrip";
import MobileHero from "./components/MobileHero";
import HeroCompare from "./components/HeroCompare";
import WhatIf from "./components/WhatIf";
import CityPrices from "./components/CityPrices";
import RealCostTrend from "./components/RealCostTrend";
import OmcProfits from "./components/OmcProfits";
import VehicleImpact from "./components/VehicleImpact";
import BottomNav from "./components/BottomNav";

export const revalidate = 3600;

export default async function Page() {
  const { data, source } = await getDashboardData();
  const model = buildDashboardModel(data);

  return (
    <div id="top" className="min-h-screen scroll-smooth">
      <Header asOf={model.asOf} source={source} />
      <KpiStrip model={model} />

      <main className="mx-auto max-w-[1400px] space-y-4 px-4 pb-24 pt-4 sm:px-6 lg:space-y-5 lg:pb-10">
        <MobileHero model={model} />

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <div className="space-y-4 lg:space-y-5">
            <HeroCompare model={model} />
            <WhatIf
              defaultBase={model.delhi.basePrice}
              defaultEthanol={model.ethanolPrice}
              defaultBlendPct={model.blendPct}
              quotedRetail={model.delhi.quoted}
            />
          </div>
          <div className="space-y-4 lg:space-y-5">
            <CityPrices model={model} />
            <RealCostTrend trend={model.trend} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          <OmcProfits />
          <VehicleImpact />
        </div>
      </main>

      <footer className="border-t border-white/[0.06] py-6 pb-24 lg:pb-6">
        <div className="mx-auto max-w-[1400px] px-6 text-center text-[10px] text-slate-500">
          FuelLedger · estimates for education, not accusations — verify against PPAC and MoPNG
          before citing · Next.js + Supabase
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}
