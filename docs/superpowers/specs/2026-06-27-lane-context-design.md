# Lane Context Design

## Goal

Add a production-like but demo-safe Lane Context feature to the AMP CSR portal so CSRs can see live-style wash-lane operational context, identify blocked customers at the gate, and route directly into the existing support flows that already resolve payment, vehicle, and subscription issues.

## Scope

This feature adds:

- a persisted `LaneSession` data model in Prisma/Postgres
- three seeded unresolved lane sessions representing realistic operational scenarios
- a new `/csr/lane-context` page and sidebar entry
- shared lane-context mapping helpers for labels, severity, and recommended actions
- lane-aware customer/profile/dashboard/search presentation
- minimal resolution hooks in existing payment and vehicle flows

This feature does not add:

- websockets
- polling loops
- external gate integrations
- camera feeds
- background jobs
- random client-side state mutation that changes DB-backed meaning

## Product Intent

The existing portal already handles membership, vehicle, billing, and account support. Lane Context should make those workflows feel grounded in an AMP attendant environment by showing the customer’s physical wash-lane state at the moment a CSR is helping them.

The lane view must feel operational:

- deterministic
- compact
- data-backed
- easy to scan
- directly connected to existing CSR actions

## Data Model

### Prisma Enums

Add these enums:

- `LaneSessionStatus`
  - `PRE_GATE`
  - `AT_GATE`
  - `IN_QUEUE`
  - `WASH_STARTED`
  - `WASH_COMPLETED`
  - `BLOCKED`
  - `NO_ACTIVE_SESSION`
- `LaneIssueCode`
  - `NONE`
  - `FAILED_PAYMENT`
  - `PLATE_MISMATCH`
  - `NO_ACTIVE_SUBSCRIPTION`
  - `UNKNOWN_VEHICLE`
- `LaneIssueSeverity`
  - `NONE`
  - `INFO`
  - `WARNING`
  - `BLOCKING`

Enums are preferred over raw strings because the allowed values are stable, small, and reused across seed, filters, display mapping, and resolution logic.

### LaneSession Model

Add a lean `LaneSession` model:

```prisma
model LaneSession {
  id            String            @id @default(cuid())
  customerId    String?
  vehicleId     String?
  locationName  String
  laneName      String
  status        LaneSessionStatus
  detectedPlate String
  detectedAt    DateTime
  confidence    Float?
  issueCode     LaneIssueCode     @default(NONE)
  issueSeverity LaneIssueSeverity @default(NONE)
  resolvedAt    DateTime?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  customer      Customer?         @relation(fields: [customerId], references: [id])
  vehicle       Vehicle?          @relation(fields: [vehicleId], references: [id])

  @@index([customerId])
  @@index([vehicleId])
  @@index([status])
  @@index([issueCode])
  @@index([detectedPlate])
  @@index([resolvedAt])
}
```

### Existing Model Updates

Add relation arrays:

- `Customer.laneSessions LaneSession[]`
- `Vehicle.laneSessions LaneSession[]`

No additional event/history table is required for this iteration.

## Seed Design

Seed exactly three unresolved lane sessions after seeded customers/vehicles exist.

Stable lookup strategy:

- find seeded customers by email
- find their linked seeded vehicles by plate through the already created records

Required scenarios:

1. Failed payment at gate
   - customer: Alex Morgan
   - status: `BLOCKED`
   - issue code: `FAILED_PAYMENT`
   - severity: `BLOCKING`
   - detected plate: actual seeded vehicle plate
   - linked to real customer and vehicle

2. Clean customer in queue
   - customer: existing active seeded customer
   - status: `IN_QUEUE`
   - issue code: `NONE`
   - severity: `NONE`
   - detected plate: actual seeded vehicle plate
   - linked to real customer and vehicle

3. Plate mismatch at gate
   - customer: existing active seeded customer with an active subscription
   - status: `AT_GATE`
   - issue code: `PLATE_MISMATCH`
   - severity: `WARNING`
   - detected plate: intentionally different from the customer’s covered vehicle plate
   - customer linked, vehicle may be null if the detected plate is not a known vehicle

The three unresolved seeded sessions are the “always visible” demo state. The lane page renders from DB records and filters over those persisted rows.

