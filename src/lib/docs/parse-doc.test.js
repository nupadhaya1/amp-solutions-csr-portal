import assert from "node:assert/strict";
import test from "node:test";

import { parseSupportDocMarkdown } from "./parse-doc.js";

const markdown = `---
slug: unable-to-wash-overdue-payment
title: Customer cannot get a wash because membership is overdue
category: Service Access
severity: Critical
tags:
  - unable to wash
  - failed payment
customer_phrases:
  - I can't get a wash
  - the gate won't open
---

# Customer cannot get a wash because membership is overdue

## Summary

The customer's membership is overdue after a failed payment.

## CSR remediation steps

1. Open the customer profile.
2. Review payment history.
`;

test("parses support doc frontmatter and body", () => {
  const parsed = parseSupportDocMarkdown(markdown);

  assert.equal(parsed.slug, "unable-to-wash-overdue-payment");
  assert.equal(parsed.title, "Customer cannot get a wash because membership is overdue");
  assert.equal(parsed.category, "Service Access");
  assert.equal(parsed.severity, "Critical");
  assert.deepEqual(parsed.tags, ["unable to wash", "failed payment"]);
  assert.deepEqual(parsed.customerPhrases, ["I can't get a wash", "the gate won't open"]);
  assert.equal(parsed.summary, "The customer's membership is overdue after a failed payment.");
  assert.match(parsed.body, /CSR remediation steps/);
});

test("rejects docs without required metadata", () => {
  assert.throws(
    () => parseSupportDocMarkdown("---\nslug: missing-title\n---\n\nBody"),
    /missing title/,
  );
});
