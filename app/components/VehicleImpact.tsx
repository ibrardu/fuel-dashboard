import { Car, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import Collapsible from "./Collapsible";

type Status = "Ready" | "Partial" | "Check";

interface VehicleRow {
  make: string;
  models: string;
  status: Status;
}

const ROWS: VehicleRow[] = [
  { make: "Maruti Suzuki", models: "Swift, Baleno, WagonR, Brezza (2021+)", status: "Ready" },
  { make: "Hyundai", models: "i20, Creta, Venue, Verna (2022+)", status: "Ready" },
  { make: "Tata Motors", models: "Nexon, Punch, Tiago, Altroz (BS6)", status: "Ready" },
  { make: "Honda", models: "City, Amaze, WR-V (2020+)", status: "Ready" },
  { make: "Toyota", models: "Glanza, Urban Cruiser, Innova (petrol)", status: "Ready" },
  { make: "Renault", models: "Kwid, Triber, Kiger", status: "Ready" },
  { make: "VW / Skoda", models: "Taigun, Virtus, Kushaq, Slavia", status: "Ready" },
  { make: "Mahindra", models: "XUV300, Bolero, Thar (petrol)", status: "Partial" },
  { make: "Older vehicles", models: "Pre-2010 / BS3 / BS4", status: "Check" },
];

const STATUS_STYLE: Record<Status, { pill: string; icon: React.ReactNode; label: string }> = {
  Ready: {
    pill: "badge badge-green",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "E20 Ready",
  },
  Partial: {
    pill: "badge badge-amber",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    label: "Partial",
  },
  Check: {
    pill: "badge badge-slate",
    icon: <HelpCircle className="h-3.5 w-3.5" />,
    label: "Check",
  },
};

export default function VehicleImpact() {
  const counts = ROWS.reduce(
    (acc, r) => ((acc[r.status] += 1), acc),
    { Ready: 0, Partial: 0, Check: 0 } as Record<Status, number>
  );

  return (
    <Collapsible
      id="vehicles"
      title="E20 Vehicle Impact"
      icon={<Car className="h-4 w-4 text-emerald-400" />}
      badge={<span className="badge badge-slate whitespace-nowrap">{ROWS.length} makes</span>}
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {(Object.keys(counts) as Status[]).map((s) => (
          <span key={s} className={`${STATUS_STYLE[s].pill} px-3 py-1 text-sm`}>
            {STATUS_STYLE[s].icon} {STATUS_STYLE[s].label}
            <span className="ml-0.5 tabular-nums opacity-70">{counts[s]}</span>
          </span>
        ))}
      </div>

      <ul className="divide-y divide-white/[0.05]">
        {ROWS.map((r) => (
          <li key={r.make} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <div className="text-sm font-medium text-white">{r.make}</div>
              <div className="truncate text-[11px] text-slate-500">{r.models}</div>
            </div>
            <span className={`${STATUS_STYLE[r.status].pill} shrink-0`}>
              {STATUS_STYLE[r.status].icon} {STATUS_STYLE[r.status].label}
            </span>
          </li>
        ))}
      </ul>

      <p className="source">
        Compiled from public OEM statements and ARAI guidance — not official certification. Verify
        with your manual or service centre.
      </p>
    </Collapsible>
  );
}
