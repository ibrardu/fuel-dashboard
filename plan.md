
# E20 Real-Cost Fuel Dashboard — Redesign + Supabase

## Context

The current dashboard (https://fuel-dashboard-iota.vercel.app/, repo `ibrardu/fuel-dashboard`) is a Next.js 16 / Tailwind v4 / Recharts app where **every fuel number is hardcoded in component JSX** and there is no database. The user wants to rebuild it around one thesis:

> India moved petrol to E20 (20% ethanol). Ethanol is cheaper than the petrol it displaces, so blending lowers the true production cost of each litre — but retail prices were not cut, and politicians quote the blended-fuel retail price as "the fuel price". The dashboard should expose the quoted price vs the real cost, and the per-litre gap consumers absorb.

**Yes, this is buildable.** The math is straightforward and the inputs are public (PPAC price build-up sheets, MoPNG ethanol procurement prices, blending %). Requirements: Supabase as the database (seeded now, updated manually), and a visual redesign of the dashboard. Answers assumed from the recommended defaults since the user didn't respond to clarifying questions: seed + manual updates, redesign replaces the main page, keep the blend calculator and compatibility table.

## The cost model (the heart of the dashboard)

Pure functions in `lib/costModel.ts`, unit-testable, driven entirely by DB rows:

Retail petrol price build-up (Delhi example, PPAC methodology):

```
retail = base_price (refinery gate, incl. blending) + freight + dealer_commission + central_excise + state_vat
```

Real-cost computation:

- `unblended_base` = what the base would be at 0% ethanol (petrol-only refinery price)
- `blended_base = 0.80 × unblended_base + 0.20 × ethanol_landed_price`
- `blending_saving_per_litre = unblended_base − blended_base` (positive when ethanol < petrol base)
- `fair_retail = actual_retail − blending_saving_per_litre` (what you'd pay if savings were passed through; VAT is ad-valorem so the pass-through also shrinks VAT — compute VAT on the reduced base for honesty)
- `gap = actual_retail − fair_retail` → the headline "you overpay ₹X /L"
- Energy adjustment: E20 carries ≈ 96.4% of E0's energy per litre (ethanol LHV ~21.2 MJ/L vs petrol ~32 MJ/L → factor `1 − 0.20×(1−21.2/32) ≈ 0.9325`… use configurable `energy_factor` stored in DB, default 0.964 per ARAI real-world mileage-loss estimates). `effective_price = retail / energy_factor` → "what a litre of E20 really costs you per unit of energy / km".

All assumptions (ethanol price source, energy factor, tax rates) live in DB rows with `source_url` + `as_of` date and are surfaced in the UI as a "Methodology & assumptions" section — the dashboard presents an estimate, not an accusation.

## Supabase schema (`supabase/migrations/`)

- `cities(id, name, state, vat_rate…)`
- `fuel_prices(id, city_id, date, petrol_retail, diesel_retail nullable, source_url)` — daily retail quotes
- `price_buildup(id, city_id, date, base_price, freight, dealer_commission, central_excise, state_vat)` — PPAC build-up snapshots
- `ethanol_prices(id, supply_year, feedstock, price_per_litre, source_url)` — MoPNG announced procurement prices (C-heavy molasses, B-heavy, juice, grain)
- `blend_config(id, effective_from, blend_pct, energy_factor)` — history of blend mandate (10% → 20%)
- Optional: `crude_prices(date, indian_basket_usd, usd_inr)`
- RLS: enable on all tables, `SELECT` allowed for `anon`, no public writes (updates via Supabase dashboard/service role)
- `supabase/seed.sql` with realistic 2025-26 data (Delhi petrol ≈ ₹94.77, excise ₹19.90, ethanol ₹58–71/L by feedstock, 6 cities, ~90 days of price history so trend charts work)

## App architecture

- `@supabase/supabase-js`, `lib/supabase.ts` server client using `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Convert `app/page.tsx` to an async **Server Component** that fetches all rows, computes derived numbers via `lib/costModel.ts`, and passes props into client-island components (charts, calculator)
- **Fallback**: if env vars are absent or fetch fails, load the same shapes from `lib/seedData.ts` (mirrors seed.sql) — the redesign renders fully without a configured Supabase project, since none exists yet
- Shared types in `lib/types.ts`
- Delete dead code: `LiveRateBadge.tsx`, localStorage logger in `lib/utils.ts`, synthetic `Math.random()` currency data

## Redesign (replaces `/`)

Keep the dark slate + emerald language but reorganize around the story:

1. **Hero — the gap counter**: huge number "₹X.XX /L — what you overpay on every litre of E20", with quoted price vs real-cost price side by side, and an annualized "for a 2-wheeler doing 10,000 km/yr ≈ ₹Y/yr"
2. **Price build-up waterfall** (Recharts stacked/waterfall bar): base → +freight → +commission → +excise → +VAT → retail, with the ethanol saving shown as the segment that *should* have been subtracted
3. **Quoted vs real trend chart**: line chart over the seeded history — retail (flat) vs computed fair price, gap shaded
4. **City table with gap column**: petrol retail, fair price, gap, effective (energy-adjusted) price per city
5. **Energy-adjustment toggle**: switch all figures between per-litre and energy-adjusted
6. **Upgraded calculator**: blend %, ethanol price, energy factor sliders → live gap
7. **Compatibility table** (kept, restyled), **Methodology & sources** footer section
8. Dropped/demoted: TankerMap iframe, fake USD/INR chart, OMC P&L bars (P&L optionally kept as a small "who keeps the savings" card)

## Steps

1. Add `supabase/migrations/0001_schema.sql` + `supabase/seed.sql`; `lib/types.ts`, `lib/costModel.ts`, `lib/seedData.ts`, `lib/supabase.ts`; install `@supabase/supabase-js`
2. Rebuild `app/page.tsx` as RSC + new components (`GapHero`, `PriceWaterfall`, `TrendChart`, `CityGapTable`, `Methodology`); upgrade `InteractiveCalculator`; restyle `CompatibilityTable`
3. Delete dead code; update `globals.css` tokens as needed
4. README: Supabase setup instructions (create project → run migration + seed → set env vars in Vercel)
5. Verify: `npm run build` + lint pass; page renders with fallback data (no env vars); spot-check cost-model outputs against a hand computation

## Verification

- `npm run build` succeeds with no Supabase env configured (fallback path)
- Hand-verify one cost-model case: e.g. Delhi, base ₹55.46, ethanol ₹71.50 → blended base, saving, fair retail, gap
- Visual check of the page via `npm run dev` / screenshot
