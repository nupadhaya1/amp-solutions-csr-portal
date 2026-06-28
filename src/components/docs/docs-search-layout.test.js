import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const pageSource = readFileSync(
  fileURLToPath(new URL("../../app/csr/docs/page.jsx", import.meta.url)),
  "utf8",
);
const workspaceSource = readFileSync(
  fileURLToPath(new URL("./docs-search-workspace.jsx", import.meta.url)),
  "utf8",
);
const shellSource = readFileSync(fileURLToPath(new URL("../portal-shell.js", import.meta.url)), "utf8");

test("docs page delegates interactive search to a client workspace", () => {
  assert.match(pageSource, /DocsSearchWorkspace/);
  assert.match(pageSource, /searchSupportDocs/);
});

test("docs search keeps prompts above the search field and button outside input shell", () => {
  assert.match(workspaceSource, /DocsSuggestedSearches/);
  assert.match(workspaceSource, /search-input-shell/);
  assert.match(workspaceSource, /search-submit-button/);
  assert.match(workspaceSource, /LoaderCircle/);
  assert.ok(workspaceSource.indexOf("DocsSuggestedSearches") < workspaceSource.indexOf("search-input-shell"));
  assert.ok(workspaceSource.indexOf("search-input-shell") < workspaceSource.indexOf("search-submit-button"));
  assert.doesNotMatch(workspaceSource, />Searching</);
});

test("docs search updates only results through API fetch", () => {
  assert.match(workspaceSource, /fetch\(`\/api\/docs\/search/);
  assert.match(workspaceSource, /setResults/);
  assert.match(workspaceSource, /results-panel/);
  assert.doesNotMatch(workspaceSource, /DocsArticleNav/);
  assert.doesNotMatch(workspaceSource, /xl:grid-cols-\[minmax\(0,1fr\)_320px\]/);
});

test("docs article index renders as nested subtabs under the Docs sidebar item", () => {
  assert.match(shellSource, /docs-subtabs/);
  assert.match(shellSource, /activeDocSlug/);
  assert.match(shellSource, /supportDocCatalog/);
  assert.match(shellSource, /pathname\.startsWith\("\/csr\/docs"\)/);
  assert.match(shellSource, /categoryTone/);
  assert.match(shellSource, /details/);
  assert.match(shellSource, /open=\{!activeDocSlug/);
  assert.doesNotMatch(shellSource, /defaultOpen/);
  assert.doesNotMatch(shellSource, /DocsArticleNav/);
});

test("CSR sidebar can collapse to an icon rail", () => {
  assert.match(shellSource, /sidebarCollapsed/);
  assert.match(shellSource, /aria-label=\{sidebarCollapsed \? "Expand sidebar" : "Collapse sidebar"\}/);
  assert.match(shellSource, /lg:grid-cols-\[76px_1fr\]/);
  assert.match(shellSource, /lg:grid-cols-\[272px_1fr\]/);
  assert.match(shellSource, /title=\{item\.label\}/);
  assert.match(shellSource, /mt-auto flex h-8 w-8/);
  assert.match(shellSource, /!sidebarCollapsed && isDocsItem && showingDocs/);
});
