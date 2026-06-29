import assert from "node:assert/strict";
import test from "node:test";

import { getStaticSupportDocBySlug, listStaticSupportDocs, searchStaticSupportDocs } from "./static-docs.js";

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

test("keeps system design markdown out of the CSR docs surface by default", async () => {
  const docs = await listStaticSupportDocs();
  const systemDesignDoc = await getStaticSupportDocBySlug("project-overview");
  const demoSystemDesignDoc = await getStaticSupportDocBySlug("project-overview", {
    includeSystemDesign: true,
  });
  const results = await searchStaticSupportDocs("system architecture cloudfront route 53", { limit: 5 });

  assert.equal(systemDesignDoc, null);
  assert.equal(demoSystemDesignDoc.slug, "project-overview");
  assert.ok(docs.every((doc) => doc.category !== "System Design"));
  assert.ok(results.every((doc) => doc.category !== "System Design"));
});
