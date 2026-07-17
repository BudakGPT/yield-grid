# YieldGrid

Direct farm-to-buyer marketplace: verified quality, safe direct escrow payment, and shelf-life-aware matching.

## Monorepo layout

| Folder | Stack | Owns |
|--------|-------|------|
| `frontend/` | Next.js (React), PWA | Farmer PWA, buyer dashboard, demo console. All web surfaces. |
| `backend/`  | Spring Boot (Java) + Postgres | REST API, WebSocket hub, grading service, settlement service. The sole chain-caller. |
| `contract/` | Rust / Soroban | The three-function escrow contract on Stellar testnet. |

## Local integrated setup

The backend uses Supabase Auth for credentials, keeps application-specific fields in `public.user_profiles`, grades crate photos through OpenRouter, and asynchronously anchors the photo plus signed grading metadata to Pinata/IPFS. The OpenRouter request uses temperature `0`, a strict JSON Schema, a 60-second timeout, and crop-specific prompts limited to visually assessable criteria from Codex CXS 293-2008 and CXS 205-1997. Provider failures fall back to the visibly disclosed rehearsal cache.

Copy `.env.example` to the ignored `.env` file, then set:

```properties
DB_URL=jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres
DB_USERNAME=postgres
DB_PASSWORD=replace-with-your-database-password
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=replace-with-your-publishable-key
GRADING_MODE=openrouter
OPENROUTER_API_KEY=replace-with-your-openrouter-key
PINATA_JWT=replace-with-your-pinata-jwt
```

For a new Supabase project, run `backend/src/main/resources/db/migration/V1__migrate_users_to_supabase_auth.sql` once in the Supabase SQL editor. The migration creates the `auth.users` profile trigger, migrates domain foreign keys to `public.user_profiles`, and enables profile RLS. It intentionally aborts if the legacy `public.users` table contains anything other than YieldGrid smoke-test identities.

Run both applications in separate terminals:

```powershell
.\backend\gradlew.bat -p backend bootRun
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. Backend health is available at `http://localhost:8083/api/demo/health`. Keep `GRADING_MODE=rehearsal` when no OpenRouter key is available. Never commit `.env`.
