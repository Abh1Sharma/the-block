# OPENLANE Auction — Buyer Platform

A buyer-side vehicle auction platform built for the OPENLANE coding challenge. Browse 200 vehicles, inspect condition details, and place live bids with real-time competing bid simulation.

---

## How to Run

**Prerequisites:** Node.js 18+ and npm 9+

```bash
# 1. Clone and install
git clone https://github.com/Abh1Sharma/the-block.git
cd the-block
npm install

# 2. Start both servers (API on :3001, app on :5173)
npm run dev
```

Open **http://localhost:5173**

One command starts everything. No environment variables needed.

---

## Time Spent

~7 hours total:
- 1h — planning, architecture design, and documentation (`docs/planning/`)
- 1.5h — monorepo scaffold, server config, in-memory store + auction normalization
- 2h — inventory page (filters, search, sort, pagination, list/grid view)
- 1.5h — vehicle detail page (gallery, specs, condition, damage, dealer)
- 1h — auction panel, bidding flow, optimistic updates, competing bid simulation
- 30 min — bid history, related vehicles, mobile sticky bid bar, responsive polish

---

## Assumptions and Scope

**Included:**
- Full inventory browsing with 7 filter dimensions + 8 sort modes
- Vehicle detail with image gallery, specs, condition grade, damage notes
- Bidding with quick-bid options, custom amounts, confirmation dialogs, buy-now
- Real-time competing bids (simulated, in-memory) with 5s polling on live auctions
- Bid history (last 5 bids per vehicle, polls every 5s on live auctions)
- Related vehicles (same make, shown on detail page)
- Mobile-first responsive layout with a sticky quick-bid bar on small screens
- URL-synced filter state (shareable links, browser back/forward)

**Intentionally skipped:**
- Authentication and user accounts (not required per the brief)
- Seller workflows, payments, checkout
- Persistent database (in-memory store is appropriate for a prototype)
- WebSockets (5s polling is sufficient to demo real-time feel; WebSockets are the correct production upgrade)

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript (strict) | OPENLANE's suggested stack; type-safe throughout |
| UI | shadcn/ui + Tailwind CSS | Accessible Radix primitives, fast to build, fully customizable |
| Server state | TanStack Query v5 | Declarative caching, optimistic updates, conditional polling |
| Routing | React Router v6 | URL-based filter state for shareable links |
| Backend | Hono (Node.js) | Lightweight TypeScript API; clear separation of bid validation logic |
| Data | In-memory store seeded from `vehicles.json` | Appropriate for prototype; swap for PostgreSQL in production |
| Monorepo | npm workspaces + concurrently | Single `npm run dev` for both processes |

---

## What I Built

### Inventory Page
- Grid and list view toggle
- Full-text search across make, model, trim, VIN, and dealer name
- Filter panel: auction status, make, body style, condition grade (range slider), price range, fuel type, province
- Active filter chips with individual one-click removal
- 8 sort modes: auction end time, price (low/high), condition, year, mileage, bid activity
- All state lives in URL search params — links are shareable, back/forward works
- Pagination at 24 vehicles/page with ellipsis for large page counts

### Vehicle Detail
- Image gallery with thumbnail strip navigation
- Condition grade bar (1.0–5.0, color-coded green → red)
- Damage notes as scannable badge chips (or "No damage noted" in green)
- Full specifications grid (15 fields)
- Clean/rebuilt/salvage title badge
- Selling dealership with city and province
- Related vehicles section (same make, 4 cards)
- Mobile sticky quick-bid bar (fixed bottom, confirmation dialog, only on live auctions)

### Auction Panel
- Status chip: LIVE / Upcoming / Ended
- Live countdown timer (ticks every second)
- Current bid and bid count
- Reserve met / not met indicator (price intentionally never revealed)
- Quick bid buttons (4 options relative to the minimum bid — not fixed increments)
- Custom bid amount input with client and server validation
- Confirmation dialog before placing any bid
- Optimistic UI update with server reconciliation and rollback on error
- Buy Now button (conditional, where `buy_now_price` is set)
- Bid history: last 5 bids with bidder, amount, and time-ago label

