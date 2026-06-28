import assert from "node:assert/strict";
import test from "node:test";

import { getStaticSupportDocBySlug, searchStaticSupportDocs } from "./static-docs.js";

test("searches checked-in support docs when database search is unavailable", async () => {
  const results = await searchStaticSupportDocs("customer cannot get a wash gate denied", {
    limit: 3,
  });

  assert.equal(results[0].slug, "unable-to-wash-overdue-payment");
  assert.equal(results[0].matchType, "markdown");
  assert.ok(results[0].score > 0);
});

test("loads checked-in support doc detail by slug", async () => {
  const doc = await getStaticSupportDocBySlug("transfer-subscription-new-vehicle");

  assert.equal(doc.title, "Transfer subscription to a new vehicle");
  assert.deepEqual(doc.tags.slice(0, 2), ["transfer subscription", "new vehicle"]);
});
