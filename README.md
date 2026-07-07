# FuelLedger

Professional Next.js dashboard for India fuel prices, ethanol blending (E20), daily data logging, vehicle compatibility, OMC P&L, and tanker logistics.

![FuelLedger](https://img.shields.io/badge/Next.js-14%2B-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)

## Features

- **City Prices** — Real-time (demo) petrol & diesel prices across major Indian cities with E20 notes (sourced from PPAC)
- **Interactive Calculator** — What-if tool: adjust base price, ethanol cost and blend % to model OMC blended cost
- **Daily Data Logger** — Log crude (USD/bbl), USD/INR, blended cost. Persisted with localStorage + table view
- **E20 Impact** — Balanced view: owner reports, official position, insurance notes + scientific reference (Bawase et al. 2021, ARAI Journal)
- **Vehicle E20 Compatibility Table** — Major OEMs (Maruti, Hyundai, Tata, Honda, etc.)
- **Company P&L YoY** — IOCL, BPCL, HPCL profit comparison with visual bars
- **Live Tanker Movement** — Embedded MarineTraffic map + key crude routes + data disclaimer

## Tech Stack

- Next.js 16 + TypeScript + Tailwind CSS v4
- lucide-react icons
- sonner for toasts
- date-fns
- Fully client-side interactive (localStorage for logger)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build & Deploy

```bash
npm run build
npm run start
```

### Deploy to Vercel (Recommended - Free Tier)

1. Push this repo to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Vercel auto-detects Next.js — no extra config required
4. Deploy

The dashboard works perfectly on the free Hobby tier. Add a custom domain later (e.g. fuelledger.in).

## Project Structure

```
app/
├── components/
│   ├── CityPrices.tsx
│   ├── InteractiveCalculator.tsx
│   ├── DailyDataLogger.tsx
│   ├── E20Impact.tsx
│   ├── CompatibilityTable.tsx
│   ├── PnlYoY.tsx
│   └── TankerMap.tsx
├── layout.tsx
├── page.tsx
├── globals.css
lib/
└── utils.ts
```

## Data & Sources

- City prices &amp; PPAC references
- Bawase, M.A. &amp; Thipse, D.S.S. (2021) — *Impact of E20...* ARAI Journal of Mobility Technology
- Company quarterly/annual results (approximated for demo)
- MarineTraffic (free embed)

All numbers are illustrative and should be validated against official sources before commercial use.

## Future Extensibility

- Replace localStorage logger with Supabase / Postgres + auth
- Real-time price polling via APIs
- Admin panel for tanker / crude data
- Export reports (CSV / PDF)

## License

MIT — use freely for internal tools and prototypes.
