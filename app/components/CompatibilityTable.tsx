"use client";

import { Car } from "lucide-react";

interface VehicleRow {
  make: string;
  models: string;
  status: "Yes" | "Partial" | "Check";
  notes: string;
}

const rows: VehicleRow[] = [
  { make: "Maruti Suzuki", models: "Swift, Baleno, WagonR, Brezza (2021+)", status: "Yes", notes: "Most BS6 models E20 ready from factory." },
  { make: "Hyundai", models: "i20, Creta, Venue, Verna (2022+)", status: "Yes", notes: "Confirmed E20 compatible; check owner manual for pre-2022." },
  { make: "Tata Motors", models: "Nexon, Punch, Tiago, Altroz (BS6)", status: "Yes", notes: "All recent petrol models E20 compliant." },
  { make: "Honda", models: "City, Amaze, WR-V (2020+)", status: "Yes", notes: "E20 material upgrades on newer platforms." },
  { make: "Toyota", models: "Glanza, Urban Cruiser, Innova (petrol)", status: "Yes", notes: "E20 approved. Hybrids also compatible." },
  { make: "Mahindra", models: "XUV300, Bolero, Thar (petrol variants)", status: "Partial", notes: "Most 2021+ models OK; older confirm via dealer." },
  { make: "Renault", models: "Kwid, Triber, Kiger", status: "Yes", notes: "E20 ready on current line-up." },
  { make: "Volkswagen / Skoda", models: "Taigun, Virtus, Kushaq, Slavia", status: "Yes", notes: "Modern VW Group India platforms support E20." },
  { make: "Older Vehicles", models: "Pre-2010 / BS3 / BS4 cars", status: "Check", notes: "May need fuel system inspection. Risk of elastomer degradation over time." },
];

export default function CompatibilityTable() {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <Car className="h-5 w-5 text-emerald-500" /> Vehicle E20 Compatibility
          </h2>
          <p className="subtle">Major OEMs (India market) • Always verify with your vehicle manual / service center</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Manufacturer</th>
              <th>Sample Models</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="font-medium text-white whitespace-nowrap">{row.make}</td>
                <td className="text-sm text-slate-300">{row.models}</td>
                <td>
                  {row.status === "Yes" && <span className="badge badge-green">E20 Ready</span>}
                  {row.status === "Partial" && <span className="badge badge-amber">Partial / Check</span>}
                  {row.status === "Check" && <span className="badge badge-amber">Verify</span>}
                </td>
                <td className="text-sm text-slate-400">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="source">
        Data compiled from public OEM statements, service bulletins and ARAI guidance. Not official certification. Expand later by ingesting car manuals or OEM APIs.
      </p>
    </div>
  );
}
