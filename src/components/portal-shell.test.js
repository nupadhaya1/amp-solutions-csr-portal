import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const source = readFileSync(fileURLToPath(new URL("./portal-shell.js", import.meta.url)), "utf8");

test("portal navigation does not expose a separate smart search feature", () => {
  assert.doesNotMatch(source, /\/csr\/smart-search/);
  assert.doesNotMatch(source, /Smart search/);
  assert.doesNotMatch(source, /\bBrain\b/);
});
