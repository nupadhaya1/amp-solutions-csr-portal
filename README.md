# AMP CSR Command Center

> **Live demo:** https://amp-csr-portal.nupadhaya.com  
> **Presentation:** https://amp-csr-portal.nupadhaya.com/presentation  
> **CSR Docs:** https://amp-csr-portal.nupadhaya.com/csr/docs  
> **Lane Context:** https://amp-csr-portal.nupadhaya.com/csr/lane-context  
> **GitHub:** https://github.com/nupadhaya1/amp-solutions-csr-portal

A full-stack customer service representative portal for AMP car wash memberships. The app helps a CSR quickly find a customer, understand their account/payment/vehicle/lane context, resolve common membership issues, and leave an audit trail.

## Why this project exists

AMP members may call support when they cannot get a wash, have questions about a recent purchase, want to cancel, or need a subscription transferred to a new vehicle. This portal is designed around that real CSR workflow:

```txt
Search fast → Diagnose clearly → Take the right action → Persist an audit trail
```

## Reviewer demo path

Use this path first during review:

1. Open https://amp-csr-portal.nupadhaya.com/csr/dashboard.
2. Search for `CZR4821` or `failed payment`.
3. Open the overdue customer profile.
4. Review the unable-to-wash banner, lane context, failed membership payment, vehicle subscription, and purchase history.
5. Use a CSR action such as update payment, retry failed charge, add vehicle, transfer coverage, change plan, cancel membership, or add a support note.
6. Confirm the activity/audit timeline records the action.
7. Open https://amp-csr-portal.nupadhaya.com/csr/lane-context to see live lane/session context.
8. Open https://amp-csr-portal.nupadhaya.com/csr/docs to search support playbooks.
9. Open https://amp-csr-portal.nupadhaya.com/presentation for the in-app walkthrough.

## Take-home requirement coverage

| Requirement | Implementation |
|---|---|
| View list of users | `/csr/customers` customer grid with stats, pagination, filters, and row actions |
| Quickly find a specific user | Dashboard search, customer grid search, remembered search state, plate/name/email/phone/status support |
| View account details | Customer profile summary with member ID, contact info, home wash location, account status, plan tags |
| View active vehicle subscriptions | Vehicle/subscription cards with covered vehicles, plan names, statuses, and capacity labels |
| Edit account information | Server action-backed edit account dialog with Zod validation and audit event |
| Add/remove/transfer subscriptions | Add vehicle, transfer coverage, cancel membership, and change plan flows |
| View purchase history | Purchase history card showing membership payments, single washes, coupon redemptions, refunds, failed charges |
| Backend persistence | Prisma + Postgres/Neon, with seeded customers, vehicles, subscriptions, purchases, lane sessions, support notes, and audit events |
| Useful extra functionality | Lane context, semantic CSR docs, recommended next steps, mobile companion route, presentation route, dashboard charts |

## Main routes

| Route | Purpose |
|---|---|
| `/` | Redirects into the CSR portal |
| `/csr/dashboard` | CSR landing page with search, metrics, attention queue, and charts |
| `/csr/customers` | Customer lookup grid with stats, filters, and pagination |
| `/csr/customers/[id]` | Customer profile and all CSR actions |
| `/csr/lane-context` | Operational lane/session view for vehicles at gate, in queue, blocked, or cleared |
| `/csr/docs` | Searchable CSR support playbooks |
| `/csr/docs/[slug]` | Individual support playbook article |
| `/mobile` | Demo companion customer-side mobile state |
| `/presentation` | Browser-based take-home presentation |
| `/demo` | Manual demo launcher |

## Tech stack

- Next.js App Router
- React 19
- JavaScript
- Tailwind CSS v4
- Prisma ORM
- Postgres / Neon
- Zod validation
- TanStack Table
- TanStack Query
- Radix UI dialogs/tabs/dropdowns
- Fuse.js / local deterministic search
- `@huggingface/transformers` using `Xenova/all-MiniLM-L6-v2`
- pgvector support-doc retrieval
- Chart.js / react-chartjs-2
- Framer Motion
- Vercel Analytics and Speed Insights

## Architecture overview

```mermaid
flowchart LR
  A[CSR browser] --> B[Next.js App Router]
  B --> C[Server Components]
  B --> D[Client Workspaces]
  C --> E[Server Actions / API Routes]
  D --> E
  E --> F[Zod Validation]
  F --> G[Domain Logic / View Models]
  G --> H[Prisma ORM]
  H --> I[(Postgres / Neon)]
  G --> J[Smart Search / Docs Search]
  J --> K[(Support Docs + pgvector)]
```

## Data model summary

Core models:

- `Customer`: account identity, contact details, status, home wash location.
- `Vehicle`: customer vehicle record with license plate.
- `SubscriptionPlan`: available membership plans and vehicle capacity.
- `Subscription`: active/overdue/cancelled/paused membership state.
- `SubscriptionVehicle`: join table that attaches vehicles to subscriptions.
- `Purchase`: membership payments, single washes, coupon redemptions, refunds, and failed payments.
- `SupportNote`: CSR-authored notes.
- `AuditEvent`: system and CSR action history.
- `LaneSession`: live lane context such as blocked, at gate, in queue, plate mismatch, or failed payment.
- `FaqArticle`: simple FAQ records used by smart search.
- `SupportDoc` / `SupportDocChunk`: source-of-truth playbooks with local embeddings and pgvector retrieval.

