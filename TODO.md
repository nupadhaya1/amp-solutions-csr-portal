# AMP CSR Command Center TODO

Use `feature/` branches for implementation work. Keep each branch scoped to one visible product slice so the GitHub history reads like a professional build-out.

## Current Branch Queue

- `feature/realistic-plates-csr-actions`: realistic seeded license plates, repo docs, account edit, add vehicle, cancel subscription.
- `feature/subscription-transfer-plan-change`: transfer vehicle coverage and change subscription plans.
- `feature/demo-presentation-mobile`: `/presentation` walkthrough and `/mobile` companion demo.
- `feature/final-polish-readme`: submission README and deployment notes.

## MVP Checklist

- [x] Next.js JavaScript app with Tailwind.
- [x] Prisma schema for customers, vehicles, subscriptions, purchases, notes, audit events, and FAQs.
- [x] Neon Postgres database connected through Prisma.
- [x] Seeded support scenarios with realistic-looking license plates.
- [x] CSR portal as the default landing page.
- [x] Customer search by name, phone, email, plate, and support-language queries.
- [x] Customer profile with account, vehicles, subscriptions, purchase history, notes, and audit timeline.
- [x] Support notes with audit trail.
- [x] Account edit form with audit trail.
- [x] Add vehicle form with audit trail.
- [x] Cancel subscription form with audit trail.
- [x] Transfer subscription coverage between vehicles.
- [x] Change subscription plan.
- [x] Smart Help Search UI over seeded FAQ articles.
- [x] Browser presentation route.
- [x] Mobile companion demo route.
- [x] README submission guide with live app URL and demo script.

## Parallel Work Suggestions

- One branch can focus on CSR mutations: account edit, vehicle add, cancellation, transfer, plan changes.
- A second branch can focus on presentation/mobile demo routes and README copy.
- Avoid editing the same files in parallel when possible. `src/app/csr/customers/[id]/page.jsx` is the highest-conflict file.

## Demo Script

1. Open the portal dashboard.
2. Search for a customer by caller details or a realistic license plate such as `CZR4821`.
3. Open the customer profile.
4. Diagnose the unable-to-wash issue from the critical banner, subscription status, and failed payment.
5. Add a support note or complete a CSR action.
6. Show the audit timeline update.

## Submission Checks

- [x] `npm run lint`
- [x] `npm test`
- [x] `npm run build`
- [x] Seeded demo data verified against the connected database.
- [x] No secrets committed.
- [x] README includes GitHub repo link, Vercel deployment link, setup steps, and tradeoffs.
