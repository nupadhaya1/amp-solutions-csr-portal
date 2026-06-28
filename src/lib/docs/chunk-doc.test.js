import assert from "node:assert/strict";
import test from "node:test";

import { chunkSupportDoc } from "./chunk-doc.js";

test("chunks docs with searchable metadata context", () => {
  const chunks = chunkSupportDoc({
    title: "Transfer subscription to a new vehicle",
    category: "Vehicle Management",
    severity: "High",
    tags: ["transfer subscription", "new vehicle"],
    customerPhrases: ["I purchased a new vehicle"],
    body: `# Transfer subscription to a new vehicle

## Summary

Move active coverage from the old vehicle to the new vehicle.

## CSR remediation steps

1. Verify identity.
2. Add the new vehicle.
3. Transfer coverage.`,
  });

  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].chunkIndex, 0);
  assert.equal(chunks[0].heading, "Summary");
  assert.match(chunks[0].content, /Title: Transfer subscription to a new vehicle/);
  assert.match(chunks[0].content, /Category: Vehicle Management/);
  assert.match(chunks[0].content, /Tags: transfer subscription, new vehicle/);
  assert.match(chunks[0].content, /Customer phrases: I purchased a new vehicle/);
  assert.ok(chunks[0].tokenCount > 0);
});
