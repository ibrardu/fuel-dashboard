"use client";

import { MapPin } from "lucide-react";

interface CityPrice {
  city: string;
  petrol: number;
  blended: number; // Blended cost to OMC after E20
}

const cityPrices: CityPrice[] = [
  { city: "Delhi", petrol: 102.12, blended: 99.50 },
  { city: "Mumbai", petrol: 111.21, blended: 108.40 },
  { city: "Kolkata", petrol: 113.51, blended: 110.70 },
  { city: "Chennai", petrol: 107.76, blended: 105.00 },
  { city: "Bengaluru", petrol: 110.82, blended: 108.10 },
  { city: "Hyderabad", petrol: 116.99, blended: 114.20 },
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

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>City</th>
              <th className="text-right">Petrol (₹/L)</th>
              <th className="text-right">Blended cost to OMC</th>
            </tr>
          </thead>
          <tbody>
            {cityPrices.map((row) => (
              <tr key={row.city}>
                <td className="font-medium text-white">{row.city}</td>
                <td className="text-right font-mono">{row.petrol.toFixed(2)}</td>
                <td className="text-right font-mono text-emerald-400">
                  ~{row.blended.toFixed(2)} /L
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="source">
        Source: PPAC.gov.in • Prices as of 7 Jul 2026. Retail prices include taxes; blended cost reflects OMC procurement after 20% ethanol mixing.
      </p>
    </div>
  );
}
