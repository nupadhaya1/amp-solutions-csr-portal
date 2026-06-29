import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { dedupeBestDocResults, scoreKeywordMatch, validateDocsSearchParams } from "./search-docs.js";

const searchDocsSource = readFileSync(fileURLToPath(new URL("./search-docs.js", import.meta.url)), "utf8");

test("validates docs search params", () => {
  assert.deepEqual(validateDocsSearchParams({ q: " customer cannot wash ", limit: "30" }), {
    ok: true,
    value: { q: "customer cannot wash", limit: 20 },
  });

  assert.equal(validateDocsSearchParams({ q: "", limit: "8" }).ok, false);
});

test("dedupes search rows by slug and keeps highest score", () => {
  const results = dedupeBestDocResults([
    { slug: "billing", score: 0.4, chunkIndex: 0 },
    { slug: "billing", score: 0.7, chunkIndex: 1 },
    { slug: "vehicle", score: 0.5, chunkIndex: 0 },
  ]);

  assert.deepEqual(results.map((result) => `${result.slug}:${result.chunkIndex}`), [
    "billing:1",
    "vehicle:0",
  ]);
});

test("scores direct keyword matches in operational fields", () => {
  const score = scoreKeywordMatch("card expired wash blocked", {
    title: "Update payment method",
    tags: "[\"update card\",\"billing\"]",
    customerPhrases: "[\"my card expired\"]",
    summary: "Update the payment method when a card expires.",
    severity: "Critical",
  });

  assert.ok(score > 0.1);
});

test("database docs search excludes system design docs from CSR docs results", () => {
  assert.match(searchDocsSource, /category: \{ not: systemDesignCategory \}/);
  assert.match(searchDocsSource, /AND d\.category <> \$3/);
});
