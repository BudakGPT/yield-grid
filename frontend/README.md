# YieldGrid Frontend

YieldGrid is a frontend-only agriculture intelligence prototype for harvest identity, surplus rescue, logistics visibility, and verifiable supply-chain proofs.

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

## Routes

- `/` — immersive landing page and 3D harvest twin
- `/overview` — operations dashboard
- `/batches` — searchable harvest registry and digital passport
- `/rescue` — surplus marketplace demo
- `/logistics` — interactive logistics map
- `/verification` — proof network and audit events

All product records, analytics, blockchain events, and marketplace actions are demo data. There is no backend or wallet transaction in this repository yet.
