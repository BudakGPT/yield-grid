# YieldGrid

Direct farm-to-buyer marketplace: verified quality, safe direct escrow payment, and shelf-life-aware matching.

## Monorepo layout

| Folder | Stack | Owns |
|--------|-------|------|
| `frontend/` | Next.js (React), PWA | Farmer PWA, buyer dashboard, demo console. All web surfaces. |
| `backend/`  | Spring Boot (Java) + Postgres | REST API, WebSocket hub, grading service, settlement service. The sole chain-caller. |
| `contract/` | Rust / Soroban | The three-function escrow contract on Stellar testnet. |

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
