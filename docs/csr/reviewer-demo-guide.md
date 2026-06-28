---
slug: reviewer-demo-guide
title: Reviewer demo guide
category: System Design
severity: Low
tags:
  - demo
  - reviewer
  - presentation
customer_phrases:
  - how should I review the app
  - demo script
  - reviewer walkthrough
---
# Reviewer demo guide

## Summary

This guide gives a reviewer a fast path through the deployed app and highlights where each take-home requirement is satisfied.

## Demo path 1: blocked wash / failed payment

1. Open `/csr/dashboard`.
2. Search `CZR4821`.
3. Open the customer profile.
4. Review the critical payment banner.
5. Review lane context and failed payment purchase history.
6. Update payment method or retry failed charge.
7. Confirm subscription and customer status are restored.
8. Review audit timeline.

## Demo path 2: lane context

1. Open `/csr/lane-context`.
2. Review active sessions, blocking issues, at-gate count, and cleared/in-queue count.
3. Filter by `Failed payment` or `Plate mismatch`.
4. Open the customer from the lane session.
5. Use the recommended support flow.

## Demo path 3: vehicle transfer

1. Search `new vehicle` or open Marcus Reed / Ben Wilson.
2. Review old and new vehicles.
3. Transfer subscription coverage.
4. Confirm audit event.

## Demo path 4: purchase question

1. Search `refund`, `coupon`, or `recent purchase`.
2. Open Alicia Brown or Harper Davis.
3. Review purchase history.
4. Add a support note if escalation is needed.

## Demo path 5: support docs

1. Open `/csr/docs`.
2. Search `customer says gate denied but app is active`.
3. Open the matching playbook.
4. Search `transfer subscription to new vehicle`.
5. Confirm the docs return source-of-truth remediation steps.

## Demo path 6: presentation

Open `/presentation` and use arrow keys to walk through the app narrative.
