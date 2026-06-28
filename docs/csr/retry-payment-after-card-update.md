---
slug: retry-payment-after-card-update
title: Retry payment after card update
category: Billing
severity: High
tags:
  - retry payment
  - failed payment
  - overdue
customer_phrases:
  - can you retry my payment
  - I updated my card
  - make the membership active again
---

# Retry payment after card update

## Summary

After the customer updates their payment method, a CSR may retry the failed payment if the portal supports it.

## CSR remediation steps

1. Confirm the customer used the secure payment update flow.
2. Open the affected subscription.
3. Confirm the latest failed `MEMBERSHIP_PAYMENT`.
4. Use the retry payment action if present.
5. Refresh subscription and purchase history.
6. Confirm whether the subscription changed from `OVERDUE` to `ACTIVE`.
7. Add a support note and check audit timeline.

## Portal fields to check

- Latest failed membership payment
- Subscription status before retry
- Subscription status after retry
- Payment retry audit event

## Escalate if

- Retry action errors.
- Retry succeeds but subscription remains overdue.
- Payment fails repeatedly with no clear reason.

## Customer-safe explanation

Now that your payment method is updated, I can retry the failed membership payment if the account supports it. If it clears, your membership should return to active status.
