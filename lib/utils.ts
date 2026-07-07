import { format } from "date-fns";

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd MMM yyyy");
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd MMM yyyy, HH:mm");
}

export interface DailyLog {
  id: string;
  date: string;
  crudePrice: number; // USD per barrel
  usdInr: number;
  blendedCost: number; // Rs / L effective after blend
  notes?: string;
}

export function loadLogs(): DailyLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("fuelledger-logs");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLogs(logs: DailyLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("fuelledger-logs", JSON.stringify(logs));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
