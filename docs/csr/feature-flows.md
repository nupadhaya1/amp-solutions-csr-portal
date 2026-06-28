---
slug: feature-flows
title: CSR feature flows
category: System Design
severity: Low
tags:
  - flows
  - csr actions
  - support workflow
customer_phrases:
  - show support flows
  - how does csr resolve issues
  - demo the main flows
---
# CSR feature flows

![Support flow](/docs/diagrams/support-flow.svg)

## Summary

The app is organized around the highest-frequency CSR flows from the take-home: unable to wash, purchase question, vehicle transfer, cancellation, account update, and plan change.

## Unable to wash because payment failed

1. Search by phone, name, email, or plate.
2. Open the customer profile.
3. See overdue account status, failed membership payment, purchase history, and lane context.
4. Update payment method or retry failed charge.
5. Restore subscription/customer status to active.
6. Clear failed-payment lane context to in-queue.
7. Add support note or review generated audit event.

## Vehicle transfer

1. Search for customer.
2. Review current vehicle coverage.
3. Add a new vehicle if it is not already present.
4. Transfer coverage from the old vehicle to the new vehicle.
5. Verify the subscription vehicle association changed.
6. Confirm audit event was created.

## Purchase or refund question

1. Open the customer profile.
2. Review purchase history.
3. Check type, status, amount, date, vehicle, and linked subscription plan.
4. Explain membership payments, single washes, coupon redemptions, failed charges, or refunds.
5. Add support note if follow-up is needed.

## Cancellation

1. Open the profile.
2. Review active or overdue subscription.
3. Open cancellation flow.
4. Capture optional cancellation reason.
5. Mark subscription as cancelled.
6. Create audit event.

## Account update

1. Open edit account dialog.
2. Validate name, email, and phone.
3. Save account update.
4. Create audit event with updated fields.

## Plan change

1. Confirm active or overdue subscription.
2. Select new plan.
3. Update subscription plan.
4. Create audit event.
5. Future production version should also handle proration and plan-capacity conflicts.
