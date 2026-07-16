# YieldGrid Frontend

YieldGrid is a frontend-only direct farm-to-buyer marketplace prototype. It demonstrates verified visual grading, shelf-life-aware demand matching, safe escrow UX, delivery settlement, and a clearly labeled transit simulation.

## Stack

- Next.js App Router + React
- TypeScript
- Tailwind CSS v4
- Motion for route, scroll, and reveal animation
- React Three Fiber + Drei for the interactive harvest twin
- Google Maps embed for the logistics corridor

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The existing Codex preview is configured on port `4173`.

## Three-minute demo walkthrough

1. Open `/demo` and press **RESET FULL DEMO** before a judging wave.
2. Use `/farmer` to scan Amara's crate, review its grade mix and shelf-life band, then list it.
3. Open `/marketplace` as Chef Rosa and lock the direct order in demo escrow.
4. Start transit from `/demo`, then verify delivery from `/order` to trigger the farmer payout.
5. Use the breach control as the optional Q&A path for a discounted settlement.

## Routes

- `/` — mission-first landing page and 3D grade card
- `/farmer` — Amara's mobile-first scan, grade, list, wallet, and profile flow
- `/marketplace` — Chef Rosa's verified produce marketplace with demand segments
- `/order` — escrow status, simulated transit, breach path, and delivery verification
- `/verification` — progressively disclosed settlement receipt
- `/demo` — hidden state-machine console, readiness lights, and full reset

The UI follows the frozen PRD v3 frontend contracts and shares demo state across routes using browser storage. All grading results, listings, service health, IPFS identifiers, blockchain events, payments, and telemetry are demo data. There is no backend, live WebSocket, VLM call, Pinata pin, or wallet transaction in this repository yet.
