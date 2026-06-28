import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./customer-summary-card.jsx", import.meta.url), "utf8");

test("member ID copy control is an icon-only button with a visible icon", () => {
  assert.match(source, /aria-label="Copy member ID"/);
  assert.match(source, /<Copy aria-hidden="true" className="text-primary"/);
  assert.match(source, /<span className="sr-only">Copy member ID<\/span>/);
  assert.doesNotMatch(source, /tone="secondary"/);
});
