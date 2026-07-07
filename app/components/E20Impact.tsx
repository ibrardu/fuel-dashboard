"use client";

import { AlertTriangle, Shield, FileText, Users } from "lucide-react";

export default function E20Impact() {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-500" /> E20 Impact on Vehicles &amp; Insurance
          </h2>
          <p className="subtle">Balanced summary • E20 fully rolled out nationwide (Apr 2026)</p>
        </div>
        <div className="badge badge-blue">ARAI / Govt</div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Owner / Field Reports */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-amber-400">
            <Users className="h-4 w-4" />
            <span className="font-semibold text-sm uppercase tracking-wider">Owner &amp; Field Reports</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• Some owners of pre-2010/older vehicles report slightly rough idling or reduced mileage (1–5%).</li>
            <li>• Rubber hoses, gaskets, and certain plastic fuel system parts in very old cars can degrade faster.</li>
            <li>• Majority of post-2020 cars (E20-compliant by design) report no noticeable issues.</li>
            <li>• Mileage drop commonly cited between 2–6% vs E10 in controlled tests.</li>
          </ul>
        </div>

        {/* Official / Technical Position */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <Shield className="h-4 w-4" />
            <span className="font-semibold text-sm uppercase tracking-wider">Official &amp; Technical Position</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• All new petrol vehicles sold after Apr 2023 are required to be E20 material &amp; emission compliant.</li>
            <li>• ARAI studies confirm E20 is safe for modern fuel systems when compliant materials used.</li>
            <li>• Ethanol’s lower energy density is the primary cause of modest mileage reduction.</li>
            <li>• No widespread pattern of engine failures attributed to E20 since phased rollout.</li>
          </ul>
        </div>

        {/* Insurance &amp; Warranty */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 md:col-span-2">
          <div className="flex items-center gap-2 mb-2 text-blue-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-semibold text-sm uppercase tracking-wider">Insurance, Warranty &amp; Recommendations</span>
          </div>
          <div className="grid md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="font-medium text-slate-200">Insurance:</span> Most policies cover E20 use for compliant vehicles. Check policy wording for older cars. Use of non-compliant fuel may void claims in rare cases.
            </div>
            <div>
              <span className="font-medium text-slate-200">Manufacturer Warranty:</span> New vehicles (2023+) are warrantied for E20. Pre-E20 cars: refer to owner manual / service bulletin. Many OEMs have issued compatibility statements.
            </div>
            <div>
              <span className="font-medium text-slate-200">Practical Advice:</span> For vehicles &gt;10–12 years old, monitor for leaks at fuel lines. Prefer BS6/E20 compliant pumps. Keep fuel filter changes on schedule.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400 leading-relaxed">
        <strong>Key Reference:</strong> Bawase, M. A., &amp; Thipse, D. S. S. (2021). <em>Impact of 20% Ethanol-blended Gasoline (E20) on Metals and Non-metals used in Fuel-system Components of Vehicles</em>. ARAI Journal of Mobility Technology, 1(1). 
        Metals corrosion impact found insignificant. Select elastomers (Polychloroprene, SBR, HNBR, Fluoroelastomer) performed adequately under test conditions.
        <span className="block mt-1">Source: <a href="https://araijournal.com/index.php/arai/article/view/30" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-300">ARAI Journal</a></span>
      </div>
    </div>
  );
}
