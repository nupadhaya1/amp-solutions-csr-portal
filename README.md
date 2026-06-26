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

1. Open the live app at `/`.
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

## Seeded Demo Customers

- Alex Morgan: failed membership payment and overdue subscription
- Priya Shah: healthy family plan account
- Marcus Reed: vehicle transfer workflow
- Alicia Brown: purchase and refund history workflow
- Ethan Brooks: cancellation workflow
- Sophia Nguyen: multi-vehicle downgrade workflow

## Planned Routes

- `/`: CSR portal dashboard
- `/csr`: CSR dashboard
- `/csr/search`: customer search
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
- Smart Help Search over seeded FAQ articles.
- Browser presentation route and mobile companion demo route.
- Vercel Analytics and Speed Insights.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm test
npm run db:generate
npm run db:push
npm run db:seed
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
- Smart Help Search over seeded FAQ articles instead of a production LLM
- No real payment processing, proration, refunds, or tax calculations
- Mock mobile companion is demo-only
- AWS architecture is summarized in the presentation route, while MVP deployment targets Vercel and Neon

## Demo Walkthrough

1. Open `/` for the CSR portal dashboard.
2. Search by caller details or license plate `CZR4821`.
3. Open the customer profile and review the critical unable-to-wash banner.
4. Confirm the overdue subscription and failed membership payment.
5. Add a support note or complete a CSR action such as plan change, vehicle transfer, or cancellation.
6. Review the audit timeline update.
7. Open `/presentation` for the reviewer walkthrough and `/mobile` for the companion demo.
