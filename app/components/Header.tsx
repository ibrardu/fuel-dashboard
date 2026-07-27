import { Fuel } from "lucide-react";
import { formatDate } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

export default function Header({
  asOf,
  source,
  isStale,
}: {
  asOf: string;
  source: string;
  isStale: boolean;
}) {
  const badgeLabel = source !== "supabase" ? "Live · seed" : isStale ? "Live · stale" : "Live";
  const badgeColor = source === "supabase" && !isStale ? "emerald" : "amber";

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_24px_-4px_rgba(16,185,129,0.7)]">
            <Fuel className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-semibold tracking-tight text-white">
              FuelLedger
            </div>
            <div className="hidden text-[11px] text-slate-400 sm:block">
              E20 Real Cost Dashboard
            </div>
          </div>
        </div>

        <div className="hidden text-sm font-medium tracking-tight text-slate-300 md:block">
          E20 Real Cost Dashboard
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="hidden text-slate-500 sm:inline">
            Updated <span className="tabular-nums text-slate-300">{formatDate(asOf)}</span>
          </span>
          <span className={`badge ${badgeColor === "emerald" ? "badge-green" : "badge-amber"}`}>
            <span className="relative flex h-1.5 w-1.5">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
                  badgeColor === "emerald" ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                  badgeColor === "emerald" ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
            </span>
            {badgeLabel}
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
