# YieldGrid

Direct farm-to-buyer marketplace: verified quality, safe direct escrow payment, and shelf-life-aware matching.

## Monorepo layout

| Folder | Stack | Owns |
|--------|-------|------|
| `frontend/` | Next.js (React), PWA | Farmer PWA, buyer dashboard, demo console. All web surfaces. |
| `backend/`  | Spring Boot (Java) + Postgres | REST API, WebSocket hub, grading service, settlement service. The sole chain-caller. |
| `contract/` | Rust / Soroban | The three-function escrow contract on Stellar testnet. |
| `settlement-sidecar/` | Node / TypeScript (Express) | Chain-facing sidecar: owns custodial keys and all Soroban escrow calls. |

## Live visual grading

The backend can grade tomato and banana crate photos through OpenRouter using `google/gemma-4-26b-a4b-it:free`. The request uses temperature `0`, a strict JSON Schema, a 10-second timeout, and crop-specific prompts covering only criteria visible in a single photo from Codex CXS 293-2008 and CXS 205-1997. Non-visual properties are explicitly excluded, and provider failures fall back to the visibly disclosed rehearsal cache.

Copy `.env.example` to the ignored `.env` file, then set:

```properties
GRADING_MODE=openrouter
OPENROUTER_API_KEY=replace-with-your-openrouter-key
```

Run the backend from the repository root with:

```powershell
.\backend\gradlew.bat -p backend bootRun
```

Keep `GRADING_MODE=rehearsal` when no OpenRouter key is available. Never commit `.env`.

## Deployment and CI

Deployment (CD) is handled by the hosting platforms, so there is no custom deploy pipeline and no Docker.

| Component | Host | How it deploys |
|-----------|------|----------------|
| `frontend/` | Vercel | Auto build and deploy on push. |
| `backend/` | Railway | Nixpacks auto-builds the Gradle app on push. |
| `settlement-sidecar/` | Railway (second service) | Set Root Directory to `settlement-sidecar`, Start Command `npm start`. |
| `contract/` | Stellar testnet | Deployed manually via `npm run deploy` in `settlement-sidecar/`. |

CI is the only piece we own: `.github/workflows/ci.yml` runs on every pull request to `master`. It uses path filters so only the changed components run: backend (`gradlew build`), sidecar (typecheck + tests), contract (`cargo test`), and frontend (`eslint`). This is a quality gate before merge; it does not deploy.
