"use client";

import { MapPin } from "lucide-react";

interface CityPrice {
  city: string;
  petrol: number;
  blended: number; // Blended cost to OMC after E20
}

const cityPrices: CityPrice[] = [
  { city: "Delhi", petrol: 102.45, blended: 99.82 },
  { city: "Mumbai", petrol: 111.38, blended: 108.55 },
  { city: "Kolkata", petrol: 113.64, blended: 110.82 },
  { city: "Chennai", petrol: 107.91, blended: 105.15 },
  { city: "Bengaluru", petrol: 110.95, blended: 108.25 },
  { city: "Hyderabad", petrol: 117.12, blended: 114.35 },
];

export default function CityPrices() {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-500" /> Current Petrol Prices (E20) — Major Cities
          </h2>
          <p className="subtle">All pumps selling E20 since April 2026</p>
        </div>
        <div className="badge badge-green">E20 Retail</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cityPrices.map((city) => (
          <div
            key={city.city}
            className="border border-slate-700 rounded-xl p-4 bg-slate-950 hover:border-slate-600 transition"
          >
            <div className="font-semibold text-lg tracking-tight text-white mb-1">
              {city.city}
            </div>

            <div className="text-3xl font-semibold font-mono tracking-tighter text-white">
              ₹{city.petrol.toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 -mt-0.5 mb-2">Petrol (₹/L)</div>

            <div className="text-sm">
              <span className="text-slate-300">Blended cost to OMC: </span>
              <span className="font-mono text-emerald-400 font-medium">
                ~₹{city.blended.toFixed(2)} /L
              </span>
            </div>

            <div className="mt-2 text-[10px] text-slate-500">
              Source: PPAC.gov.in
            </div>
          </div>
        ))}
      </div>

      <p className="source mt-4">
        Prices as of 13 Jul 2026. Retail prices include taxes &amp; margins; blended cost is the estimated OMC procurement cost after 20% ethanol.
      </p>
    </div>
  );
}