## Active Session Semantics

For this feature, “active lane session” means:

- `resolvedAt` is `null`

The latest unresolved session for a customer is the one shown on the customer profile and the one used for badges in shared customer surfaces.

This keeps the implementation predictable and avoids overbuilding session lifecycle rules.

## Domain Mapping

Create one shared lane-domain helper module responsible for:

- converting enum values to display labels
- deriving severity tone classes
- returning issue summary text
- returning recommended action text
- deriving whether a card is blocking, warning, or clear

Hardcoded issue mapping:

- `NONE`
  - summary: `No blocking issue detected.`
  - action: `Customer is cleared to continue.`
- `FAILED_PAYMENT`
  - summary: `Membership blocked due to failed payment.`
  - action: `Update the customer’s payment method and retry the failed membership charge.`
- `PLATE_MISMATCH`
  - summary: `Detected plate does not match the active subscription vehicle.`
  - action: `Confirm the customer’s current vehicle and transfer the subscription if needed.`
- `NO_ACTIVE_SUBSCRIPTION`
  - summary: `No active subscription found for this vehicle.`
  - action: `Review the customer’s plan and add or reactivate a subscription.`
- `UNKNOWN_VEHICLE`
  - summary: `Vehicle was detected at the lane but could not be matched to a customer.`
  - action: `Use customer search to look up a possible account by plate, phone, or email.`

Status display labels:

- `PRE_GATE` → `Pre-gate`
- `AT_GATE` → `At gate`
- `IN_QUEUE` → `In queue`
- `WASH_STARTED` → `Wash started`
- `WASH_COMPLETED` → `Wash completed`
- `BLOCKED` → `Blocked`
- `NO_ACTIVE_SESSION` → `No active session`

## Data Access

Add a focused lane data module that supports:

- listing unresolved lane sessions with optional filters
- looking up the latest unresolved lane session for a customer
- clearing/updating a lane session when an existing support action resolves it

Expected filters:

- status
- issue code
- detected plate contains query text

Filtering should happen against Prisma data, not client-side fake records.

## Route Design

### New Page

Add `/csr/lane-context`.

Page responsibilities:

- load unresolved lane sessions from Prisma
- read filter/search params from the URL
- render summary counts
- render responsive operational cards
- render a compact resolution helper section

No live polling is required. Relative times are sufficient to make the page feel current.

### Sidebar

Add a new nav item:

- label: `Lane Context` or `Live Lane Context`
- href: `/csr/lane-context`

Use the existing sidebar styling and active-route behavior.

## Lane Context Page UI

### Header

- title: `Live Lane Context`
- subtitle: `Operational view of vehicles currently moving through AMP wash lanes.`

### Summary Row

Show compact stat cards for:

- active sessions
- blocking issues
- at gate
- cleared/in queue

### Filters

Support these filters without introducing a new state architecture:

- all
- at gate
- blocked
- in queue
- plate mismatch
- failed payment
- search by detected plate

This can be done through URL query params on the server-rendered page or by filtering server-provided data in a small client wrapper as long as the source data is persisted Prisma data.

### Lane Cards

Each card shows:

- status badge
- detected plate
- matched vehicle or fallback text
- customer name or fallback text
- location name
- lane name
- last detected time with relative display
- issue summary
- recommended action
- CTA buttons

Tone rules:

- blocking: red only for truly blocking issues
- warning: amber for plate mismatch or non-terminal concerns
- clear: brand blue/neutral surfaces for non-blocking sessions

### Empty/Fallback States

Cards and profile snippets must handle:

- missing linked customer
- missing linked vehicle
- unknown vehicle scenarios

Fallback text should remain operational and concise, not decorative.

## CTA Design

CTAs should route into existing workflows instead of duplicating UI.

- `FAILED_PAYMENT`
  - `View customer`
  - `Update payment`
  - `Retry charge`
- `PLATE_MISMATCH`
  - `View customer`
  - `Transfer vehicle`
- `NO_ACTIVE_SUBSCRIPTION`
  - `View customer`
  - `Review membership`
- `UNKNOWN_VEHICLE`
  - `Search customers`
- `NONE`
  - `View customer`

