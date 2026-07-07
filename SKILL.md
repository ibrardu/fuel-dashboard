---
name: fuel-dashboard
description: Build a complete professional Next.js dashboard for India fuel prices with ethanol blending adjustment, daily data logging, tanker movement, E20 vehicle impact, and company P&L. Use when user wants a modern web app version of the FuelLedger dashboard instead of single HTML file.
---

# Fuel Dashboard Builder Skill

You are an expert at building production-ready Next.js dashboards for energy/fuel analytics in India.

## When to Use This Skill
- User asks to "build fuel dashboard", "create fuelledger", "grok build fuel-dashboard", or wants a proper web app instead of single HTML.
- User wants interactive filters, proper components, future-proof structure with authentication-ready setup.

## Output Requirements

Always generate a complete, ready-to-run **Next.js 14 + TypeScript + Tailwind** project with the following features:

### Core Sections to Include
1. **Header** with project name "FuelLedger" and last updated info
2. **City Prices** – Current petrol prices in major cities with E20 blended cost note + source citation (PPAC)
3. **Interactive Calculator** – What-if tool for blending % and ethanol price impact on OMC cost
4. **Daily Data Logger** – Form to log daily crude price, USD/INR, blended cost (uses localStorage)
5. **E20 Impact on Vehicles & Insurance** – Balanced view with owner reports + official position + insurance notes + peer-reviewed references (Bawase et al. 2021 + ARAI)
6. **Vehicle E20 Compatibility Table** – Placeholder table with major manufacturers (expandable later from car manuals)
7. **Company P&L YoY** – IOCL, BPCL, HPCL profit comparison with source note
8. **Live Tanker Movement** – Embedded MarineTraffic map + key routes + disclaimer about free vs paid data

### Technical Requirements
- Use **TypeScript** + **Tailwind CSS**
- Use `lucide-react` for icons
- Make components modular (one component per major section)
- Add proper source citations everywhere
- Make tables and logger interactive where possible
- Include a clean, professional dark theme (slate-950 based)
- Add a small "Recommended Domains" note in footer or settings

### Project Structure to Generate
```
fuelledger/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── components/
│       ├── CityPrices.tsx
│       ├── InteractiveCalculator.tsx
│       ├── DailyDataLogger.tsx
│       ├── E20Impact.tsx
│       ├── CompatibilityTable.tsx
│       ├── PnlYoY.tsx
│       └── TankerMap.tsx
├── lib/
│   └── utils.ts
├── package.json
└── README.md
```

### Instructions for Generation
1. First output the terminal commands to create the Next.js project.
2. Then provide the content of all key files (`app/page.tsx` and each component).
3. Make sure the E20 section includes the scientific reference to **Bawase et al. (2021)** from ARAI Journal.
4. Keep the code clean, well-commented, and easy to extend.
5. At the end, give deployment instructions for Vercel (free tier).

Always prioritize clarity, professionalism, and future extensibility (especially for adding real database + auth later).