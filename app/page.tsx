import { differenceInCalendarDays } from "date-fns";
import { getDashboardData } from "@/lib/supabase";
import { buildDashboardModel } from "@/lib/model";
import { fetchLiveUsdInr } from "@/lib/fx";
import Header from "./components/Header";
import LocationAwareDashboard from "./components/LocationAwareDashboard";
import BottomNav from "./components/BottomNav";

export const revalidate = 3600;

// A Supabase table can be present but not actually current — e.g. the daily
// ingestion job has been failing silently for a week. Past this many days
// since the newest fuel_prices.date, the badge stops calling it "Live".
const STALE_THRESHOLD_DAYS = 2;

export default async function Page() {
  const { data, source } = await getDashboardData();
  const model = buildDashboardModel(data);
  const defaultCityId = model.cityDetails.find((c) => c.name === "Delhi")?.id ?? model.cityDetails[0].id;

  const isStale = source === "supabase" && differenceInCalendarDays(new Date(), new Date(model.asOf)) > STALE_THRESHOLD_DAYS;

  const liveUsdInr = await fetchLiveUsdInr();
  if (liveUsdInr && model.crude) {
    model.crude = { ...model.crude, inr: liveUsdInr };
  }

  return (
    <div id="top" className="min-h-screen scroll-smooth">
      <Header asOf={model.asOf} source={source} isStale={isStale} />

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
