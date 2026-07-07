"use client";

import { MapPin } from "lucide-react";

interface CityPrice {
  city: string;
  petrol: number;
  diesel: number;
}

const cityPrices: CityPrice[] = [
  { city: "Delhi", petrol: 102.12, diesel: 95.20 },
  { city: "Mumbai", petrol: 111.21, diesel: 97.83 },
  { city: "Kolkata", petrol: 113.51, diesel: 99.82 },
  { city: "Chennai", petrol: 107.76, diesel: 99.55 },
  { city: "Bengaluru", petrol: 110.82, diesel: 98.77 },
  { city: "Hyderabad", petrol: 116.99, diesel: 105.03 },
];

// Approximate E20 adjustment note (ethanol cheaper, OMC cost lower but retail often adjusted)
const E20_NOTE = "Current retail prices reflect E10/E20 rollout. E20 blended petrol typically lowers OMC procurement cost by ~₹1.5–3.5/L depending on ethanol pricing (₹62–68/L).";

export default function CityPrices() {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-500" /> City Fuel Prices
          </h2>
          <p className="subtle">As of 7 Jul 2026 • Source: PPAC / Oil Marketing Companies</p>
        </div>
        <div className="badge badge-green">Live Retail</div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>City</th>
              <th className="text-right">Petrol (₹/L)</th>
              <th className="text-right">Diesel (₹/L)</th>
              <th className="text-right">E20 Impact Note</th>
            </tr>
          </thead>
          <tbody>
            {cityPrices.map((row) => (
              <tr key={row.city}>
                <td className="font-medium text-white">{row.city}</td>
                <td className="text-right font-mono">{row.petrol.toFixed(2)}</td>
                <td className="text-right font-mono">{row.diesel.toFixed(2)}</td>
                <td className="text-right text-xs text-slate-400">E20 rollout active</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="source">
        {E20_NOTE} Data sourced from public reports referencing PPAC. Prices vary by state taxes &amp; dealer commissions.
      </p>
    </div>
  );
}
