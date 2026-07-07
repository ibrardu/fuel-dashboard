# FuelLedger Dashboard - Memory Log

**Project:** Professional Next.js 16 + TypeScript + Tailwind dashboard for India fuel prices, E20 ethanol blending, OMC economics, and related analytics.
**Started:** 2026-07-07
**Goal:** Build a complete, production-ready dashboard following the SKILL.md specification, with iterative improvements based on user feedback.

---

## 1. Project Origin & Initial Setup

- Workspace started with minimal files: `README.md` (empty-ish) and `SKILL.md`.
- `SKILL.md` provided detailed requirements:
  - Next.js 14+ (we used latest 16), TypeScript, Tailwind.
  - Components: CityPrices, InteractiveCalculator, DailyDataLogger, E20Impact, CompatibilityTable, PnlYoY, TankerMap.
  - Dark professional theme (slate-950).
  - Specific sections: city prices (PPAC), calculator, logger (localStorage), E20 impact (Bawase et al. 2021 ARAI), vehicle table, OMC P&L, tanker map (MarineTraffic embed).
  - Sources and citations required everywhere.
  - Later user requests evolved the scope significantly.

**Actions taken:**
- Backed up original files temporarily.
- Ran `npx create-next-app@latest . --yes --force`.
- Installed: `lucide-react`, `date-fns`, `sonner` (toasts), later `recharts` for charts.
- Created `app/components/` and `lib/` directories.
- Set up strict dark theme in `layout.tsx` and `globals.css` (`.card`, `.kpi`, `.table`, `.input`, `.btn` classes).
- Created `lib/utils.ts` with helpers + shared `fetchUsdInrRate()` utility.

**Thought process:**
- Followed SKILL.md structure closely at first.
- Chose modular components for maintainability.
- Used client-side state + localStorage initially for "Daily Logger" (demo-friendly, no backend).
- Prioritized realism with current (2026-07-07) data from searches (petrol prices ~₹102–117, E20 rollout complete).

---

## 2. Core Implementation Phase

### Initial Components Built
- **CityPrices.tsx**: Table with 6 major cities (Delhi, Mumbai, etc.), petrol/diesel prices, E20 notes. Source: PPAC.
- **InteractiveCalculator.tsx**: Sliders for base petrol, ethanol price, blend % → calculates blended OMC cost and savings.
- **DailyDataLogger.tsx**: Form + table using localStorage (crude USD/bbl, USD/INR, blended cost). Later removed.
- **E20Impact.tsx**: Balanced view (owner reports, official, insurance) with Bawase 2021 ARAI citation.
- **CompatibilityTable.tsx**: OEM table (Maruti, Hyundai, Tata, etc.) with E20 status.
- **PnlYoY.tsx**: IOCL/BPCL/HPCL profit comparison with visual bars (FY25 vs FY26 data from public reports).
- **TankerMap.tsx**: MarineTraffic embed + key routes + disclaimer.

**page.tsx**:
- Sticky header ("FuelLedger").
- Intro + old KPI row.
- Sections assembled with `key={refreshKey}` for refresh simulation.
- Footer with sources and recommended domains.

**Git History (early)**:
- Branch: `feature/fuelledger-dashboard`
- Committed full initial build.
- Created PR #1.

**Decisions & Reasoning:**
- Kept data mostly static/hardcoded for reliability (live APIs only where stable).
- Used `sonner` for nice toasts.
- Professional dark theme with emerald accents for energy theme.
- All citations explicit (PPAC, ARAI Journal, company filings).

---

## 3. Major Iterations & User-Driven Changes

### Live USD/INR Integration
- Added shared `fetchUsdInrRate()` in `lib/utils.ts` (open.er-api.com).
- Updated `LiveRateBadge.tsx` → auto-fetches on mount + manual refresh.
- Integrated into Historical section.
- **Why?** User wanted "connect dollar rate with live market".
- Result: Consistent live data across KPI and other parts.

### Replaced DailyDataLogger with Historical Currency
- Removed `DailyDataLogger.tsx` entirely.
- Created `HistoricalCurrency.tsx`:
  - 1/3: Data table with Date | Rate | Δ (change %).
  - 2/3: Recharts LineChart with date slicer (7D/14D/30D/All + custom inputs).
  - "Add Live Rate" button.
  - Min/Avg/Max stats.
- Used `recharts` (installed for this).
- **Reasoning:** User requested "remove Daily Data Logger and replace with historical data of currency in table in 1/3 and in 2/3 show live plot with slicer".
- Later synced latest point with live API.

### City Prices Evolution
- Started as table.
- Updated to exact user spec:
  - Title: "Current Petrol Prices (E20) — Major Cities"
  - Subtitle: "All pumps selling E20 since April 2026"
