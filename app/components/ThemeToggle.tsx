"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "fuelledger:theme";
const THEME_COLOR = { dark: "#0b1120", light: "#f8fafc" };

type Theme = "light" | "dark";

export default function ThemeToggle() {
  // Matches the "dark" default the inline bootstrap script in layout.tsx
  // renders before hydration; synced to the real attribute on mount so
  // there's no hydration mismatch (same pattern as the city-selection
  // localStorage restore in LocationAwareDashboard).
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Syncs from the attribute the inline bootstrap script (layout.tsx) set
    // before hydration — can't read it in the initializer without a
    // server/client render mismatch, same reasoning as LocationAwareDashboard.
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(current);
    }
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[next]);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08]"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
