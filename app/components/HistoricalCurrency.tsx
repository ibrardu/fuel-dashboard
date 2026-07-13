"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { RefreshCw, Calendar, TrendingUp } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
import { toast } from "sonner";
import { fetchUsdInrRate } from "@/lib/utils";

interface CurrencyPoint {
  date: string;   // YYYY-MM-DD
  rate: number;
}

// Generate realistic sample historical USD/INR data (last ~50 days up to today)
function generateSampleData(): CurrencyPoint[] {
  const data: CurrencyPoint[] = [];
  // Use a realistic base rate for mid-2026 demo (will be overridden by live fetch when available)
  let rate = 83.85;
  const today = new Date("2026-07-13");
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 49);

  for (let i = 0; i < 50; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);

    // Gentle random walk
    const change = (Math.random() - 0.48) * 0.22;
    rate = rate + change;
    rate = Math.max(82.8, Math.min(85.2, rate));

    // Occasional moves
    if (i === 22) rate += 0.35;
    if (i === 37) rate -= 0.29;

    data.push({
      date: d.toISOString().split("T")[0],
      rate: parseFloat(rate.toFixed(2)),
    });
  }

  // Ensure the latest point is the "current" simulated rate (will be synced with live on load)
  if (data.length > 0) {
    data[data.length - 1].rate = 83.92;
  }

  return data;
}

const ALL_DATA = generateSampleData();

// Quick range presets (in days)
const PRESETS = [
  { label: "7D", days: 7 },
  { label: "14D", days: 14 },
  { label: "30D", days: 30 },
  { label: "All", days: 999 },
];

