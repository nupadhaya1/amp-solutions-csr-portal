# Customer Search And Profile Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remember the CSR's customer text search across dashboard and customer-profile navigation within the current tab session, replace profile tabs with a back-to-customer-search action, add visible purchase history, and finish the remaining branding/docs/favicon polish.

**Architecture:** Keep the remembered customer search client-side in `sessionStorage` so it persists across CSR route changes but clears on refresh. Hydrate the customers table from that shared key, have dashboard search write to the same key before navigation, simplify the profile page to a back link to `/csr/customers`, and render purchase history from the existing dashboard profile view model.

**Tech Stack:** Next.js App Router, React 19, TanStack Table, Prisma, Tailwind CSS, Node test runner

---

### Task 1: Lock the intended UI behavior in tests

**Files:**
- Modify: `src/components/customer-table-layout.test.js`
- Modify: `src/components/dashboard-client-layout.test.js`
- Modify: `src/components/customer-workspace-tabs.test.js`
- Modify: `src/lib/domain/customer-dashboard-view-model.test.js`

- [ ] Add assertions for session-backed search restoration, tab removal, back-button wording, and visible purchase history data.
- [ ] Run: `npm test -- src/components/customer-table-layout.test.js src/components/dashboard-client-layout.test.js src/components/customer-workspace-tabs.test.js src/lib/domain/customer-dashboard-view-model.test.js`
- [ ] Confirm the new assertions fail for the current implementation.

### Task 2: Implement shared customer-search session state and profile navigation

**Files:**
- Create: `src/lib/customer-search-session.js`
- Modify: `src/components/customer-table.jsx`
- Modify: `src/components/dashboard-client.jsx`
- Modify: `src/app/csr/customers/[id]/page.jsx`
- Modify: `src/components/customer/customer-summary-card.jsx`

- [ ] Add a tiny shared helper for the customer-search storage key and set/get/clear helpers.
- [ ] Update dashboard search to write the remembered query before routing to customer results or a profile.
- [ ] Update the customer table to hydrate from `sessionStorage`, persist edits, and clear stored state on `Clear search`.
- [ ] Remove the profile workspace tabs and replace the header link copy/target with `Back to customer search` pointing to `/csr/customers`.
- [ ] Run the targeted tests from Task 1 until they pass.

### Task 3: Expose purchase history in the customer profile

**Files:**
- Create: `src/components/customer/purchase-history-card.jsx`
- Modify: `src/components/customer/customer-dashboard-layout.jsx`
- Modify: `src/lib/data/customers.js`
- Modify: `src/lib/domain/customer-dashboard-view-model.js`
- Modify: `src/lib/domain/customer-dashboard-view-model.test.js`

- [ ] Extend the shared customer include so purchases have enough related context for display.
- [ ] Normalize purchase rows in the dashboard profile view model for date, amount, type/status labels, and optional vehicle/subscription context.
- [ ] Render a dedicated purchase-history card in the main customer profile column.
- [ ] Run the targeted purchase-history tests and fix any regressions.

### Task 4: Finish brand/docs/favicon polish and verify

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/customer/customer-ui.jsx`
- Modify: `src/components/customer-table.jsx`
- Modify: `src/components/dashboard-client.jsx`
- Modify: `src/app/layout.js`
- Modify: `README.md`

- [ ] Retoken the brand blues to AMP navy/bright-blue values and swap non-semantic brand utility classes to theme-token usage where they are currently hard-coded.
- [ ] Fix layout metadata so favicon references only point at assets that actually exist.
- [ ] Update the README seeded-customer count to match the live demo.
- [ ] Run: `npm test`
- [ ] Run: `npm run lint`
