import { getDashboardData } from "@/lib/supabase";
import { buildDashboardModel } from "@/lib/model";
import Header from "./components/Header";
import LocationAwareDashboard from "./components/LocationAwareDashboard";
import BottomNav from "./components/BottomNav";

export const revalidate = 3600;

export default async function Page() {
  const { data, source } = await getDashboardData();
  const model = buildDashboardModel(data);
  const defaultCityId = model.cityDetails.find((c) => c.name === "Delhi")?.id ?? model.cityDetails[0].id;

  return (
    <div id="top" className="min-h-screen scroll-smooth">
      <Header asOf={model.asOf} source={source} />

      <LocationAwareDashboard
        cities={model.cityDetails}
        defaultCityId={defaultCityId}
        nationalBlendedCost={model.nationalBlendedCost}
        ethanolPrice={model.ethanolPrice}
        blendPct={model.blendPct}
        crude={model.crude}
        trend={model.trend}
      />

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
