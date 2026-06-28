---
slug: failed-membership-payment
title: Failed recurring membership payment
category: Billing
severity: High
tags:
  - failed payment
  - billing
  - overdue
  - card declined
customer_phrases:
  - why is my payment failing
  - my card was declined
  - why is my account overdue
---

# Failed recurring membership payment

## Summary

A failed recurring membership payment can move a subscription into `OVERDUE` status and block washes for the covered vehicle.

## CSR remediation steps

1. Verify the customer's identity.
2. Inspect account and subscription status.
3. Find the latest membership payment in purchase history.
4. Confirm payment amount, date, status, and related vehicle.
5. Explain the failed payment without collecting raw card details in notes.
6. Have the customer update payment details through the secure payment flow.
7. Retry payment only if the app currently supports a retry action.
8. Add a support note.

## Portal fields to check

- `Purchase.type`
- `Purchase.status`
- `Purchase.amount`
- `Purchase.purchasedAt`
- `Subscription.status`
- `Subscription.nextBillingDate`

## Escalate if

- Payment processor status conflicts with portal status.
- Customer says the bank approved the transaction but AMP shows failed.
- Retry failures continue after a valid card update.
- Duplicate subscriptions or duplicate charges are visible.

## Customer-safe explanation

The latest membership payment did not go through, so the system marked the membership as overdue. Please update the payment method, and then we can retry or wait for billing to clear the payment.
