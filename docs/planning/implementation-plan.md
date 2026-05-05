# Implementation Plan

Phased build order, each phase independently shippable and demonstrable.

---

## Phase 0: Project Scaffold (30 min)

Goal: Working monorepo, both apps boot, proxy works.

```
Tasks:
□ Init pnpm workspace with client/ and server/
□ client: Vite + React + TypeScript template
□ client: Tailwind CSS + shadcn/ui setup
□ client: React Router v6 (data router)
□ client: TanStack Query provider
□ server: Hono + TypeScript + tsx
□ server: Seed vehicles.json into in-memory store
□ server: CORS + /api/vehicles GET (all vehicles, no filters yet)
□ client: Vite proxy /api → :3001
□ Root: concurrently dev script
□ Smoke test: fetch /api/vehicles, render vehicle count in App
```

---

## Phase 1: Inventory Browsing (60–90 min)

Goal: Buyer can see all vehicles in a scannable grid, switch to list view.

```
Tasks:
□ Vehicle type definition (TypeScript)
□ useVehicles() hook (TanStack Query)
□ VehicleCard component (grid variant)
□ VehicleCard component (list variant)
□ VehicleGrid + VehicleList layout
□ ViewToggle (grid ↔ list)
□ AuctionStatusChip (upcoming/live/ended)
□ ConditionBadge (grade chip)
□ Basic pagination (24/page, page in URL)
□ ResultCount display
□ Responsive grid (1→2→3→4 col)
□ Lazy image loading (IntersectionObserver or loading="lazy")
```

**Checkpoint**: You can browse all 200 vehicles, see their status and bid state.

---

## Phase 2: Search & Filters (45–60 min)

Goal: Buyer can narrow inventory to relevant vehicles.

```
Tasks:
□ SearchBar (full-text on make/model/trim/VIN) — URL param q=
□ FilterSidebar component
□ FilterSection: Make (multiselect checkboxes)
□ FilterSection: Body Style (multiselect checkboxes)
□ FilterSection: Condition Grade (range slider, 1.0–5.0)
□ FilterSection: Price Range (dual slider)
□ FilterSection: Province (multiselect checkboxes)
□ FilterSection: Title Status (clean/salvage/rebuilt)
□ ActiveFilterChips (show active filters, click to remove)
□ SortDropdown (current bid ↑↓, price ↑↓, condition, newest)
□ Server: filter/sort/search logic in GET /api/vehicles
□ Mobile: FilterDrawer (bottom sheet, trigger button in toolbar)
□ "Clear all filters" button
□ Filter state in URL search params (shareable)
```

**Checkpoint**: You can search "Toyota", filter to SUVs in Ontario, sort by current bid.

---

## Phase 3: Vehicle Detail (45–60 min)

Goal: Buyer gets the full picture of a vehicle before bidding.

```
Tasks:
□ React Router route: /vehicles/:id
□ useVehicle(id) hook
□ BreadcrumbNav (Inventory > 2023 Ford Bronco)
□ ImageGallery: MainImage + ThumbnailStrip
□ VehicleHeader (Year Make Model Trim, Lot #, Location)
□ SpecsGrid (engine, transmission, drivetrain, fuel, odometer, exterior color, interior color, VIN)
□ ConditionGradeBar (visual 1.0–5.0 bar with color)
□ ConditionReport (text block)
□ DamageNotes (badge chips, or "No damage noted")
□ DealerInfo (selling_dealership, city, province)
□ Link back to inventory (← Back to Inventory)
□ VehicleCard links to /vehicles/:id
```

**Checkpoint**: Clicking a vehicle card shows full detail including all specs and damage.

---

## Phase 4: Bidding Experience (60–75 min)

Goal: Buyer can place a bid and see updated state.

```
Tasks:
□ AuctionPanel component (sticky sidebar desktop, bottom-fixed mobile)
□ AuctionTimer (countdown or "Starts in X" or "Ended")
□ AuctionStatusBadge (live/upcoming/ended)
□ CurrentBidDisplay (or starting bid if no bids)
□ BidStats (bid count, reserve met indicator)
□ BuyNowButton (conditional on buy_now_price)
□ BidForm:
    □ MinBidHint ("Minimum bid: $X,XXX")
    □ QuickBidButtons (4 options relative to min bid)
    □ Custom BidAmountInput (number input, formatted)
    □ PlaceBidButton (disabled if amount < min)
    □ BidConfirmDialog (shadcn Dialog)
□ usePlaceBid() mutation hook:
    □ Optimistic update
    □ Server POST /api/vehicles/:id/bids
    □ Rollback on error
    □ Toast on success/error (shadcn Toast)
□ Server: POST /api/bids route with validation
□ Bid validation: live check, min increment, amount type
□ Auction time normalization at server startup
```

**Checkpoint**: You can place a bid, see the current bid update immediately, and get an error if the auction isn't live.

---

## Phase 5: Polish & Mobile (30–45 min)

Goal: It feels intentional and works well on phone.

```
Tasks:
□ Mobile header (hamburger → nav drawer)
□ Mobile filter drawer (full-height sheet from bottom)
□ Mobile AuctionPanel (fixed bottom bar with "Place Bid" CTA)
□ Skeleton loading states (VehicleCard skeletons during fetch)
□ Empty state (no vehicles match filters)
□ 404 page for unknown vehicle IDs
□ Error boundary for API failures
□ Accessibility: focus management in BidConfirmDialog
□ Keyboard navigation in ImageGallery (arrow keys)
□ Print: hide sidebar/header for print (condition report)
□ README finalization with setup instructions
□ Submission doc with decisions and tradeoffs
```

---

## Stretch (if time permits, in priority order)

1. **Simulated competing bids**: While a vehicle is LIVE, trigger a background interval that occasionally places a competing bid (via server-side store update, polled by client every 5s). Makes the live auction feel real.

2. **Watchlist**: Heart button on VehicleCard stores watched vehicle IDs in localStorage. "Watching" tab in inventory shows only watched vehicles.

3. **Related vehicles**: On detail page, show 3-4 vehicles with same make/body style.

4. **Bid history display**: Log every bid with a timestamp in the server store, show last 5 bids on detail page.

5. **Buy-now flow**: "Buy Now" button bypasses bidding and immediately sets a winning state.

---

## Time Budget Estimate

| Phase | Estimate |
|---|---|
| 0: Scaffold | 30 min |
| 1: Inventory | 75 min |
| 2: Search & Filters | 60 min |
| 3: Vehicle Detail | 60 min |
| 4: Bidding | 75 min |
| 5: Polish | 45 min |
| **Total** | **~6h 15m** |

This fits inside the 4–8 hour target with time to spare for iteration and the README.
