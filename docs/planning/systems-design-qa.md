# Systems Design Q&A — Walkthrough Prep

This doc captures every systems design question that came up during planning and development, with the answers to give in the OPENLANE walkthrough.

---

## Q1: Why add a backend at all? The challenge says frontend-only is fine.

**Short answer:** Because bids are server-owned events, not client preferences.

**Full answer:**
A frontend-only implementation with localStorage makes bids feel like browser preferences — local, ephemeral, unvalidated. An auction bid is a binding commitment with real constraints: the auction must be live, the amount must exceed the minimum increment, you can't bid above the buy-now price. That validation belongs on the server.

The backend also lets me tell a more honest architecture story in the walkthrough. When I explain optimistic updates, WebSocket upgrade paths, and distributed locking — it's grounded in real code, not hypothetical.

The tradeoff was complexity: two processes to run instead of one. Mitigated by: single `npm run dev` command.

---

## Q2: You're simulating competing bids on all live vehicles. Won't that overload the server?

**Short answer:** No — the simulation is purely in-memory. But the question points at the right real-world concern: what happens when real buyers are the competing bidders?

**Full answer:**
The simulation is a `setInterval` that mutates an in-memory array. No HTTP requests, no I/O, no external calls. It's trivially cheap. Load balancing would have nothing to balance.

The real question is: what does this simulation stand in for? In production, those bids come from real buyers making real POST requests. The load concern becomes:
- How do we handle hundreds of concurrent bid requests?
- How do we broadcast each accepted bid to all buyers watching that vehicle?

That's where the architecture gets interesting (see Q4).

---

## Q3: There's a race condition in your bid store. Walk me through it.

**Code location:** `server/src/store/vehicleStore.ts:68`

```typescript
export function placeBid(id: string, amount: number): Vehicle | null {
  const idx = vehicles.findIndex((v) => v.id === id)
  // READ: get current state
  // WRITE: overwrite — no lock between read and write
  vehicles[idx] = { ...vehicles[idx], current_bid: amount, bid_count: vehicles[idx].bid_count + 1 }
  return vehicles[idx]
}
```

**The scenario:**
Two buyers both see current bid = $22,000. Both send `POST /bids { amount: 22250 }` simultaneously. Both pass validation (22250 ≥ 22000 + 250). Both write. One overwrites the other silently. The losing buyer's UI shows them as the winner.

**Why it doesn't bite us in the prototype:**
Node.js is single-threaded with a cooperative event loop. Incoming HTTP requests are processed one at a time. The read-validate-write sequence for a single bid runs to completion before the next request is processed. So in a single-process server, we're accidentally safe.

**Why it would fail in production:**
The moment you run two server instances behind a load balancer, each instance has its own in-memory array. There's no coordination. The race is real and undetectable.

---

## Q4: What's the production architecture for this?

**The progression — in priority order:**

### Step 1: Correctness (optimistic locking)
Add a `version` field to each vehicle. Every bid request must include the current version it's bidding against. The server atomically checks: `current_version === submitted_version`. If not, reject with "outbid — please refresh." This prevents silent overwrites.

```sql
UPDATE vehicles
SET current_bid = $1, bid_count = bid_count + 1, version = version + 1
WHERE id = $2 AND version = $3   -- ← the atomic check
RETURNING *
```

### Step 2: Persistence
Replace the in-memory array with PostgreSQL (durable, consistent) + Redis (sub-millisecond reads for live auction state). The bid validation query uses PostgreSQL's atomic `UPDATE ... WHERE version = $expected` to enforce correctness under concurrency.

### Step 3: Real-time
Replace the client's 5-second polling with WebSockets:
- Buyer connects to `/ws/vehicles/:id`
- When a bid is accepted, the server publishes an event to Redis Pub/Sub channel `bids:vehicle:{id}`
- All server instances subscribe to Redis; each fans out the event to their connected WebSocket clients

This is the standard fan-out pattern for real-time auction systems.

### Step 4: Horizontal scaling
Once state lives in PostgreSQL + Redis (not process memory), you can run N server instances behind a standard L7 load balancer (nginx, AWS ALB). WebSocket connections work because state fan-out is handled by Redis Pub/Sub, not by direct server-to-server communication.

**The key insight:** load balancing is a solved problem *once you've externalized state*. Solve correctness and persistence first.

---

## Q5: How does the optimistic update in BidForm work? What's the rollback story?

**Code location:** `client/src/hooks/usePlaceBid.ts:10–35`

