"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { fetchUsdInrRate } from "@/lib/utils";

export default function LiveRateBadge() {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const hasAutoLoaded = useRef(false);

  const loadRate = async (showToast = false) => {
    setLoading(true);
    const liveRate = await fetchUsdInrRate();

    if (liveRate !== null) {
      setRate(liveRate);
      setUpdatedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      if (showToast) {
        toast.success(`Live USD/INR: ₹${liveRate}`);
      }
    } else {
      if (showToast) {
        toast.error("Failed to fetch live rate");
      }
      // Fallback only if we have nothing
      if (rate === null) {
        setRate(83.92);
        setUpdatedAt("fallback");
      }
    }
    setLoading(false);
  };

  // Auto-fetch on mount so the top KPI always shows a current value.
  // Using a ref guard + direct async call to satisfy strict lint rules.
  useEffect(() => {
    if (hasAutoLoaded.current) return;
    hasAutoLoaded.current = true;

    (async () => {
      setLoading(true);
      const liveRate = await fetchUsdInrRate();

      if (liveRate !== null) {
        setRate(liveRate);
        setUpdatedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } else {
        if (rate === null) {
          setRate(83.92);
          setUpdatedAt("fallback");
        }
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshRate = () => loadRate(true);

  return (
    <div className="kpi min-w-[118px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <DollarSign className="h-3.5 w-3.5" /> USD/INR
        </div>
        <button
          onClick={refreshRate}
          disabled={loading}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50"
          title="Refresh live rate"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="text-2xl font-semibold tabular-nums tracking-tight mt-1">
        {loading && rate === null ? "..." : rate ? `₹${rate}` : "—"}
      </div>
      <div className="text-[10px] text-slate-500 mt-0.5">
        {loading ? "updating..." : updatedAt ? `as of ${updatedAt}` : "live rate"}
      </div>
    </div>
  );
}
