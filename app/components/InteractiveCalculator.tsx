"use client";

import { useState } from "react";
import { Calculator, TrendingDown } from "lucide-react";

export default function InteractiveCalculator() {
  const [basePetrol, setBasePetrol] = useState(102.5); // Rs/L ex-refinery or retail proxy
  const [ethanolPrice, setEthanolPrice] = useState(65.0); // Typical OMC buy price for ethanol
  const [blendPercent, setBlendPercent] = useState(20);

  const blendedCost = (1 - blendPercent / 100) * basePetrol + (blendPercent / 100) * ethanolPrice;
  const savings = basePetrol - blendedCost;
  const savingsPct = (savings / basePetrol) * 100;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-500" /> What-If Blending Calculator
          </h2>
          <p className="subtle">Estimate OMC blended procurement cost impact</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Controls */}
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <label className="text-slate-300">Base Petrol Price (₹/L)</label>
              <span className="font-mono text-emerald-400">{basePetrol.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="80"
              max="130"
              step="0.1"
              value={basePetrol}
              onChange={(e) => setBasePetrol(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <input
              type="number"
              value={basePetrol}
              onChange={(e) => setBasePetrol(Math.max(60, Math.min(150, parseFloat(e.target.value) || 0)))}
              className="input w-full mt-2"
              step="0.1"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <label className="text-slate-300">Ethanol Price (₹/L, OMC buy)</label>
              <span className="font-mono text-emerald-400">{ethanolPrice.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="45"
              max="85"
              step="0.5"
              value={ethanolPrice}
              onChange={(e) => setEthanolPrice(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <input
              type="number"
              value={ethanolPrice}
              onChange={(e) => setEthanolPrice(Math.max(40, Math.min(100, parseFloat(e.target.value) || 0)))}
              className="input w-full mt-2"
              step="0.5"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <label className="text-slate-300">Ethanol Blend %</label>
              <span className="font-mono text-emerald-400">{blendPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={blendPercent}
              onChange={(e) => setBlendPercent(parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <div>0% (E0)</div>
              <div>20% (E20)</div>
              <div>30%</div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-center">
          <div className="space-y-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500">Blended Cost (per litre)</div>
              <div className="text-5xl font-semibold tracking-tighter text-white tabular-nums mt-1">
                ₹{blendedCost.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-2 text-emerald-400">
              <TrendingDown className="h-4 w-4" />
              <span className="font-medium">
                Savings: ₹{savings.toFixed(2)}/L ({savingsPct.toFixed(1)}%)
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800 text-sm text-slate-400 space-y-1">
              <div>• Base (100% petrol): <span className="font-mono text-slate-300">₹{basePetrol.toFixed(2)}</span></div>
              <div>• At current E20: <span className="font-mono text-slate-300">₹{blendedCost.toFixed(2)}</span></div>
            </div>
          </div>

          <p className="source mt-auto pt-4">
            Simplified model. Actual OMC landed cost also factors freight, taxes, marketing margins &amp; government pricing policy.
          </p>
        </div>
      </div>
    </div>
  );
}