```typescript
onMutate: async (amount) => {
  // 1. Cancel any in-flight queries for this vehicle
  //    (prevents a stale refetch from overwriting our optimistic state)
  await qc.cancelQueries({ queryKey: ['vehicle', vehicleId] })

  // 2. Snapshot the current server state
  const prev = qc.getQueryData<Vehicle>(['vehicle', vehicleId])

  // 3. Immediately update the cache as if the bid succeeded
  //    → the UI updates BEFORE the network request completes
  if (prev) {
    qc.setQueryData<Vehicle>(['vehicle', vehicleId], {
      ...prev,
      current_bid: amount,
      bid_count: prev.bid_count + 1,
    })
  }

  // 4. Return the snapshot so onError can restore it
  return { prev }
},

onError: (_err, _amount, ctx) => {
  // 5. If the server rejects the bid, restore the snapshot
  if (ctx?.prev) qc.setQueryData(['vehicle', vehicleId], ctx.prev)
},
```

**Why this matters for an auction:**
Without optimistic updates, the UX is: user clicks bid → spinner → 200ms delay → UI updates. In a competitive live auction, that latency feels broken. With optimistic updates: user clicks bid → UI updates instantly → server confirms in background → if outbid, rollback + toast.

The rollback path is critical for auction integrity. The user sees immediate feedback but the server is the source of truth. If another buyer outbid them in those 200ms, the rollback correctly shows the higher bid.

**The subtle bug this prevents:**
`cancelQueries` is essential. Without it, a stale in-flight query could resolve *after* the optimistic update and overwrite it with the old bid state, making the UI briefly show the wrong value.

---

## Q6: Why URL search params for filters instead of React state?

**Short answer:** Shareability and browser history.

**Full answer:**
Filters stored in component state die when you navigate away. URL params persist. A dealer forwarding `/?make=Ford&body_style=truck&province=Ontario` to a buyer is a real workflow in a B2B marketplace. Browser back/forward also works correctly — pressing back returns you to the previous filter state, not an empty inventory.

The tradeoff: slightly more boilerplate (`useSearchParams` vs `useState`). Worth it for the UX.

In a production system, you'd also want filters as URL params for analytics — tracking which filter combinations buyers use most frequently is actionable product data.

---

## Q7: Why pagination instead of infinite scroll?

**Short answer:** URL-addressable pages + honest architecture for the scale this will reach.

**Full answer:**
200 vehicles renders fine with either approach. But:

1. **URL params**: Pagination maps cleanly to `?page=2` in the URL. Infinite scroll has no natural URL representation.
2. **Accessibility**: Infinite scroll has well-documented keyboard navigation and screen reader problems. Pagination is more accessible.
3. **Architectural honesty**: Offset pagination (`LIMIT 24 OFFSET 48`) is what this system needs now. The upgrade path to cursor-based pagination (stable under concurrent writes, essential at 200k+ vehicles) is straightforward and worth discussing in the walkthrough — it shows I know the limits of offset pagination without over-engineering for a prototype.

---

## Q8: How did you use AI tooling in this project?

**What Claude Code did:**
- Scaffolded the entire monorepo structure, all config files, and the full component tree based on the architecture plan we designed together
- Wrote all boilerplate UI components (shadcn-style Radix primitives, Tailwind variants)
- Implemented TanStack Query hooks including the optimistic update pattern
- Built the Hono server routes with filtering/sorting logic

**What I drove:**
- Every architecture decision: backend vs frontend-only, URL state for filters, optimistic locking design, pagination strategy
- All product decisions: quick bid options relative to minimum bid, reserve met indicator (showing status not price), confirmation dialog before bid placement, damage notes as badges
- Systems design rationale for each component — what state lives where and why

**How I'd characterize the workflow:**
Claude Code is a fast implementation layer. It doesn't make architecture decisions — I made all of those. It converts those decisions into code faster than typing them manually. I review every output, understand every line, and redirect when it's off-track. It's a multiplier on output speed, not a replacement for design thinking.

In the walkthrough: I can explain any file in this codebase. Ask me anything.

---

## Q9: What would you build with more time?

Priority order (highest signal per hour):

1. **Optimistic locking** (`version` field on Vehicle, atomic bid validation) — fixes the real correctness gap
2. **Bid history** — log each bid with timestamp, show last 5 on detail page — adds trust/transparency
3. **WebSocket real-time** — replace 5s polling — better live auction UX
4. **Watchlist** — heart button + localStorage — buyers track vehicles across sessions
5. **Related vehicles** — same make/body style on detail page — reduces bounce rate
6. **Buy Now flow completion** — currently wired but no post-purchase state

What I explicitly wouldn't build without more data: saved searches, push notifications, dealer profiles. These require understanding buyer behavior first.

---

## Q10: What's the minimum bid increment and why $250?

`MIN_BID_INCREMENT = 250` in `server/src/lib/auctionUtils.ts:7` and `client/src/lib/auction.ts:6`.

$250 is a reasonable wholesale market increment. The quick bid buttons are relative to the minimum bid — not fixed dollar amounts above the current bid — because fixed amounts confuse buyers when the gap between minimum and current is already large.

For example, if current bid is $35,000, minimum is $35,250. A fixed "+$250" button is fine. But a fixed "+$250" button when current is $34,000 and starting bid is $35,000 would create an invalid bid. Relative-to-minimum buttons are always valid and require no mental arithmetic from the buyer.