The lane page can deep-link into the customer profile and optionally append a narrow action hint query param for existing dialogs if the current route architecture already supports it cleanly.

## Customer Profile Integration

Add a compact lane-context card or banner near the top of the customer detail page when the customer has a latest unresolved lane session.

Show:

- status
- detected plate
- location/lane
- issue summary
- recommended action

This should be visually secondary to the main customer profile but clearly operational.

The card should also expose the relevant CTA when the issue is resolvable through an existing customer action.

## Customer List And Search Integration

Lane awareness should be a shared customer signal and appear anywhere customer rows are already shown when practical.

Required surfaces:

- customer table rows
- dashboard attention rows
- dashboard autocomplete/search results

Shared row-level metadata should include:

- current lane label when a customer has an unresolved session
- optional issue label for blocking or mismatch scenarios

Badge examples:

- `At gate`
- `Blocked`
- `In queue`
- `Plate mismatch`

This should not break existing pagination, search behavior, or customer list behavior. The implementation should enrich the current view models rather than replace them.

## Resolution Behavior

### Failed Payment Resolution

When the existing payment retry flow succeeds for a customer with an unresolved `FAILED_PAYMENT` lane session:

- update that lane session
- set `issueCode` to `NONE`
- set `issueSeverity` to `NONE`
- set `status` to `IN_QUEUE`
- set `resolvedAt` to the current time

The lane page and profile badge should then reflect a cleared/non-blocking state rather than blocked.

### Plate Mismatch Resolution

When the existing transfer-vehicle flow succeeds for a customer with an unresolved `PLATE_MISMATCH` lane session:

- update that lane session
- set `issueCode` to `NONE`
- set `issueSeverity` to `NONE`
- set `status` to `IN_QUEUE`
- set `resolvedAt` to the current time

### Unknown Vehicle Behavior

Unknown vehicle sessions do not create new account flows. The operational assumption is that this may be a one-time wash or a customer who changed vehicles. The CSR is directed to existing customer search.

## Demo-Live Simulation

To keep the feature feeling live without expensive infrastructure:

- persist `detectedAt` timestamps in DB
- render relative timestamps such as `2 min ago`
- optionally add a deterministic display-only helper for non-blocking “movement” copy if it does not alter DB-backed filtering meaning

No background status rotation or random client mutation should affect filtering, search, or issue meaning.

## File Structure

Expected additions and changes:

- Prisma schema and migration
- Prisma seed updates
- lane-context data access module
- lane-context domain helper module
- lane-context page route
- sidebar nav update
- customer profile composition update
- customer row/search/dashboard view-model enrichment
- existing action-handler updates for lane resolution
- tests across schema-adjacent logic, seeds, domain helpers, and UI composition

The lane-domain helper should stay focused and reusable so lane labels/actions do not get duplicated across components.

## Testing Strategy

Use TDD across small slices:

1. schema/seed/domain behavior
2. list/search/customer view-model enrichment
3. lane page rendering and filter presence
4. resolution updates in payment/vehicle flows

Tests should verify:

- lane mapping labels/actions
- exactly three seeded unresolved sessions
- failed-payment and plate-mismatch resolution state changes
- customer/profile/dashboard surfaces show lane context when present
- unknown vehicle fallback behavior remains safe

## Risks And Mitigations

### Risk: Customer query inflation

Adding lane joins everywhere can make customer queries heavier.

Mitigation:

- only include latest unresolved lane-session metadata where needed
- keep autocomplete payloads lightweight
- avoid loading full lane-session history for generic search paths

### Risk: Duplicate action UI

Lane cards could accidentally invent new workflows.

Mitigation:

- route all actionable issues into existing customer flows
- keep lane-specific UI read-mostly

### Risk: Demo inconsistency

If lane statuses mutate randomly, the demo becomes hard to reason about.

Mitigation:

- persist deterministic seeded state
- only mutate lane status when an existing CSR action truly resolves the issue

## Acceptance Mapping

This design satisfies the requested acceptance criteria by:

- adding Prisma-backed lane-session persistence
- seeding three operational scenarios
- exposing a dedicated lane page
- integrating lane context into existing customer surfaces
- reusing current resolution flows
- avoiding websockets, polling, jobs, external services, and unnecessary dependencies
