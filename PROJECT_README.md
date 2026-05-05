# OPENLANE Auction — Buyer Platform

A buyer-side vehicle auction platform built for the OPENLANE coding challenge. Browse 200 vehicles, inspect condition details, and place live bids.

---

## How to Run

**Prerequisites:** Node.js 18+ and npm 9+

```bash
# 1. Clone and install
git clone <your-fork-url>
cd the-block
npm install

# 2. Start both servers
npm run dev
```

Open **http://localhost:5173**

That's it. One command starts the API server on `:3001` and the React app on `:5173`.

---

## What's Built

### Inventory (http://localhost:5173)
- Grid and list view toggle
- Full-text search across make, model, trim, VIN, and dealer name
- 7-dimension filter panel: auction status, make, body style, condition grade, price range, fuel type, province
- Active filter chips with individual removal
- 8 sort modes (auction time, price, condition, year, mileage, activity)
- All filter/sort state lives in the URL — links are shareable
- Pagination at 24 vehicles/page

### Vehicle Detail (/vehicles/:id)
- Image gallery with thumbnail strip navigation
- Condition grade bar (1.0–5.0, color-coded: green/yellow/orange/red)
- Damage notes as scannable badges (or "No damage noted" in green)
- Full specifications grid (15 fields)
- Clean/rebuilt/salvage title badge
- Selling dealership

### Auction Panel (sticky)
- Live countdown timer (ticks every second)
- Auction status chip: 🔴 LIVE / Upcoming / Ended
- Current bid with bid count
- Reserve met / Reserve not met indicator (price never revealed — by design)
- Quick bid buttons (4 options relative to minimum bid)
- Custom bid amount input with validation
- Confirmation dialog before bid placement
- Optimistic UI update + server reconciliation + rollback on error
- Buy Now button (conditional, where available)

### Live Auction Simulation
Live vehicles have simulated competing bids (10% probability per vehicle per 3 seconds). Watching a vehicle's detail page, you'll see the bid count tick up in real-time — the client polls every 5 seconds for live auctions.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript (strict) | OPENLANE's own suggestion; type-safe throughout |
| UI | shadcn/ui components + Tailwind CSS | Accessible Radix primitives, fast to build, fully customizable |
| Server state | TanStack Query v5 | Declarative caching, optimistic updates, polling for live auctions |
| Routing | React Router v6 | URL-based filter state (shareable links) |
| Backend | Hono (Node.js) | Lightweight TypeScript API, clear separation of concerns |
| Data | In-memory store seeded from vehicles.json | Appropriate for prototype; swap for PostgreSQL + Redis in production |
| Monorepo | npm workspaces + concurrently | Single dev command for both services |

---

## Architecture

```
Browser (React SPA :5173)
  └── /api/* proxy → Hono Server (:3001)
                       └── In-memory store (seeded from vehicles.json)
                           ├── GET  /api/vehicles     (filter + sort + paginate)
                           ├── GET  /api/vehicles/:id
                           ├── POST /api/vehicles/:id/bids    (validated)
                           └── POST /api/vehicles/:id/buy-now
```

**Key decision — why a backend?**
Bid validation (minimum increment, auction live check, buy-now guard) belongs on the server. A frontend-only implementation makes bids feel like localStorage preferences. With a real API boundary, I can discuss optimistic locking, WebSocket upgrade paths, and distributed state — all of which are real OPENLANE concerns.

**Key decision — URL filter state:**
Filters live in URL search params, not component state. A dealer forwarding a link to a buyer is a real workflow. Browser back/forward works correctly.

---

## Auction Time Normalization

The dataset's timestamps are synthetic. At server startup, vehicles are distributed evenly: ~67 live (auction started 2–13h ago), ~67 upcoming (starts in 1–47h), ~67 ended (started 25–71h ago). The demo always has live auctions to bid on.

---

## Notable Decisions

See `docs/planning/product-decisions.md` for the full rationale behind each decision, including what was explicitly not built and why.

Key choices:
- **Reserve met indicator** — shows "Reserve met ✓" or "Reserve not met" but never reveals the price. Industry standard: revealing the reserve undercuts the auction dynamic.
- **Damage notes as badges** — chips are scannable, a bulleted list is not. Buyers triage at a glance.
- **Confirmation dialog before bidding** — bids are binding. Fat-finger protection is a trust feature.
- **Quick bids relative to minimum** — not fixed increments. Fixed increments create invalid bids when the gap between minimum and current is large.
- **Pagination not infinite scroll** — maps to URL state, better accessibility, honest architecture for a system that will eventually need cursor-based pagination.

---

## What I'd Do With More Time

In priority order:

1. **Optimistic locking** — add a `version` field to Vehicle; bid validation checks `WHERE version = $expected` atomically in PostgreSQL. This is the correctness gap between prototype and production.
2. **Bid history** — log each bid with timestamp in the server store, show last 5 bids on detail page.
3. **WebSocket real-time** — replace 5s polling with WebSockets + Redis Pub/Sub for fan-out to all buyers watching a vehicle.
4. **Watchlist** — heart button + localStorage, "Watching" filter in inventory.
5. **Related vehicles** — same make/body style suggestions on detail page.

---

## AI Tooling

Claude Code was used extensively for implementation. I drove all architecture and product decisions (documented in `docs/planning/`); Claude handled the speed layer — scaffolding the monorepo, writing boilerplate UI components, implementing TanStack Query patterns from my specs. I reviewed every output and redirected where needed.

The planning docs (`docs/planning/`) were written collaboratively and represent the actual design thinking behind the code, not after-the-fact documentation.

I can explain any file in this codebase in the walkthrough. Ask me anything.

---

## Time Spent

~7 hours total:
- 1h planning + architecture design (documented in `docs/planning/`)
- 1.5h scaffold, config, server setup
- 2h inventory page (components, filters, search, pagination)
- 1.5h vehicle detail page (gallery, specs, condition, damage)
- 1h auction panel + bidding flow
- 30 min responsive polish + edge cases
