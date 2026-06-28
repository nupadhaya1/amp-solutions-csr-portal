---
slug: recent-purchase-question
title: Question about a recent purchase
category: Purchases
severity: Medium
tags:
  - purchase history
  - receipt
  - transaction
  - single wash
customer_phrases:
  - I have a question about a recent purchase
  - what was this charge
  - can I get a receipt
---

# Question about a recent purchase

## Summary

Customers may ask about single washes, membership payments, coupon redemptions, refunds, or failed transactions.

## CSR remediation steps

1. Search and open the customer profile.
2. Go to purchase history.
3. Identify transaction by date, amount, type, status, and vehicle.
4. Explain whether it was a single wash, membership payment, coupon, refund, or failed transaction.
5. If the transaction failed, explain that it may appear in history but did not grant access.
6. Add a support note for confusion, refund request, or dispute.

## Portal fields to check

- `Purchase.type`
- `Purchase.status`
- `Purchase.amount`
- `Purchase.purchasedAt`
- Related vehicle or subscription

## Escalate if

- Customer disputes the charge.
- Purchase appears under the wrong customer.
- Duplicate charge is suspected.
- Refund needs manual approval.

## Customer-safe explanation

I found the transaction in purchase history. It shows the date, amount, type, and status, so I can explain what it was for and whether it successfully granted wash access.
