---
slug: data-model-and-seeding
title: Data model and seeded demo data
category: System Design
severity: Low
tags:
  - data model
  - prisma
  - seed
  - database
customer_phrases:
  - what data is seeded
  - explain prisma models
  - show database model
---
# Data model and seeded demo data

![Data model](/docs/diagrams/data-model.svg)

## Summary

The data model centers on the customer and connects account details to vehicles, subscriptions, purchases, support notes, audit events, lane sessions, and searchable support playbooks.

## Main entities

- `Customer`: member ID, name, email, phone, account status, and home wash location.
- `Vehicle`: year, make, model, color, and unique license plate.
- `SubscriptionPlan`: plan name, description, monthly price, cleaning tier, and max vehicle capacity.
- `Subscription`: customer membership state, plan, status, start date, and next billing date.
- `SubscriptionVehicle`: coverage join table between subscriptions and vehicles.
- `Purchase`: membership payments, single washes, coupon redemptions, failed payments, and refunds.
- `SupportNote`: CSR notes attached to a customer.
- `AuditEvent`: CSR/system events used for compliance and review.
- `LaneSession`: active operational context for vehicles at the wash lane.
- `FaqArticle`: lightweight FAQ content.
- `SupportDoc` and `SupportDocChunk`: searchable Markdown playbooks and embedding chunks.

## Seed scripts

Run this for the full demo state:

```bash
npm run db:seed
npm run db:seed:dashboard
npm run db:seed:docs
```

`npm run db:seed` creates curated scenarios such as failed payment, cancellation, vehicle transfer, purchase/refund questions, paused subscription, multi-vehicle plan management, lane sessions, and FAQ articles.

`npm run db:seed:dashboard` adds generated customers and historical records so the dashboard has realistic trends, attention volume, revenue movement, pagination, and payment recovery events.

`npm run db:seed:docs` loads Markdown support playbooks, chunks them, embeds them locally, stores vectors in Postgres, and creates vector/trigram indexes when supported.

## Demo query examples

- `CZR4821`: unable-to-wash failed payment customer.
- `failed payment`: customers with billing blockers.
- `new vehicle`: vehicle transfer scenarios.
- `refund`: purchase/refund workflows.
- `FIX0203`: generated payment failure scenario.
- `plate mismatch`: lane context and transfer-support flow.
