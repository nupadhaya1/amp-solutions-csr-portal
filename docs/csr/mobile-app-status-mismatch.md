---
slug: mobile-app-status-mismatch
title: Mobile app status does not match CSR portal
category: Mobile App
severity: High
tags:
  - app active
  - status mismatch
  - gate denied
  - stale app
customer_phrases:
  - my app says active
  - the app says I can wash
  - your system says something different
---

# Mobile app status does not match CSR portal

## Summary

The mobile app may show stale or cached status while the backend and CSR portal show the actual subscription state.

## CSR remediation steps

1. Open the customer profile in the CSR portal.
2. Review actual subscription and payment status.
3. Compare app claim to backend status.
4. Ask customer to refresh or reopen the app if appropriate.
5. Resolve the underlying issue if portal shows overdue, paused, cancelled, or uncovered vehicle.
6. Add support note documenting the mismatch.
7. Escalate if portal appears wrong or mismatch persists.

## Portal fields to check

- Subscription status
- Customer status
- Latest membership payment
- Vehicle coverage
- Audit events

## Escalate if

- CSR portal shows active and gate still denies access.
- App and portal remain inconsistent after refresh.
- Multiple customers report mismatch.

## Customer-safe explanation

The app may be showing a cached status. I am checking the backend account status in the CSR portal, which determines whether the membership is currently valid for wash access.
