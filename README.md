# YieldGrid

Direct farm-to-buyer marketplace: verified quality, safe direct escrow payment, and shelf-life-aware matching.

## Monorepo layout

| Folder | Stack | Owns |
|--------|-------|------|
| `frontend/` | Next.js (React), PWA | Farmer PWA, buyer dashboard, demo console. All web surfaces. |
| `backend/`  | Spring Boot (Java) + Postgres | REST API, WebSocket hub, grading service, settlement service. The sole chain-caller. |
| `contract/` | Rust / Soroban | The three-function escrow contract on Stellar testnet. |