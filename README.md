# FuelLedger — India E20 Real-Cost Dashboard

India moved petrol to E20 (20% ethanol). This dashboard rebuilds the pump price from the PPAC
build-up, swaps in the real blended feedstock cost, and shows the per-litre gap between the
quoted price and a fair pass-through price — including the energy a litre of E20 no longer
carries.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8) ![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e)

## What it shows

- **Gap hero** — the headline ₹/L figure: withheld savings when ethanol is cheap, the blend
  premium when it isn't, and the hidden energy cost either way; annualised for a typical
  2-wheeler
- **Price build-up waterfall** — base → freight → dealer → excise → VAT → pump price, next to
  the fair pass-through price (VAT recomputed on the blended base, since it's ad-valorem)
- **Quoted vs fair trend** — the pump price holds flat while the fair price moves with crude
  and ethanol; the gap is shaded
- **City table** — pump, fair, gap and energy-adjusted price for six metros
- **Per-litre / energy-adjusted toggle** — E20 carries ≈96.4% of E0's energy; the toggle
  switches all figures to per petrol-equivalent litre
- **What-if calculator** — base price, ethanol price, blend % and energy factor sliders
- **E20 vehicle compatibility** and a **Methodology & assumptions** section (every input lives
  in the DB with a source URL and as-of date)

## Architecture

- `app/page.tsx` is an async **server component**: it fetches all rows, computes derived
  numbers through the pure functions in `lib/costModel.ts` / `lib/model.ts`, and passes plain
  props into client islands (charts, calculator, toggle)
- **Supabase** is the database (seeded once, updated manually via the dashboard). All tables
  have RLS enabled with anonymous `SELECT` only
- **No Supabase configured? It still works.** If the env vars are absent or a fetch fails, the
  page renders from `lib/seedData.ts`, which mirrors `supabase/seed.sql`

```
app/
├── components/
│   ├── DashboardSections.tsx   # client: per-litre / energy-adjusted toggle
│   ├── GapHero.tsx
│   ├── PriceWaterfall.tsx
│   ├── TrendChart.tsx
│   ├── CityGapTable.tsx
│   ├── InteractiveCalculator.tsx
│   ├── CompatibilityTable.tsx
│   └── Methodology.tsx
├── layout.tsx / page.tsx / globals.css
lib/
├── costModel.ts                # pure cost model — the heart of the dashboard
├── model.ts                    # DB rows → view model
├── seedData.ts                 # bundled fallback, mirrors supabase/seed.sql
├── supabase.ts                 # client + fetch-with-fallback
├── types.ts                    # row shapes (snake_case = DB columns)
└── utils.ts
supabase/
├── migrations/0001_schema.sql
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
2. In the SQL editor, run `supabase/migrations/0001_schema.sql`, then `supabase/seed.sql`
   (or use the CLI: `supabase db push && supabase db seed`)
3. Set the env vars locally (`.env.local`) and in Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

4. Redeploy. The header badge switches from "bundled seed" to "live · Supabase"

To update figures later (new PPAC build-up, new ethanol prices, a changed blend mandate), edit
the rows in the Supabase dashboard — no code change needed. The page revalidates hourly.

## Cost model

```
retail        = base + freight + dealer_commission + excise + VAT
blended_base  = (1 − p) · base + p · ethanol_price        (p = blend fraction)
saving        = base − blended_base                        (negative when ethanol is dearer)
fair_retail   = (pre-tax sum − saving) × (1 + vat_rate)    (VAT recomputed — it's ad-valorem)
gap           = quoted_retail − fair_retail
effective     = quoted_retail / energy_factor              (price per petrol-equivalent litre)
```

## Data & sources

- [PPAC](https://ppac.gov.in/) — price build-up and retail selling prices
- [MoPNG](https://mopng.gov.in/en/refining/ethanol-blended-petrol) — ethanol procurement prices
  by feedstock
- ARAI — E20 energy-content / mileage impact estimates

All numbers are estimates for education; validate against official sources before citing.

## License

MIT — use freely for internal tools and prototypes.