## Seeded demo data

Run both seed steps for the full demo dataset:

```bash
npm run db:seed
npm run db:seed:dashboard
npm run db:seed:docs
```

The base seed creates 16 curated customers for specific CSR scenarios. The dashboard time-series seed adds generated demo customers so the deployed environment shows 220 customers, dashboard trends, attention queues, and more realistic pagination. Support docs seed adds searchable source-of-truth Markdown playbooks.

Representative seeded support scenarios:

- Failed payment / unable to wash: `CZR4821`, `JTF6093`, generated `FIX####` plates.
- Vehicle transfer: Marcus Reed, Ben Wilson, plus plate mismatch lane context.
- Purchase/refund question: Alicia Brown, Harper Davis.
- Cancellation: Ethan Brooks, Olivia Martinez.
- Paused subscription: Daniel Kim.
- Multi-vehicle/family plan management: Priya Shah, Grace Lee, Sophia Nguyen, Mia Thompson.
- Lane context: blocked failed payment, in-queue healthy member, plate mismatch warning.

## CSR Docs semantic search

The `/csr/docs` route searches operational playbooks stored in `docs/csr/*.md`.

Search flow:

```mermaid
flowchart LR
  A[Markdown playbook] --> B[Parse frontmatter]
  B --> C[Chunk article]
  C --> D[MiniLM embedding]
  D --> E[SupportDocChunk.embedding vector(384)]
  F[CSR search query] --> G[MiniLM query embedding]
  G --> H[pgvector cosine search]
  H --> I[Keyword boost + dedupe]
  I --> J[Ranked docs results]
```

The app uses local/free embeddings from `Xenova/all-MiniLM-L6-v2` through `@huggingface/transformers`. The seed creates a 384-dimensional `embedding` column on `SupportDocChunk` and indexes it with pgvector. If vector search fails, the app falls back to database keyword search and then static Markdown search.

Enable vector support manually if needed:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
ALTER TABLE "SupportDocChunk" ADD COLUMN IF NOT EXISTS embedding vector(384);
```

## Local setup

```bash
npm install
vercel env pull .env.development.local
npm run db:generate
npm run db:push
npm run db:seed
npm run db:seed:dashboard
npm run db:seed:docs
npm run dev
```

The app runs at `http://localhost:3000`.

If local commands need database access:

```bash
set -a; source ./.env.development.local; set +a
```

## Environment variables

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
```

Do not commit `.env.local`, `.env.development.local`, or production connection strings.

## Database commands

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run db:seed:dashboard
npm run db:seed:docs
npm run db:reset
```

## Verification commands

```bash
npm test
npm run lint
set -a; source ./.env.development.local; set +a; npm run build
```

## Current deployment

The take-home deployment uses:

```txt
Vercel → Next.js app
Neon → Postgres database
Vercel env vars → DATABASE_URL / DATABASE_URL_UNPOOLED
Vercel Analytics + Speed Insights → basic app telemetry
```

## AWS production deployment plan

A production AMP deployment could use:

```mermaid
flowchart LR
  A[Route 53] --> B[CloudFront]
  B --> C[AWS WAF]
  C --> D[ALB]
  D --> E[ECS Fargate Next.js service]
  E --> F[(RDS Postgres Multi-AZ)]
  E --> G[ElastiCache Redis]
  E --> H[Secrets Manager]
  E --> I[CloudWatch Logs / Metrics]
  J[GitHub Actions] --> K[ECR]
  K --> E
```

Production hardening would add auth/RBAC, payment provider webhooks, audit retention, rate limiting, structured logging, alerting, database backups, connection pooling, pgvector/OpenSearch for support retrieval, and multi-location permissions.

## MVP tradeoffs

- Mock CSR identity (`Bob Roberts`) instead of production authentication.
- Payment update/retry flows are demo-safe and do not call a real payment provider.
- Lane context is seeded/mock operational context rather than a real gate/kiosk integration.
- Mobile app is a companion demo route, not a production React Native app.
- Docs search uses local embeddings/pgvector with keyword fallback instead of a hosted LLM chatbot.
- Dashboard data is seeded for demo realism, not connected to production analytics events.

## What I would build next

1. Add real authentication and role-based CSR permissions.
2. Integrate a real payment provider with webhooks, retries, proration, refunds, and decline codes.
3. Connect lane sessions to real plate-reader/gate/kiosk events.
4. Add queue/worker processing for payment retry, plan updates, and notifications.
5. Add structured audit retention and compliance controls.
6. Add test coverage around all server actions and workflow state transitions.
7. Replace mock mobile route with real mobile-app status integration.
8. Add observability dashboards for CSR resolution time, blocked-wash volume, and recovered revenue.
