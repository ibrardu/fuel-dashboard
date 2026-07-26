import { ExternalLink } from "lucide-react";
import type { Assumption, BlendConfig, EthanolPrice } from "@/lib/types";

export default function Methodology({
  assumptions,
  ethanolPrices,
  blendConfig,
}: {
  assumptions: Assumption[];
  ethanolPrices: EthanolPrice[];
  blendConfig: BlendConfig[];
}) {
  const latestBlend = [...blendConfig].sort((a, b) => a.effective_from.localeCompare(b.effective_from)).at(-1);

  return (
    <div className="card" id="methodology">
      <div className="card-header">
        <div>
          <h2 className="section-title">Methodology &amp; assumptions</h2>
          <p className="subtle">
            This dashboard presents an estimate, not an accusation. Every input lives in the database with a
            source and an as-of date.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 text-sm text-slate-300">
          <h3 className="font-medium text-white">The model</h3>
          <p>
            Retail petrol price follows the PPAC build-up:{" "}
            <span className="font-mono text-xs text-slate-400">
              retail = base + freight + dealer commission + excise + VAT
            </span>
            . With a blend share <span className="font-mono text-xs text-slate-400">p</span>, the real input cost
            is <span className="font-mono text-xs text-slate-400">(1−p)·base + p·ethanol</span>. The{" "}
            <span className="text-emerald-400">fair price</span> charges that blended base through the same tax
            stack, recomputing VAT because it is ad-valorem. The gap is quoted price minus fair price.
          </p>
          <p>
            Ethanol carries less energy than petrol (~21.2 vs ~32 MJ/L), so a litre of E
            {latestBlend ? Number(latestBlend.blend_pct) : 20} delivers about{" "}
            {latestBlend ? (Number(latestBlend.energy_factor) * 100).toFixed(1) : "96.4"}% of a petrol litre&apos;s
            energy (energy factor per ARAI real-world mileage estimates). The{" "}
            <span className="text-amber-400">energy-adjusted price</span> divides the pump price by that factor —
            the price per petrol-equivalent litre.
          </p>
          <p>
            When ethanol is priced above the refinery-gate petrol base — as it is at current MoPNG procurement
            prices — blending has no saving to pass through, and the model shows the blend premium consumers
            absorb instead. Politicians comparing ethanol&apos;s price to the <em>retail</em> pump price are
            comparing against a number that is roughly half taxes.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-medium text-white">Assumptions (from DB)</h3>
            <ul className="space-y-1.5 text-sm text-slate-400">
              {assumptions.map((a) => (
                <li key={a.key} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-mono text-xs text-slate-500">{a.key}</span>
                  <span className="font-mono text-slate-200">{Number(a.value).toLocaleString("en-IN")}</span>
                  {a.as_of && <span className="text-xs text-slate-500">as of {a.as_of}</span>}
                  {a.note && <span className="w-full text-xs text-slate-500">{a.note}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-white">Ethanol procurement prices (MoPNG)</h3>
            <ul className="space-y-1 text-sm text-slate-400">
              {ethanolPrices.map((e) => (
                <li key={`${e.supply_year}-${e.feedstock}`} className="flex justify-between">
                  <span>
                    {e.feedstock} <span className="text-xs text-slate-500">({e.supply_year})</span>
                  </span>
                  <span className="font-mono text-slate-200">₹{Number(e.price_per_litre).toFixed(2)}/L</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-white">Sources</h3>
            <ul className="space-y-1 text-sm">
              {[
                ["PPAC — price build-up & RSPs", "https://ppac.gov.in/"],
                ["MoPNG — ethanol blended petrol programme", "https://mopng.gov.in/en/refining/ethanol-blended-petrol"],
                ["ARAI — E20 mileage impact studies", "https://www.araiindia.com/"],
              ].map(([label, url]) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
                  >
                    {label} <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
