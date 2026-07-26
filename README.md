# FuelLedger — India E20 Real-Cost Dashboard

India moved petrol to E20 (20% ethanol). Politicians and media quote the retail pump price;
this dashboard exposes the **Real Blended Feedstock Cost** — what the E20 blend actually costs
OMCs — next to that quoted price, and the per-litre gap between them.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8) ![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e)

## What it shows

- **Real Blended Cost hero** — `0.8 × Motor Spirit cost + 0.2 × Ethanol price`, always the most
  prominent figure on the page, next to the quoted retail price and the gap between them
  (Delhi default: ₹102.12 quoted → ₹61.02 real cost, −40%, ≈₹41/L margin)
- **Location-aware city selection** — defaults to Delhi; a "Use my location" control geolocates
  the visitor and snaps to the nearest of 14 major cities (haversine distance), or pick one
  manually from the dropdown. Choice persists across visits (`localStorage`). Every
  location-dependent number (quoted RSP, price build-up, gap %) updates to the selected city;
  the Real Blended Cost stays constant since ethanol blending is a national feedstock cost, not
  a state one
- **Price build-up waterfall** — base → freight + dealer → excise → VAT → pump price, per city
- **What-if calculator** — live-updating sliders for base MS cost, ethanol price and blend %
- **City Prices** — table/list of all 14 cities with quoted RSP, real cost and gap; the active
  city is marked. A **Petrol / Diesel toggle** switches to diesel retail prices (diesel isn't
  E20-blended, so it's shown as a reference price only, no real-cost comparison)
- **Real Cost Trend** — 84-day quoted-vs-real-cost trend chart, with its own Petrol/Diesel toggle
- **OMC Profit Growth** and **E20 Vehicle Impact** sections
- **Live USD/INR** — fetched server-side on each request (`lib/fx.ts`), falls back to the
  seed/Supabase seeded rate if the fetch fails or times out
- **Light / dark theme** — manual toggle in the header, defaults to the visitor's system
  preference, persists across visits; a blocking inline bootstrap script sets the theme before
  first paint to avoid a flash of the wrong theme

## Architecture

- `app/page.tsx` is an async **server component**: it fetches all rows, computes derived
  numbers through the pure functions in `lib/costModel.ts` / `lib/model.ts`, fetches the live
  USD/INR rate, and passes plain props into `LocationAwareDashboard` (a client component that
  owns city-selection state and renders every location-dependent section)
- **Supabase** is the database (seeded once, updated manually via the dashboard). All tables
  have RLS enabled with anonymous `SELECT` only
- **No Supabase configured? It still works.** If the env vars are absent or a fetch fails, the
  page renders from `lib/seedData.ts`, which mirrors `supabase/seed.sql`
- **Theming** is CSS-custom-property based (`app/globals.css`): a `data-theme` attribute on
  `<html>` switches token values (`--bg`, `--surface`, `--text-*`, `--border`, …); most
  components consume them through shared classes (`.card`, `.kpi`, …), with a small set of
  literal Tailwind utility overrides for one-off text/border colors under `[data-theme="light"]`

```
app/
├── components/
│   ├── Header.tsx               # logo, last-updated, live badge, ThemeToggle
│   ├── ThemeToggle.tsx           # client: light/dark switch, persisted
│   ├── LocationAwareDashboard.tsx # client: city selection (geolocation/manual/persisted),
│   │                              renders KpiStrip/MobileHero/HeroCompare/WhatIf/CityPrices
│   ├── KpiStrip.tsx
│   ├── MobileHero.tsx
│   ├── HeroCompare.tsx
│   ├── WhatIf.tsx                # client: live what-if sliders
│   ├── CityPrices.tsx            # client: city table/list + Petrol/Diesel toggle
│   ├── RealCostTrend.tsx         # client: trend chart + Petrol/Diesel toggle
│   ├── OmcProfits.tsx
│   ├── VehicleImpact.tsx
│   ├── Collapsible.tsx
│   └── BottomNav.tsx
├── layout.tsx / page.tsx / globals.css
lib/
├── costModel.ts                 # pure cost model — the heart of the dashboard
├── model.ts                     # DB rows → view model (per-city CostBreakdown, trend, etc.)
├── geo.ts                       # haversine nearest-city matching
├── fx.ts                        # live USD/INR fetch with fallback
├── seedData.ts                  # bundled fallback, mirrors supabase/seed.sql (14 cities)
├── supabase.ts                  # client + fetch-with-fallback
├── types.ts                     # row shapes (snake_case = DB columns)
└── utils.ts
supabase/
├── migrations/0001_schema.sql
├── migrations/0002_city_coordinates.sql   # adds cities.lat / cities.lng
└── seed.sql
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the dashboard renders fully from the
bundled seed data with no configuration.

## Supabase setup (optional)

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL editor, run `supabase/migrations/0001_schema.sql`, then
   `supabase/migrations/0002_city_coordinates.sql`, then `supabase/seed.sql`
   (or use the CLI: `supabase db push && supabase db seed`)
3. Set the env vars locally (`.env.local`) and in Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

4. Redeploy. The header badge switches from "Live · seed" to "Live"

To update figures later (new PPAC build-up, new ethanol prices, a changed blend mandate), edit
the rows in the Supabase dashboard — no code change needed. The page revalidates hourly.

## Cost model

```
blended_base (Real Blended Cost) = (1 − p) · base_price + p · ethanol_price   (p = blend fraction, 0.20 for E20)
retail (quoted, per city)        = base + freight + dealer_commission + excise + VAT
fair_retail                      = (pre-tax sum − blending_saving) × (1 + vat_rate)
gap                               = quoted_retail − fair_retail
effective                        = quoted_retail / energy_factor    (price per petrol-equivalent litre)
```

`base_price` and `ethanol_price` are national — the same for every city — so the Real Blended
Cost is one figure everywhere; `freight` and `vat_rate` are city-specific, so the quoted retail
price and the gap % vary by city. Diesel is **not** part of this model — India's E20 mandate is
petrol-only, so diesel is carried as a flat reference retail series only.

## Data & sources

- [PPAC](https://ppac.gov.in/) — price build-up and retail selling prices
- [MoPNG](https://mopng.gov.in/en/refining/ethanol-blended-petrol) — ethanol procurement prices
  by feedstock
- [open.er-api.com](https://www.exchangerate-api.com/docs/free) — live USD/INR spot rate
- ARAI — E20 energy-content / mileage impact estimates

All numbers are estimates for education; validate against official sources before citing.

## License

MIT — use freely for internal tools and prototypes.
