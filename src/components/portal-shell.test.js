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

test("demo link sits left when expanded and above when collapsed", () => {
  const controlsSource = source.slice(source.indexOf("Open demo hub"), source.indexOf("</button>", source.indexOf("Open demo hub")));

  assert.match(controlsSource, /Open demo hub/);
  assert.match(controlsSource, /Collapse sidebar|Expand sidebar/);
  assert.match(source, /flex items-center gap-2/);
  assert.match(source, /sidebarCollapsed \? "flex-col self-center" : "self-end"/);
});
