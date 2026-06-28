---
slug: update-payment-method
title: Update payment method
category: Billing
severity: Medium
tags:
  - update card
  - payment method
  - billing
customer_phrases:
  - I need to update my card
  - my card expired
  - change payment method
---

# Update payment method

## Summary

CSRs should never collect full raw card details in notes. Customers must update payment information through an approved secure flow.

## CSR remediation steps

1. Confirm the customer account.
2. Explain that payment information must be updated securely.
3. Direct the customer to the mobile app or approved payment UI.
4. Refresh the customer profile after update.
5. If an overdue subscription remains, retry payment only if supported.
6. Add a note that payment update was requested or completed, without card numbers.

## Portal fields to check

- Customer contact details
- Current subscription status
- Latest payment status
- Audit event for payment update or retry

## Escalate if

- Customer cannot access the payment update flow.
- The payment UI fails.
- The updated card still fails repeatedly.

## Customer-safe explanation

For security, I cannot take or store full card details here. Please update your card through the secure payment flow, and then we can confirm whether your membership is back in good standing.
