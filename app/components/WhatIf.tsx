"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { blendedBase } from "@/lib/costModel";

interface Props {
  defaultBase: number;
  defaultEthanol: number;
  defaultBlendPct: number;
  quotedRetail: number;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-white">
          {unit === "%" ? `${value}%` : `₹${value.toFixed(2)}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider"
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
        aria-label={label}
      />
      <div className="flex justify-between text-[10px] tabular-nums text-slate-600">
        <span>{unit === "%" ? `${min}%` : `₹${min}`}</span>
        <span>{unit === "%" ? `${max}%` : `₹${max}`}</span>
      </div>
    </label>
  );
}

export default function WhatIf({ defaultBase, defaultEthanol, defaultBlendPct, quotedRetail }: Props) {
  const [base, setBase] = useState(Math.round(defaultBase * 2) / 2);
  const [ethanol, setEthanol] = useState(Math.round(defaultEthanol * 2) / 2);
  const [blendPct, setBlendPct] = useState(defaultBlendPct);

  const blended = blendedBase(base, ethanol, blendPct / 100);
  const discountPct = (1 - blended / quotedRetail) * 100;
  const vsPetrol = base - blended; // +ve: blending cuts input cost

  return (
    <div className="card" id="whatif">
      <div className="card-header">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-emerald-400" /> What-If Calculator
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Drag to see the real input cost under your own assumptions
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <Slider label="Base MS cost (refinery gate)" value={base} min={40} max={80} step={0.5} unit="₹" onChange={setBase} />
        <Slider label="Ethanol price (OMC landed)" value={ethanol} min={40} max={90} step={0.5} unit="₹" onChange={setEthanol} />
        <Slider label="Ethanol blend" value={blendPct} min={0} max={30} step={1} unit="%" onChange={setBlendPct} />
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/[0.12] to-emerald-500/[0.03] p-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-emerald-400/70">
              Blended cost
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-emerald-300 sm:text-3xl">
              ₹{blended.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500">per litre, E{blendPct}</div>
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              vs quoted RSP
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">
              −{discountPct.toFixed(0)}%
            </div>
            <div className="text-[10px] tabular-nums text-slate-500">₹{quotedRetail.toFixed(2)} at pump</div>
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              vs pure petrol
            </div>
            <div
              className={`mt-1 text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl ${
                vsPetrol >= 0 ? "text-emerald-300" : "text-amber-300"
              }`}
            >
              {vsPetrol >= 0 ? "−" : "+"}₹{Math.abs(vsPetrol).toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500">
              {vsPetrol >= 0 ? "blending saves OMCs" : "blend premium"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
