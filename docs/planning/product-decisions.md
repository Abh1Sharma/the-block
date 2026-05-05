# Product Decisions & Tradeoffs

This document captures every non-trivial product decision and the rationale behind it. These are the answers to "why did you build it that way?" in the walkthrough.

---

## What I Built (and why)

### 1. Full-stack over frontend-only

**Decision**: Add a thin Hono backend instead of keeping everything in the browser.

**Why**: The core loop of an auction is *bid → see updated state*. A frontend-only approach with localStorage makes bids feel like local preferences, not real auction events. With a real API:
- Bid validation (minimum increment, auction status) lives on the server — where it belongs
- Optimistic updates + server reconciliation demonstrate the actual tension in real-time systems
- The walkthrough conversation about WebSockets, event sourcing, and distributed locks is grounded in real code, not hypothetical

**Tradeoff**: More complexity to run locally. Mitigated by: single `npm run dev` command.

---

### 2. URL-based filter state

**Decision**: Filters and sort live in URL search params, not component state.

**Why**: Users share vehicle searches. A dealer forwarding a URL to a buyer is a real workflow. URL state also means browser back/forward works, and refreshing the page doesn't lose filters.

**Tradeoff**: Slightly more boilerplate (`useSearchParams` instead of `useState`). Worth it for the UX.

---

### 3. Auction time normalization

**Decision**: Normalize all `auction_start` timestamps relative to "now" at server startup, distributing vehicles evenly across live/upcoming/ended states.

**Why**: The dataset's timestamps are synthetic and would otherwise all appear in a single state (all upcoming or all in the past), making the "live bidding" experience impossible to demo.

**What I explicitly did NOT do**: Generate random times on every request (would make timers inconsistent). Normalize client-side (server should own time logic).

---

### 4. Condition grade as a visual bar, not just a number

**Decision**: Show the 1.0–5.0 grade as a filled progress bar with color coding (green/yellow/red) AND the numeric score AND the descriptive label.

**Why**: In vehicle auctions, condition grade is a primary trust signal. A buyer scanning 200 vehicles needs to parse condition at a glance. A number alone is opaque. The bar makes relative condition scannable at card level.

**Color logic**:
- 4.0–5.0 → Green (excellent/very good)
- 3.0–3.9 → Yellow (average)
- 2.0–2.9 → Orange (below average)
- 1.0–1.9 → Red (poor/salvage)

---

### 5. Damage notes as badges, not a bulleted list

**Decision**: Show each damage note as a small badge/chip, not a prose list.

**Why**: Damage notes are decision-relevant signals. A buyer scanning the page should be able to count damage items and triage severity at a glance. Chips are scannable; paragraphs are not.

**Edge case**: 0 damage notes → show "No damage noted" in a subtle muted style, which is a stronger positive signal than simply showing nothing.

---

### 6. Reserve met indicator (not reserve price)

**Decision**: Show "Reserve met ✓" or "Reserve not met" but never reveal the reserve price.

**Why**: This is industry standard for vehicle auctions. Revealing the reserve undercuts the auction dynamic — buyers would bid exactly to reserve and stop. The binary signal is all a buyer needs: "Is my bid high enough to win?"

---

### 7. Confirmation dialog before bid placement

**Decision**: After clicking "Place Bid", show a confirmation modal before POSTing.

**Why**: In a real auction, bids are binding commitments. A fat-finger protection (clicking +$2500 instead of +$250) is a meaningful trust feature. The confirmation also gives the buyer one final look at the amount and vehicle.

**Tradeoff**: An extra click in the happy path. Worth it for bid intent clarity.

---

### 8. Quick bid buttons relative to minimum bid

**Decision**: Show 4 quick-bid options: min bid, min+250, min+750, min+2250 — not fixed increments.

**Why**: Fixed quick bids ($250, $500, $1000 above current) confuse buyers when the minimum bid is much higher than current. Relative-to-minimum buttons are always valid bids and require no mental arithmetic.

---

### 9. Pagination over infinite scroll

**Decision**: Paginate the inventory at 24 vehicles per page, not infinite scroll.

**Why**: 
- 200 vehicles renders fast in any approach, but this is about architectural signal
- Infinite scroll has poor accessibility (keyboard navigation, screen readers)
- Pagination maps cleanly to URL state (`?page=2`)
- In production with 200k+ vehicles, cursor-based pagination is the upgrade path — offset pagination is a deliberate prototype simplification worth calling out

---

## What I Explicitly Did NOT Build

| Feature | Why omitted |
|---|---|
| Authentication / user accounts | Explicitly out of scope per challenge |
| Seller workflows | Out of scope |
| Payment / checkout | Out of scope |
| WebSocket real-time competing bids | Scope; would explain upgrade path in walkthrough |
| Bid history (per vehicle) | API doesn't track individual bids, only current_bid + count |
| Watchlist / favorites | Stretch; adds significant state complexity |
| Saved searches | Stretch |
| Push notifications | Out of scope for prototype |
| Image viewer / zoom | Placehold.co images have no value to zoom; would add with real images |
| Dark mode | Scope; easy to add with Tailwind `dark:` variants |
| Internationalization | Scope; all data is Canadian but no i18n needed for prototype |

---

## Design Decisions

### Typography & Color
- Professional, trust-inducing palette (not flashy — this is a B2B wholesale marketplace, not a consumer app)
- Auction status uses red (live), amber (upcoming), slate (ended) — traffic light semantics buyers understand
- Monospace font for prices and VINs — reduces cognitive load when scanning numbers

### Layout
- Desktop: Filter sidebar left, inventory grid right (standard marketplace pattern)
- Mobile: Filters in a bottom sheet/drawer, full-width cards, sticky bid panel on detail page
- AuctionPanel sticky on vehicle detail: the bid action is always visible, never requires scrolling

### Responsive Breakpoints
- `sm` (640px): single column grid
- `md` (768px): two column grid, filter drawer instead of sidebar
- `lg` (1024px): three column grid, filter sidebar visible
- `xl` (1280px): four column grid
