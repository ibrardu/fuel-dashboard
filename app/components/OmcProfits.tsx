import { Building2 } from "lucide-react";
import Collapsible from "./Collapsible";

interface OmcRow {
  name: string;
  fy23: number; // net profit, ₹ crore
  fy24: number;
}

// Reported standalone net profit (₹ crore), FY2022-23 vs FY2023-24 annual reports.
const OMCS: OmcRow[] = [
  { name: "IOCL", fy23: 8_242, fy24: 39_619 },
  { name: "BPCL", fy23: 1_870, fy24: 26_673 },
  { name: "HPCL", fy23: -8_974, fy24: 14_694 },
];

const fmtCr = (v: number) =>
  `${v < 0 ? "−" : ""}₹${Math.abs(v).toLocaleString("en-IN")} cr`;

export default function OmcProfits() {
  const max = Math.max(...OMCS.map((o) => o.fy24));
  const combined = OMCS.reduce((s, o) => s + o.fy24, 0);

  return (
    <Collapsible
      id="omc"
      title="OMC Profit Growth"
      icon={<Building2 className="h-4 w-4 text-emerald-400" />}
      badge={
        <span className="badge badge-green whitespace-nowrap">
          FY24 combined ₹{(combined / 1000).toFixed(0)}k cr
        </span>
      }
    >
      <div className="space-y-5">
        {OMCS.map((o) => {
          const growth =
            o.fy23 > 0 ? `${(o.fy24 / o.fy23).toFixed(1)}× YoY` : "loss → profit";
          return (
            <div key={o.name}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="font-medium text-white">{o.name}</span>
                <span className="tabular-nums text-emerald-300">
                  {fmtCr(o.fy24)}
                  <span className="ml-2 text-[11px] text-slate-500">{growth}</span>
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/[0.05]">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                  style={{ width: `${(o.fy24 / max) * 100}%` }}
                />
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 rounded-full bg-slate-600" style={{ width: `${(Math.max(o.fy23, 0) / max) * 100}%` }} />
                <span className="text-[10px] tabular-nums text-slate-500">FY23: {fmtCr(o.fy23)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="source">
        Net profit, company annual reports. Record earnings arrived while pump prices stayed frozen
        and the blend share rose — the spread between quoted retail and real input cost is where it
        shows up.
      </p>
    </Collapsible>
  );
}
