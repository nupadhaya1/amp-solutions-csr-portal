---
slug: unable-to-wash-overdue-payment
title: Customer cannot get a wash because membership is overdue
category: Service Access
severity: Critical
tags:
  - unable to wash
  - gate denied
  - overdue
  - failed payment
customer_phrases:
  - I can't get a wash
  - the gate won't open
  - my membership is not working
  - my app says active but I was denied
---

# Customer cannot get a wash because membership is overdue

## Summary

The most common reason a customer cannot get a wash is that their membership subscription is `OVERDUE` after a failed recurring membership payment. Wash access should remain blocked until the payment issue is resolved.

## CSR remediation steps

1. Search for the customer by phone, email, name, or license plate.
2. Open the customer profile.
3. Check account status, subscription status, and the affected vehicle.
4. Review purchase history for the latest `MEMBERSHIP_PAYMENT`.
5. If the latest payment is `FAILED` and the subscription is `OVERDUE`, explain that billing must clear before access is restored.
6. Direct the customer to the approved payment update flow.
7. Retry payment only if the portal supports it.
8. Add a support note with vehicle, subscription, payment status, and explanation given.

## Portal fields to check

- `Customer.status`
- `Subscription.status`
- `Subscription.nextBillingDate`
- `Vehicle.licensePlate`
- `Purchase.type = MEMBERSHIP_PAYMENT`
- `Purchase.status = FAILED`

## Escalate if

- Payment shows successful externally but the portal still shows overdue.
- There is no failed payment but the gate still denies access.
- The mobile app and CSR portal disagree after refresh.
- Multiple customers are affected at the same location.

## Customer-safe explanation

Your membership is currently showing as overdue because the latest membership payment failed. That can block wash access. Once the payment method is updated and the billing issue clears, access should be restored.
