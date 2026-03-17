# Fixaligner Financial Dashboard — CLAUDE.md

## Project Overview

Financial management dashboard for **Fixaligner**, an orthodontics/3D-printing treatment provider. Tracks patient treatments and calculates multi-tiered costs (variable, direct, fixed) with comprehensive financial metrics.

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** TailwindCSS 4
- **Database:** MySQL/MariaDB via `mysql2/promise`
- **Package name:** `tratment-costs`

## Dev Commands

```bash
npm run dev    # start development server
npm run build  # production build
npm run start  # start production server
npm run lint   # ESLint check
```

## Database

- **Type:** MySQL / MariaDB
- **Host:** 161.97.65.207
- **Port:** 3306
- **Database:** fixalign
- **Username:** ploi

Credentials are stored in `.env.local`. The app reads them via:
```
DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
```

### Schema (expected tables)

| Table | Purpose |
|---|---|
| `patient_treatment_view` | Patient treatment data |
| `cost_rate_years` | Year definitions |
| `variable_cost_rates` | Variable costs by year |
| `direct_cost_rates` | Direct costs by year |
| `fixed_costs` | Fixed costs by year |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── patients/          # GET — patient treatments with calculated costs
│   │   └── cost-rates/        # GET + POST /update — cost rates by year
│   ├── constants/             # Cost constants management page
│   ├── formulas/              # Formulas documentation page
│   ├── layout.tsx
│   └── page.tsx               # Main dashboard
├── components/
│   ├── FinancialOverview.tsx
│   ├── BreakEvenAnalysis.tsx
│   ├── PatientTable.tsx
│   ├── CostBreakdown.tsx
│   └── CostSettings.tsx
├── lib/                       # Utility functions
├── types/index.ts             # All TypeScript types
└── data/                      # Sample/simulation data
```

## Key Business Logic

### Cost Tiers
- **Variable costs** — per treatment, based on number of steps (sheets, resin, cases, bags, packaging)
- **Direct costs** — allocated per treatment (design, alcohol, tissues, production tools)
- **Fixed costs** — allocated by estimated hours and monthly capacity (rent, utilities, salaries, internet, legal, accountant, CMO)

### Calculation Formulas
- Estimated hours per treatment = `numberOfSteps × 0.15` (9 min/step)
- Monthly fixed allocation = `totalMonthlyFixedCost / treatmentsInMonth`
- Hours-based allocation = `(monthlyFixedCost × estimatedHours) / monthlyCapacityHours`

### Special Pricing Rules
- **Clinics 1, 5, 34** use cost-plus pricing from 2026 onward
- Fixed costs are split fairly among treatments in the same month
- Delivery date field: `timer_delivery_ended_at`

## Path Aliases

`@/*` maps to `./src/*`
