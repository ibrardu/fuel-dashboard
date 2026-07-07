"use client";

import { useState } from "react";
import { RefreshCw, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function LiveRateBadge() {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const fetchRate = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      const inr = data?.rates?.INR;
      if (typeof inr === "number") {
        const rounded = parseFloat(inr.toFixed(2));
        setRate(rounded);
        setUpdatedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        toast.success(`Live USD/INR: ₹${rounded}`);
      } else {
        throw new Error("Bad payload");
      }
    } catch {
      toast.error("Failed to fetch live rate");
      // keep previous or set fallback
      if (!rate) setRate(83.6);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kpi min-w-[118px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <DollarSign className="h-3.5 w-3.5" /> USD/INR
        </div>
        <button
          onClick={fetchRate}
          disabled={loading}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50"
          title="Refresh live rate"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="text-2xl font-semibold tabular-nums tracking-tight mt-1">
        {rate ? `₹${rate}` : "—"}
      </div>
      <div className="text-[10px] text-slate-500 mt-0.5">
        {updatedAt ? `as of ${updatedAt}` : "click to load live"}
      </div>
    </div>
  );
}
