"use client";

import { TrendingUp } from "lucide-react";

interface CompanyPnl {
  company: string;
  fy25: number;
  fy26: number;
}

const data: CompanyPnl[] = [
  { company: "Indian Oil (IOCL)", fy25: 12962, fy26: 36802 },
  { company: "Bharat Petroleum (BPCL)", fy25: 8500, fy26: 23400 }, // Approx based on public reports
  { company: "Hindustan Petroleum (HPCL)", fy25: 7365, fy26: 17075 },
];

export default function PnlYoY() {
  const maxVal = Math.max(...data.map((d) => Math.max(d.fy25, d.fy26)));

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" /> OMC Profit &amp; Loss (YoY)
          </h2>
          <p className="subtle">Standalone Net Profit (₹ Crore) • FY25 vs FY26 (approx)</p>
        </div>
        <div className="badge badge-green">Strong FY26</div>
      </div>

      <div className="space-y-4">
        {data.map((row, i) => {
          const change = ((row.fy26 - row.fy25) / row.fy25) * 100;
          const fy25Width = (row.fy25 / maxVal) * 100;
          const fy26Width = (row.fy26 / maxVal) * 100;

          return (
            <div key={i} className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <div className="font-medium">{row.company}</div>
                <div className="text-xs text-emerald-400 font-mono">
                  +{change.toFixed(0)}%
                </div>
              </div>

              <div className="space-y-2">
                {/* FY25 */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-10 text-slate-400">FY25</div>
                  <div className="flex-1 bg-slate-800 rounded h-2.5 overflow-hidden">
                    <div className="h-2.5 bg-slate-600" style={{ width: `${fy25Width}%` }} />
                  </div>
                  <div className="w-24 text-right font-mono text-slate-300">₹{row.fy25.toLocaleString("en-IN")}</div>
                </div>

                {/* FY26 */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-10 text-slate-400">FY26</div>
                  <div className="flex-1 bg-slate-800 rounded h-2.5 overflow-hidden">
                    <div className="h-2.5 bg-emerald-500" style={{ width: `${fy26Width}%` }} />
                  </div>
                  <div className="w-24 text-right font-mono font-medium text-white">₹{row.fy26.toLocaleString("en-IN")}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="source mt-4">
        Source: Company filings &amp; consolidated public reports (FY25/FY26). Figures are approximate/standalone and subject to final audited adjustments. Combined OMC profit growth ~130% YoY in recent fiscal.
      </p>
    </div>
  );
}
