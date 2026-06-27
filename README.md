# AMP CSR Command Center

A support portal for resolving customer membership, vehicle, subscription, and payment issues for AMP car wash memberships.

## Submission Links

- Live app: https://amp-csr-portal.nupadhaya.com
- Vercel app alias: https://amp-solutions-csr-portal.vercel.app
- GitHub repo: https://github.com/nupadhaya1/amp-solutions-csr-portal
- Presentation route: https://amp-csr-portal.nupadhaya.com/presentation
- Mobile companion route: https://amp-csr-portal.nupadhaya.com/mobile

## MVP Focus

The primary workflow is a customer calling because they cannot get a wash. The CSR should be able to search by caller details or a realistic license plate, open the customer profile, see the overdue subscription, find the failed membership payment, and take a support action.

## Reviewer Walkthrough

1. Open the live app at `/csr/dashboard`.
2. Search by caller details or license plate `CZR4821`.
3. Open the customer profile for the overdue account.
4. Review the critical unable-to-wash banner, affected subscription, failed membership payment, and purchase history.
5. Add a support note or complete a CSR action:
   - edit account information
   - add a vehicle
   - transfer subscription coverage
   - change subscription plan
   - cancel subscription
6. Confirm the audit timeline records the CSR action.
7. Open `/presentation` for the take-home walkthrough and `/mobile` for the companion demo.

## Tech Stack

- Next.js App Router
- JavaScript
- Tailwind CSS
- Prisma
- Postgres / Neon
- Zod
- Fuse.js
- Framer Motion

## Local Setup

```bash
npm install
vercel env pull .env.development.local
npm run db:generate
npm run db:push
npm run db:seed
npm run db:seed:dashboard
npm run dev
```

The local app runs at `http://localhost:3000`.

If local builds need database access, load the pulled development variables first:

```bash
set -a; source ./.env.development.local; set +a
npm run build
```

## Database

Development, preview, and production use the Vercel-connected Neon database resource named `nupadhaya`, with this app using the separate `amp_csr` database inside that Neon project. Do not commit `.env.development.local`, `.env.local`, or production connection strings.

For local development, pull the Vercel development environment variables:

```bash
vercel env pull .env.development.local
npm run db:push
npm run db:seed
```

To reset seeded data during development:

```bash
npm run db:reset
```

To add historical dashboard data, run the Prisma seed first so subscription
plans exist, then run the dashboard time-series seed:

```bash
npm run db:seed
npm run db:seed:dashboard
```

Then open `/csr/dashboard` to review the dashboard charts and attention queue.

## Seeded Demo Data

The current demo dataset includes 220 customers plus related vehicles, subscriptions, purchases, support notes, audit events, and 9 FAQ articles.

Representative support scenarios:

- Alex Morgan and Maya Patel: failed membership payments and overdue subscriptions
- Priya Shah and Grace Lee: healthy family plan accounts
- Marcus Reed and Ben Wilson: vehicle transfer workflows
- Alicia Brown and Harper Davis: purchase and refund history workflows
- Ethan Brooks and Olivia Martinez: cancellation workflows
- Daniel Kim: paused subscription
- Sophia Nguyen and Mia Thompson: multi-vehicle plan management

## Planned Routes

- `/`: redirects to `/csr/dashboard`
- `/csr`: redirects to `/csr/dashboard`
- `/csr/dashboard`: CSR dashboard
- `/csr/customers`: customer lookup and search
- `/csr/search`: redirects to `/csr/customers`
- `/csr/smart-search`: semantic customer and FAQ search
- `/csr/customers/[id]`: customer profile
- `/mobile`: mock mobile companion
- `/presentation`: browser presentation
- `/demo`: manual demo launcher

## Implemented Features

- Database-backed CSR dashboard summary.
- Smart customer search across names, contact details, vehicles, purchases, support notes, and audit history.
- Customer profile with account details, vehicles, subscriptions, purchase history, support notes, and audit timeline.
- Account editing with audit events.
- Vehicle creation with normalized license plates and audit events.
- Subscription cancellation, plan changes, and vehicle coverage transfer.
- Smart Search over local semantic vectors for customer cases and FAQ articles.
- Browser presentation route and mobile companion demo route.
- Vercel Analytics and Speed Insights.

## Smart Search Approach

The Smart Search tab uses a local KNN-style search:

- Build support documents from customer records, support notes, audit events, purchases, subscriptions, and FAQ articles.
- Tokenize and normalize the text locally.
- Expand common support synonyms such as vehicle/car/truck, membership/subscription, and failed/declined/overdue.
- Build TF-IDF weighted vectors per request.
- Rank nearest documents with cosine similarity.

This keeps the MVP private, free, deterministic, and deployable on Vercel without model hosting. A production upgrade path would be:

1. Add `pgvector` to Postgres.
2. Generate embeddings during seed/import or write-time updates.
3. Use a small embedding model such as MiniLM locally in a worker, or a managed embedding API if allowed.
4. Query nearest neighbors with vector distance and blend the score with account priority signals.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm test
npm run db:generate
npm run db:push
npm run db:seed
npm run db:seed:dashboard
npm run db:reset
```

## Verification

Current submission checks:

```bash
npm test
npm run lint
set -a; source ./.env.development.local; set +a; npm run build
```

The app uses Vercel and Neon free-tier resources. Environment variable values are stored in Vercel/Neon and are not committed to the repository.

## MVP Tradeoffs

- Mock CSR identity instead of real authentication
- Smart Search uses local TF-IDF vectors instead of a production LLM or hosted embedding service
- No real payment processing, proration, refunds, or tax calculations
- Mock mobile companion is demo-only
- AWS architecture is summarized in the presentation route, while MVP deployment targets Vercel and Neon

## Demo Walkthrough

1. Open `/csr/dashboard` for the CSR portal dashboard.
2. Search by caller details or license plate `CZR4821`.
3. Open the customer profile and review the critical unable-to-wash banner.
4. Confirm the overdue subscription and failed membership payment.
5. Add a support note or complete a CSR action such as plan change, vehicle transfer, or cancellation.
6. Review the audit timeline update.
7. Open `/presentation` for the reviewer walkthrough and `/mobile` for the companion demo.
