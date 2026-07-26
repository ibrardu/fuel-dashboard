"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { computeCost } from "@/lib/costModel";

const inr = (n: number) => `₹${n.toFixed(2)}`;
const signedInr = (n: number) => `${n < 0 ? "−" : "+"}₹${Math.abs(n).toFixed(2)}`;

interface SliderProps {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}

function Slider({ label, value, display, min, max, step, onChange }: SliderProps) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <label className="text-slate-300">{label}</label>
        <span className="font-mono text-emerald-400">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-emerald-500"
      />
    </div>
  );
}

// Delhi tax stack held fixed so the sliders isolate the blend economics.
const DELHI = { freight: 0.24, dealer_commission: 3.77, central_excise: 19.9, vat_rate: 0.194 };

export default function InteractiveCalculator({
  defaultBase,
  defaultEthanol,
  defaultBlendPct,
  defaultEnergyFactor,
  quotedRetail,
}: {
  defaultBase: number;
  defaultEthanol: number;
  defaultBlendPct: number;
  defaultEnergyFactor: number;
  quotedRetail: number;
}) {
  const [base, setBase] = useState(defaultBase);
  const [ethanol, setEthanol] = useState(defaultEthanol);
  const [blendPct, setBlendPct] = useState(defaultBlendPct);
  const [energyFactor, setEnergyFactor] = useState(defaultEnergyFactor);

  const cost = computeCost({
    buildup: { base_price: base, ...DELHI },
    vat_rate: DELHI.vat_rate,
    quoted_retail: quotedRetail,
    ethanol_price: ethanol,
    blend_fraction: blendPct / 100,
    energy_factor: energyFactor,
  });
  const overpaying = cost.gap > 0;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <Calculator className="h-5 w-5 text-emerald-500" /> What-if calculator
          </h2>
          <p className="subtle">
            Move the inputs and watch the fair price and gap respond. Delhi tax stack (excise ₹
            {DELHI.central_excise.toFixed(2)}, VAT {(DELHI.vat_rate * 100).toFixed(1)}%) held fixed.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-5">
          <Slider
            label="Petrol base price (₹/L, refinery gate)"
            value={base}
            display={inr(base)}
            min={45}
            max={70}
            step={0.1}
            onChange={setBase}
          />
          <Slider
            label="Ethanol landed price (₹/L)"
            value={ethanol}
            display={inr(ethanol)}
            min={45}
            max={85}
            step={0.5}
            onChange={setEthanol}
          />
          <Slider
            label="Ethanol blend"
            value={blendPct}
            display={`${blendPct}% (E${blendPct})`}
            min={0}
            max={30}
            step={1}
            onChange={setBlendPct}
          />
          <Slider
            label="Energy factor vs pure petrol"
            value={energyFactor}
            display={energyFactor.toFixed(3)}
            min={0.9}
            max={1}
            step={0.001}
            onChange={setEnergyFactor}
          />
        </div>

        <div className="flex flex-col justify-center rounded-xl border border-slate-800 bg-slate-950 p-5">
          <div className="space-y-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500">
                {overpaying ? "Withheld saving (you overpay)" : "Blend premium in the fair price"}
              </div>
              <div
                className={`mt-1 text-5xl font-semibold tracking-tighter tabular-nums ${
                  overpaying ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {inr(Math.abs(cost.gap))}
                <span className="text-xl font-normal text-slate-500"> /L</span>
              </div>
            </div>

            <div className="space-y-1 border-t border-slate-800 pt-3 text-sm text-slate-400">
              <div className="flex justify-between">
                <span>Blended base ({blendPct}% ethanol)</span>
                <span className="font-mono text-slate-200">{inr(cost.blended_base)}</span>
              </div>
              <div className="flex justify-between">
                <span>Blending saving on the base</span>
                <span className="font-mono text-slate-200">{signedInr(cost.blending_saving)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fair pass-through retail</span>
                <span className="font-mono text-slate-200">{inr(cost.fair_retail)}</span>
              </div>
              <div className="flex justify-between">
                <span>Quoted pump price</span>
                <span className="font-mono text-slate-200">{inr(quotedRetail)}</span>
              </div>
              <div className="flex justify-between">
                <span>Real energy-adjusted price</span>
                <span className="font-mono text-slate-200">{inr(cost.effective_retail)}</span>
              </div>
            </div>
          </div>

          <p className="source mt-auto pt-4">
            Fair retail recomputes ad-valorem VAT on the blended base. Simplified — actual OMC economics also
            include marketing margins and under/over-recoveries.
          </p>
        </div>
      </div>
    </div>
  );
}
