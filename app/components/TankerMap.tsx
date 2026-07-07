"use client";

import { Anchor, ExternalLink } from "lucide-react";

export default function TankerMap() {
  // MarineTraffic embed for region around India (free embed link pattern)
  // Using a static area embed URL. In production consider paid API.
  const marineTrafficSrc =
    "https://www.marinetraffic.com/en/ais/embed?zoom=4&centery=15&centerx=75&maptype=0&shownames=true&showicons=true&showvesseltrack=true&showtext=false";

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <Anchor className="h-5 w-5 text-emerald-500" /> Live Tanker Movement
          </h2>
          <p className="subtle">Crude &amp; product tankers • India &amp; surrounding waters</p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video relative">
        <iframe
          src={marineTrafficSrc}
          className="w-full h-full"
          title="MarineTraffic AIS - Tankers near India"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-medium mb-1 text-slate-300">Key Import Routes</div>
          <ul className="space-y-1 text-slate-400 text-sm">
            <li>• Persian Gulf (Saudi, UAE, Iraq) → Jamnagar / Mundra / Mumbai</li>
            <li>• West Africa / Latin America → East &amp; West coast refineries</li>
            <li>• Russia (ESPO / Baltic) → East coast terminals</li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-1 text-slate-300">Disclaimer</div>
          <p className="text-xs text-slate-400">
            This is a free embed from MarineTraffic. Real-time accuracy, coverage and historical data require paid subscriptions.
            For commercial decisions use official AIS feeds or licensed providers. Data shown here is illustrative.
          </p>
          <a
            href="https://www.marinetraffic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-400 hover:underline"
          >
            Open full MarineTraffic <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