### Auction Simulation
Live vehicles receive simulated competing bids: 10% probability per vehicle per 3-second tick, random increment from [+$250, +$500, +$750, +$1,000]. The client polls every 5 seconds on live auctions so bid counts and prices update in real-time during demo.

Auction time normalization: the dataset's timestamps are synthetic, so the server redistributes them at startup into ~67 live / ~67 upcoming / ~67 ended buckets. The demo always has live auctions to bid on.

---

## Notable Decisions

**Why a backend at all?**
Bid validation (minimum increment, auction-live check, buy-now price guard) belongs on the server. A frontend-only implementation makes bids feel like localStorage toggles. A real API boundary lets me discuss optimistic locking, race conditions, and WebSocket upgrade paths — all of which are real OPENLANE-scale concerns.

**URL filter state over component state**
Filters in URL search params means a buyer or dealer can forward a filtered view. Browser history works correctly. This is a buyer workflow concern, not just a developer convenience.

**Reserve met indicator — never reveal the price**
Showing "Reserve met ✓" or "Reserve not met" without the actual number is industry standard. Revealing the reserve collapses the auction dynamic and reduces final sale price.

**Optimistic updates with rollback**
TanStack Query `onMutate` snapshots the cache, updates it immediately, and rolls back on error. The bid feels instant; the server is authoritative.

**Quick bids relative to minimum, not fixed increments**
Fixed increments can produce invalid bids when the gap between minimum and current is already large (e.g., if the minimum is $25,250 and you offer +$250 from $25,000, that bid is still below minimum). All quick-bid options are calculated from `getMinimumBid()`.

**Pagination not infinite scroll**
Maps cleanly to URL state, works with keyboard navigation and assistive technology, and is honest architecture for a system that will need cursor-based pagination in production.

Full decision log: [`docs/planning/product-decisions.md`](docs/planning/product-decisions.md)

---

## What I'd Do With More Time

1. **Optimistic locking** — add a `version` field to Vehicle; bid validation checks `WHERE version = $expected` atomically in PostgreSQL. This is the correctness gap between prototype and production: the current single-process Node.js event loop is safe, but horizontal scaling makes the read-validate-write sequence a race condition.
2. **WebSocket real-time** — replace 5s polling with WebSockets + Redis Pub/Sub for fan-out. Every buyer watching a vehicle gets the update in milliseconds, not on the next poll cycle.
3. **Watchlist** — heart button + localStorage, "Watching" filter in inventory. High-frequency buyer workflow: dealers track vehicles across sessions.
4. **Cursor-based pagination** — offset pagination is fine for a prototype but degrades under concurrent writes (a new bid can shift items across pages). Cursor-based is the correct production upgrade.
5. **E2E tests** — Playwright smoke tests covering: filter → detail → bid flow, optimistic update behavior, mobile sticky bar confirmation.

---

## AI Tooling

Claude Code was used extensively throughout this build. I drove all architecture and product decisions — the planning docs in `docs/planning/` represent the actual design thinking, written before implementation started. Claude handled the speed layer: scaffolding the monorepo, writing boilerplate UI components, and implementing TanStack Query patterns from my specifications.

I reviewed every output and redirected where needed (the planning docs show what decisions were made and why). I can explain any file in this codebase in the walkthrough.

---

## Testing

Tested manually throughout:
- Filter/sort/search combinations on the inventory page (including empty states and edge cases)
- Bid flow: minimum bid enforcement, below-minimum rejection, buy-now guard, confirmation dialog
- Optimistic update and rollback (verified by temporarily breaking the API endpoint)
- Competing bid simulation visible in real-time on the detail page
- Mobile layout at 375px, 768px, and 1280px breakpoints
- Browser back/forward with URL-persisted filter state
