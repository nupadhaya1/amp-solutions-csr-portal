---
slug: project-overview
title: Project overview and requirement coverage
category: System Design
severity: Low
tags:
  - take-home
  - overview
  - requirements
  - csr portal
customer_phrases:
  - what does this project do
  - what did the take-home ask for
  - show me the app overview
---
# Project overview and requirement coverage

## Summary

AMP CSR Command Center is a full-stack support portal for resolving customer membership, billing, vehicle, subscription, and wash-access issues for AMP car wash memberships.

## Product goal

The portal is built around the real CSR call flow: search fast, diagnose clearly, act safely, and leave an audit trail. A CSR can find a customer by caller details or license plate, open a complete profile, inspect payment and subscription state, take a support action, and confirm that the customer history was updated.

## Take-home coverage

- View list of users: the `/csr/customers` page shows a paginated customer grid with summary stats.
- Quickly find and view a user: dashboard and customer search support name, phone, email, plate, plan, status, and support-language queries.
- View details for a user: the customer profile shows account information, contact details, home wash location, active vehicles, subscriptions, purchase history, support notes, and audit history.
- Edit account information: account edits are handled with validated server actions and audit events.
- View and edit vehicle subscriptions: CSRs can add vehicles, transfer coverage, change plans, and cancel memberships.
- Backend persistence: customer, vehicle, subscription, purchase, support note, audit, lane, FAQ, and support doc data persist in Postgres through Prisma.

## Added real-world AMP-style functionality

- Lane Context page for vehicles at gate, blocked, in queue, and plate mismatch states.
- Payment recovery workflow for customers blocked by failed recurring membership payments.
- Purchase history for single washes, membership payments, coupon redemptions, refunds, and failed charges.
- Recommended next steps that translate customer status into CSR action guidance.
- CSR Docs search backed by source-of-truth Markdown playbooks, local embeddings, and pgvector.
- Browser presentation and mobile companion routes for the take-home walkthrough.

## Demo links

- Deployed URL: `https://amp-csr-portal.nupadhaya.com`
- Presentation: `https://amp-csr-portal.nupadhaya.com/demo/presentation`
- System Design: `https://amp-csr-portal.nupadhaya.com/demo/systemDesign`
- GitHub: `https://github.com/nupadhaya1/amp-solutions-csr-portal`
