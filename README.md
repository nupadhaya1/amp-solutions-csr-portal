# AMP CSR Command Center

A support portal for resolving customer membership, vehicle, subscription, and payment issues for AMP car wash memberships.

## MVP Focus

The primary workflow is a customer calling because they cannot get a wash. The CSR should be able to search by caller details or a realistic license plate, open the customer profile, see the overdue subscription, find the failed membership payment, and take a support action.

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

## MVP Tradeoffs

- Mock CSR identity instead of real authentication
- Smart Help Search over seeded FAQ articles instead of a production LLM
- No real payment processing, proration, refunds, or tax calculations
- Mock mobile companion is demo-only
- AWS architecture will be documented in the presentation, while MVP deployment targets Vercel and Neon