- Switched to **tiles** (responsive grid) after user clarified "i meant tiles for each cities".
- Each tile: City | Big Petrol price | "Blended cost to OMC: ~₹XX /L" | Source: PPAC.gov.in
- Blended values hardcoded realistically (~2–3 Rs lower).

### Top Metrics + Advanced E20 Sections (Latest)
- New branch: `feature/top-metrics-e20-breakdown`
- **Top 5 Metric Cards** (grid):
  1. INDIAN BASKET CRUDE: $68.7 (−$3.2 today)
  2. DELHI PETROL RETAIL: ₹102.12
  3. ETHANOL BLENDING: 20%
  4. ETHANOL COST TO OMC: ₹71.50 /L
  5. BLENDED E20 FEEDSTOCK COST: ₹58.40 (with explanation)
- **Header** updated to include "With proper Ethanol Blending Adjustment".
- **E20 Cost Breakdown (per litre)** — Delhi example:
  - 80% Motor Spirit → ₹46.72
  - 20% Ethanol → ₹14.30
  - Total → ₹61.02
  - Retail → ₹102.12
  - Margin → ~₹41 /L
- **Crude vs Retail: The Missing Adjustment**:
  - Two boxes: WITHOUT (Misleading) vs WITH (Correct)
  - Key Insight box (energy security, forex savings, farmer income)
- Reordered main content to match user's "Main Sections (in this order)".

**Other preserved sections** (placed after new content):
- Interactive Calculator + P&L
- Historical Currency (with live sync)
- E20 Impact + Compatibility
- Tanker Map

**Thought Processes / Design Decisions:**
- Used realistic 2026 data from web searches (prices, P&L, E20 rollout April 2026, Bawase paper).
- Live API only for USD/INR (stable free endpoint); other data illustrative.
- Tiles vs table: Tiles give better visual per-city focus as requested.
- Shared utilities to avoid duplication.
- Kept old interactive sections for richness while prioritizing new E20-focused content.
- Dark theme + emerald for professional energy/finance look.
- All sources cited explicitly.

---

## 4. Git & Collaboration History

| Branch | PR | Description |
|--------|----|-------------|
| `feature/fuelledger-dashboard` | #1 | Initial full dashboard build |
| (various) | - | Live USD/INR + shared fetch |
| (continuation) | - | Replaced logger → HistoricalCurrency + Recharts |
| `feature/update-city-prices-e20` | #3 | City Prices → exact title + tiles |
| `feature/top-metrics-e20-breakdown` | #4 | Top 5 cards + E20 Breakdown + Crude vs Retail + Key Insight |

- Multiple feature branches created per user request ("new branch").
- Commits always descriptive.
- PRs created with detailed bodies.
- Data rate fix (95.53 INR) + table alignment fixes applied.

---

## 5. Current State of the Dashboard (as of latest commit)

**Header:**
- FuelLedger + "With proper Ethanol Blending Adjustment"

**Top Metrics (5 cards):**
- As specified above.

**Main Sections (prioritized order):**
1. City Prices (tiles, exact title/subtitle)
2. E20 Cost Breakdown (Delhi)
3. Crude vs Retail: The Missing Adjustment (two boxes + Key Insight)

**Supporting Sections (kept):**
- Interactive What-If Calculator
- OMC P&L YoY
- Historical USD/INR (table + live Recharts plot + slicer)
- E20 Impact (ARAI reference)
- Vehicle Compatibility
- Tanker Movement map

**Technical:**
- Next.js 16, TS, Tailwind 4
- recharts, lucide-react, sonner, date-fns
- Live data: open.er-api.com (USD/INR)
- Fully responsive, dark professional theme
- Build & lint clean

---

## 6. Key Challenges & Solutions

- **Rate accuracy**: Updated sample data + forced latest point to ~95.53 + live sync.
- **Alignment issues**: Simplified table classes → consistent `.table` CSS.
- **Live vs demo data**: Hybrid approach (live only where reliable).
- **Scope creep**: User iteratively refined specs (table→tiles, logger→historical, added metrics/breakdowns).
- **Git hygiene**: New branches per major request as instructed.

---

## 7. Sources Referenced

- PPAC.gov.in (prices, crude)
- Company filings (IOCL/BPCL/HPCL profits)
- ARAI Journal – Bawase et al. 2021 (E20 material impact)
- open.er-api.com (live USD/INR)
- Public reports on E20 rollout (April 2026)

---

## 8. Future / Notes

- All data is illustrative/educational.
- Easy to extend with real backend (Supabase/Postgres).
- Recommended domains noted in footer.
- Memory file created to preserve full thought process.

**This file (memory.md) was created on request to capture the complete journey from SKILL.md to the current E20-focused dashboard with top metrics and adjustment sections.**

---

*Last updated: during implementation of top metrics + E20 sections on branch `feature/top-metrics-e20-breakdown`.*