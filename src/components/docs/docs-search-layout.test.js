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

test("docs article renderer supports Markdown image figures", () => {
  const articleSource = readFileSync(fileURLToPath(new URL("./docs-article.jsx", import.meta.url)), "utf8");

  assert.match(articleSource, /imageMatch/);
  assert.match(articleSource, /trimmed\.match\(\/\^!\\\[\(\.\*\?\)\\\]\\\(\(\.\*\?\)\\\)\$\/\)/);
  assert.match(articleSource, /<figure className="my-5 overflow-hidden rounded-2xl border border-border bg-surface p-3"/);
  assert.match(articleSource, /<img alt=\{alt\} className="w-full rounded-xl" src=\{src\} \/>/);
  assert.match(articleSource, /<figcaption className="mt-2 text-xs font-semibold text-muted">/);
});

test("docs search keeps prompts above the search field and button outside input shell", () => {
  assert.match(workspaceSource, /DocsSuggestedSearches/);
  assert.match(workspaceSource, /search-input-shell/);
  assert.match(workspaceSource, /search-submit-button/);
  assert.match(workspaceSource, /LoaderCircle/);
  assert.match(workspaceSource, /Clear search/);
  assert.match(workspaceSource, /function clearSearch/);
  assert.match(workspaceSource, /<X size=\{16\} aria-hidden="true" \/>/);
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

test("docs search runs while typing with a debounce", () => {
  assert.match(workspaceSource, /useEffect/);
  assert.match(workspaceSource, /window\.setTimeout/);
  assert.match(workspaceSource, /300/);
  assert.match(workspaceSource, /runSearch\(query, \{ syncInput: false \}\)/);
  assert.match(workspaceSource, /didAutoSearchMountRef/);
  assert.match(workspaceSource, /searchRequestRef/);
  assert.match(workspaceSource, /searchRequestRef\.current !== requestId/);
});

test("docs article index renders as nested subtabs under the Docs sidebar item", () => {
  assert.match(shellSource, /docs-subtabs/);
  assert.match(shellSource, /activeDocSlug/);
  assert.match(shellSource, /supportDocCatalog/);
  assert.match(shellSource, /pathname\.startsWith\("\/csr\/docs"\)/);
  assert.match(shellSource, /categoryTone/);
  assert.match(shellSource, /details/);
  assert.match(shellSource, /open=\{isDocCategoryOpen\(category\)\}/);
  assert.doesNotMatch(shellSource, /defaultOpen/);
  assert.doesNotMatch(shellSource, /DocsArticleNav/);
});

test("docs sidebar subtabs fill available height and can expand or collapse all categories", () => {
  assert.match(shellSource, /flex min-h-0 flex-1 flex-col gap-2/);
  assert.match(shellSource, /grid min-h-0 flex-1 grid-rows-\[auto_minmax\(0,1fr\)\] gap-2/);
  assert.match(shellSource, /docs-subtabs ml-5 min-h-0 overflow-y-auto/);
  assert.doesNotMatch(shellSource, /max-h-\[44vh\]/);
  assert.match(shellSource, /docCategoryOverrides/);
  assert.match(shellSource, /allDocsExpanded/);
  assert.match(shellSource, /Collapse all/);
  assert.match(shellSource, /Expand all/);
  assert.match(shellSource, /docs-nav-item flex min-h-11 items-center rounded-2xl/);
  assert.match(shellSource, /docs-expand-toggle/);
  assert.match(shellSource, /aria-label=\{allDocsExpanded \? "Collapse all docs categories" : "Expand all docs categories"\}/);
  assert.ok(shellSource.indexOf("docs-nav-item") < shellSource.indexOf("docs-expand-toggle"));
  assert.ok(shellSource.indexOf("docs-expand-toggle") < shellSource.indexOf("docs-subtabs"));
  assert.doesNotMatch(shellSource, />\s*Categories\s*</);
  assert.match(shellSource, /toggleDocCategory/);
  assert.match(shellSource, /setAllDocCategories/);
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
