# YieldGrid Frontend

YieldGrid is the web client for the integrated direct farm-to-buyer marketplace. It consumes the Spring Boot REST and WebSocket APIs for authentication, profiles, visual grading, listings, orders, delivery status, and payment status.

## Stack

- Next.js App Router + React
- TypeScript
- Tailwind CSS v4
- Motion for route, scroll, and reveal animation
- React Three Fiber + Drei for the landing-page harvest visual

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set `GRADING_MODE=openrouter` and provide `OPENROUTER_API_KEY` before scanning. In live mode, provider failures are returned as errors; YieldGrid does not save a fabricated grade.

## Main workflow

1. Register or sign in as a farmer, then complete the profile location.
2. Use `/farmer` to submit a harvest photo, review the returned assessment, set a price, and publish the listing.
3. Register or sign in as a buyer, open `/marketplace`, select an actual listing, and enter delivery details.
4. The farmer opens `/order`, starts preparation, and marks the order as shipped.
5. The buyer opens `/order`, verifies delivery, and can view the completed receipt at `/verification`.

## Routes

- `/` — product landing page
- `/auth` — Supabase-backed registration and sign-in
- `/profile` — persisted account profile
- `/farmer` — scan, grading, saved listings, payout, and profile flow
- `/marketplace` — open listings and checkout
- `/order` — latest persisted order, delivery details, and role-specific actions
- `/verification` — completed order receipt
- `/demo` — development-only controls, available only when both `DEMO_ENABLED` and `NEXT_PUBLIC_DEMO_ENABLED` are `true`

The current user’s latest order is restored from the backend. Browser storage only retains the selected trade and unfinished scan inputs for continuity.
