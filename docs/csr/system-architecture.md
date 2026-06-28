---
slug: system-architecture
title: System architecture
category: System Design
severity: Low
tags:
  - architecture
  - nextjs
  - prisma
  - postgres
customer_phrases:
  - how does the app work
  - explain the architecture
  - what is the system design
---
# System architecture

![Current architecture](/docs/diagrams/current-architecture.svg)

## Summary

The MVP uses a simple full-stack architecture: Next.js App Router for the UI, server actions and API routes for mutations/search, domain view models for support-specific logic, Prisma for data access, and Postgres/Neon for persistence.

## Runtime flow

- CSR browser renders the dashboard, customer grid, profile, lane context, docs, and presentation routes.
- Server Components fetch customer and support data where possible.
- Client workspaces handle interactive search, tabs, filters, dialogs, and presentation navigation.
- Server actions handle account edits, vehicle creation, payment recovery, plan changes, vehicle transfer, cancellation, and support notes.
- API routes support dashboard data, customer search, customer summary fetches, and docs search.
- Domain view models shape raw database records into CSR-friendly cards, badges, recommendations, and summaries.
- Prisma persists customer, subscription, purchase, support note, audit event, lane session, FAQ, and support doc records.

## Why this architecture fits the take-home

- It satisfies the requirement for both frontend and backend implementation.
- It keeps the mutation boundary easy to inspect in a code review.
- It persists data rather than relying on local state.
- It makes support workflows feel realistic without overbuilding payment, auth, or gate integrations.

## Important boundaries

- Payment provider calls are mocked.
- Lane sessions are seeded operational context.
- CSR identity is mocked as `Bob Roberts`.
- Search is deterministic/local for the MVP, with a clear pgvector upgrade path.