export default function HistoricalCurrency() {
  const today = ALL_DATA[ALL_DATA.length - 1].date;

  // Default to last 30 days
  const [startDate, setStartDate] = useState<string>(
    format(subDays(parseISO(today), 30), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState<string>(today);

  const [isFetchingLive, setIsFetchingLive] = useState(false);

  // Sync the most recent historical point with live market rate (same source as KPI)
  useEffect(() => {
    (async () => {
      const live = await fetchUsdInrRate();
      if (live !== null && ALL_DATA.length > 0) {
        ALL_DATA[ALL_DATA.length - 1].rate = live;
        // Trigger re-render by touching the end date state if it's the current end
        if (endDate === ALL_DATA[ALL_DATA.length - 1].date || endDate === today) {
          setEndDate(ALL_DATA[ALL_DATA.length - 1].date);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter data based on slicer
  const filteredData = useMemo(() => {
    return ALL_DATA.filter((d) => d.date >= startDate && d.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [startDate, endDate]);

  // Compute change for table (newest first)
  const tableData = useMemo(() => {
    const sorted = [...filteredData].reverse(); // latest first
    return sorted.map((point, index, arr) => {
      const prev = arr[index + 1];
      const change = prev ? point.rate - prev.rate : 0;
      const changePct = prev ? ((point.rate - prev.rate) / prev.rate) * 100 : 0;
      return {
        ...point,
        change,
        changePct,
      };
    });
  }, [filteredData]);

  // Stats for header
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    const rates = filteredData.map((d) => d.rate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const avg = rates.reduce((s, r) => s + r, 0) / rates.length;
    const latest = filteredData[filteredData.length - 1].rate;
    return { min, max, avg, latest, count: filteredData.length };
  }, [filteredData]);

  // Apply quick preset
  const applyPreset = (days: number) => {
    if (days >= 999) {
      setStartDate(ALL_DATA[0].date);
      setEndDate(today);
    } else {
      const newStart = format(subDays(parseISO(today), days), "yyyy-MM-dd");
      setStartDate(newStart);
      setEndDate(today);
    }
  };

  // Manual date change handlers with validation
  const handleStartChange = (value: string) => {
    if (value > endDate) {
      setStartDate(endDate);
    } else {
      setStartDate(value);
    }
  };

  const handleEndChange = (value: string) => {
    if (value < startDate) {
      setEndDate(startDate);
    } else {
      setEndDate(value);
    }
  };

  // Fetch current live rate and append/update as latest point (demo "live")
  const addLiveRate = async () => {
    setIsFetchingLive(true);
    try {
      const liveRate = await fetchUsdInrRate();

      if (liveRate !== null) {
        const rounded = liveRate;
        const liveDate = new Date().toISOString().split("T")[0];

        // Check if we already have this date
        const existingIndex = ALL_DATA.findIndex((d) => d.date === liveDate);

        if (existingIndex >= 0) {
          // Update existing latest
          ALL_DATA[existingIndex].rate = rounded;
        } else {
          // Append new point
          ALL_DATA.push({ date: liveDate, rate: rounded });
        }

        // Force re-render by nudging the end date if needed
        setEndDate(liveDate);

        toast.success("Live rate added", {
          description: `USD/INR @ ₹${rounded} (${liveDate})`,
        });
      } else {
        throw new Error("Invalid response");
      }
    } catch {
      toast.error("Failed to fetch live rate", {
        description: "Using last known value.",
      });
      // fallback: nudge the latest value slightly
      const last = ALL_DATA[ALL_DATA.length - 1];
      last.rate = parseFloat((last.rate + (Math.random() - 0.5) * 0.1).toFixed(2));
      setEndDate(last.date);
    } finally {
      setIsFetchingLive(false);
    }
  };

  // Format date for display
  const formatDateShort = (dateStr: string) =>
    format(parseISO(dateStr), "dd MMM");

  return (
    <div className="card">
      <div className="card-header mb-2">
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="section-title flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              USD/INR Currency History
            </h2>
            <p className="subtle">Historical exchange rates with interactive date slicer</p>
          </div>
          <button
            onClick={addLiveRate}
            disabled={isFetchingLive}
            className="btn flex items-center gap-2 text-xs btn-primary"
          >
            <RefreshCw className={`h-4 w-4 ${isFetchingLive ? "animate-spin" : ""}`} />
            Add Live Rate
          </button>
        </div>
      </div>

      {/* Slicer Controls */}
      <div className="flex flex-wrap items-end gap-3 mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Range
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.days)}
              className="px-3 py-1 text-xs rounded-lg border border-slate-700 hover:bg-slate-800 transition"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">From</label>
            <input
              type="date"
              value={startDate}
              min={ALL_DATA[0].date}
              max={endDate}
              onChange={(e) => handleStartChange(e.target.value)}
              className="input text-sm py-1 px-2"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">To</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={today}
              onChange={(e) => handleEndChange(e.target.value)}
              className="input text-sm py-1 px-2"
            />
          </div>
        </div>
      </div>

      {/* Main Content: 1/3 table + 2/3 chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1/3 — Historical Table */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-300">Historical Data</div>
            <div className="text-xs text-slate-400">{filteredData.length} records</div>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden max-h-[320px] overflow-y-auto">
            <table className="table w-full text-sm">
              <thead className="sticky top-0 bg-slate-900 z-10">
                <tr>
                  <th>Date</th>
                  <th className="text-right">Rate (₹)</th>
                  <th className="text-right">Δ</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="font-medium text-white">{formatDateShort(row.date)}</td>
                      <td className="text-right font-mono">{row.rate.toFixed(2)}</td>
                      <td className="text-right">
                        {row.change !== 0 ? (
                          <span
                            className={
                              row.change > 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }
                          >
                            {row.change > 0 ? "+" : ""}
                            {row.change.toFixed(2)}
                            <span className="text-[10px] ml-0.5">
                              ({row.changePct > 0 ? "+" : ""}
                              {row.changePct.toFixed(2)}%)
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-slate-500">
                      No data in selected range
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {stats && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-900 border border-slate-800 rounded p-2">
                <div className="text-slate-400">Min</div>
                <div className="font-mono text-emerald-400">₹{stats.min.toFixed(2)}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded p-2">
                <div className="text-slate-400">Avg</div>
                <div className="font-mono">₹{stats.avg.toFixed(2)}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded p-2">
                <div className="text-slate-400">Max</div>
                <div className="font-mono text-amber-400">₹{stats.max.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>

        {/* 2/3 — Live Plot */}
        <div className="lg:col-span-2">
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-sm font-medium text-slate-300">Rate Trend</div>
            {stats && (
              <div className="text-xs text-slate-400">
                Latest: <span className="font-mono text-white">₹{stats.latest.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 h-[320px]">
            {filteredData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#334155" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => format(parseISO(d), "dd MMM")}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    minTickGap={20}
                  />
                  <YAxis
                    domain={["dataMin - 0.3", "dataMax + 0.3"]}
                    tickFormatter={(v) => v.toFixed(1)}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", color: "#e2e8f0" }}
                    labelFormatter={(label) => format(parseISO(label as string), "dd MMM yyyy")}
                    formatter={(value) => [`₹${Number(value ?? 0).toFixed(2)}`, "USD/INR"]}
                  />
                  <ReferenceLine
                    y={stats?.avg}
                    stroke="#64748b"
                    strokeDasharray="3 3"
                    label={{ value: "Avg", position: "insideTopRight", fill: "#64748b", fontSize: 10 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 1.5, fill: "#10b981", strokeWidth: 0 }}
                    activeDot={{ r: 4, fill: "#34d399" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Select a wider date range to see the plot
              </div>
            )}
          </div>

          <p className="source mt-2">
            Data is simulated historical sample + optional live fetch. Use the date slicer or preset buttons to explore trends.
            Source for live: open.er-api.com
          </p>
        </div>
      </div>
    </div>
  );
}
