# YieldGrid Frontend

YieldGrid is the web client for the integrated direct farm-to-buyer marketplace. It consumes the Spring Boot REST and WebSocket APIs for authentication, visual grading, listings, orders, settlement status, and the clearly labeled transit simulation.

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

The UI follows the frozen PRD v3.1 contracts and shares live demo state across routes using the backend API, WebSocket events, and browser storage. Transit remains explicitly simulated; provider and chain readiness are reported by the demo health endpoint.
