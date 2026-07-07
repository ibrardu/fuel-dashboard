"use client";

import { useState } from "react";
import { Calendar, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { DailyLog, formatDate, generateId, loadLogs, saveLogs } from "@/lib/utils";

export default function DailyDataLogger() {
  const [logs, setLogs] = useState<DailyLog[]>(() => {
    // Safe client-side load (avoids setState-in-effect lint)
    if (typeof window !== "undefined") {
      return loadLogs();
    }
    return [];
  });
  const [crudePrice, setCrudePrice] = useState(78);
  const [usdInr, setUsdInr] = useState(83.4);
  const [blendedCost, setBlendedCost] = useState(94.5);
  const [notes, setNotes] = useState("");
  const [isFetchingRate, setIsFetchingRate] = useState(false);
  const [rateSource, setRateSource] = useState<string | null>(null);

  // Live USD/INR from free public API (no key required)
  const fetchLiveUsdInr = async () => {
    setIsFetchingRate(true);
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD", {
        // cache: 'no-store' not needed for client fetch in this context
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const rate = data?.rates?.INR;
      if (typeof rate === "number") {
        setUsdInr(parseFloat(rate.toFixed(2)));
        setRateSource("live");
        toast.success("Live USD/INR rate loaded", {
          description: `₹${rate.toFixed(2)} (open.er-api.com)`,
        });
      } else {
        throw new Error("Invalid rate data");
      }
    } catch (err) {
      console.error(err);
      // Fallback to a reasonable default
      const fallback = 83.65;
      setUsdInr(fallback);
      setRateSource("fallback");
      toast.error("Could not fetch live rate", {
        description: `Using fallback ₹${fallback}. Check your connection.`,
      });
    } finally {
      setIsFetchingRate(false);
    }
  };

  const addLog = () => {
    const newLog: DailyLog = {
      id: generateId(),
      date: new Date().toISOString(),
      crudePrice: Number(crudePrice),
      usdInr: Number(usdInr),
      blendedCost: Number(blendedCost),
      notes: notes.trim() || undefined,
    };

    const updated = [newLog, ...logs];
    setLogs(updated);
    saveLogs(updated);

    toast.success("Daily log saved", {
      description: `${formatDate(newLog.date)} • ₹${blendedCost.toFixed(2)}/L`,
    });

    // Reset notes only, keep values for next entry
    setNotes("");
  };

  const deleteLog = (id: string) => {
    const updated = logs.filter((l) => l.id !== id);
    setLogs(updated);
    saveLogs(updated);
    toast.info("Log entry deleted");
  };

  const clearAll = () => {
    setLogs([]);
    saveLogs([]);
    toast("All logs cleared");
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="section-title flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-500" /> Daily Data Logger
          </h2>
          <p className="subtle">Persist to browser (localStorage). Click <span className="font-medium text-emerald-400">Live</span> to pull current USD/INR from market.</p>
        </div>
      </div>

      {/* Entry form */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-5">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Crude (USD/bbl)</label>
          <input
            type="number"
            step="0.1"
            value={crudePrice}
            onChange={(e) => setCrudePrice(parseFloat(e.target.value) || 0)}
            className="input w-full"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-slate-400">USD / INR</label>
            <button
              type="button"
              onClick={fetchLiveUsdInr}
              disabled={isFetchingRate}
              className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-60"
              title="Fetch live market rate"
            >
              <RefreshCw className={`h-3 w-3 ${isFetchingRate ? "animate-spin" : ""}`} />
              {isFetchingRate ? "Fetching..." : "Live"}
            </button>
          </div>
          <input
            type="number"
            step="0.01"
            value={usdInr}
            onChange={(e) => {
              setUsdInr(parseFloat(e.target.value) || 0);
              setRateSource(null); // manual override clears live marker
            }}
            className="input w-full"
          />
          {rateSource === "live" && (
            <div className="text-[10px] text-emerald-400 mt-0.5">✓ live market</div>
          )}
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Blended Cost (₹/L)</label>
          <input
            type="number"
            step="0.1"
            value={blendedCost}
            onChange={(e) => setBlendedCost(parseFloat(e.target.value) || 0)}
            className="input w-full"
          />
        </div>
        <div className="md:col-span-1">
          <label className="text-xs text-slate-400 block mb-1">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E20 rollout / event"
            className="input w-full"
          />
        </div>
        <div className="flex items-end gap-2">
          <button onClick={addLog} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" /> Log Entry
          </button>
          {logs.length > 0 && (
            <button onClick={clearAll} className="btn text-red-400 hover:bg-red-950/60 border-red-900/50">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Logs table */}
      {logs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th className="text-right">Crude USD/bbl</th>
                <th className="text-right">USD/INR</th>
                <th className="text-right">Blended ₹/L</th>
                <th>Notes</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="font-medium">{formatDate(log.date)}</td>
                  <td className="text-right font-mono">{log.crudePrice.toFixed(1)}</td>
                  <td className="text-right font-mono">{log.usdInr.toFixed(2)}</td>
                  <td className="text-right font-mono font-medium text-emerald-400">₹{log.blendedCost.toFixed(2)}</td>
                  <td className="text-slate-400 text-sm max-w-[220px] truncate">{log.notes || "—"}</td>
                  <td>
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-lg">
          No logs yet. Add your first daily entry above.
        </div>
      )}

      <p className="source">
        Data stored locally in your browser only. USD/INR pulls from open.er-api.com (free public market data). Clear browser data or use “Clear” to reset.
      </p>
    </div>
  );
}
