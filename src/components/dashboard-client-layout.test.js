import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const source = readFileSync(fileURLToPath(new URL("./dashboard-client.jsx", import.meta.url)), "utf8");

test("dashboard keeps global search above KPI cards and tabbed work areas", () => {
  const renderSource = source.slice(source.indexOf("return (\n    <MotionPanel>"));
  const searchIndex = renderSource.indexOf("DashboardSearch");
  const statsIndex = renderSource.indexOf("data?.stats");
  const tabsIndex = renderSource.indexOf("DashboardTabs");

  assert.ok(searchIndex !== -1, "DashboardSearch should exist");
  assert.ok(tabsIndex !== -1, "DashboardTabs should exist");
  assert.ok(searchIndex < statsIndex, "global search should render before KPI cards");
  assert.ok(statsIndex < tabsIndex, "KPI cards should render before the tab system");
  assert.match(source, /Customers needing attention/);
  assert.match(source, /Insights/);
});

test("dashboard tabs use Radix Tabs with the integrated line style", () => {
  assert.match(source, /@radix-ui\/react-tabs/);
  assert.match(source, /Tabs\.Root/);
  assert.match(source, /Tabs\.List/);
  assert.match(source, /Tabs\.Trigger/);
  assert.match(source, /data-\[state=active\]:border-primary/);
  assert.match(source, /data-\[state=active\]:text-foreground/);
});

test("KPI cards do not render cramped sparkline charts", () => {
  const statCardSource = source.slice(
    source.indexOf("function StatCard"),
    source.indexOf("function TimeframeControl"),
  );

  assert.doesNotMatch(statCardSource, /<Line/);
  assert.doesNotMatch(statCardSource, /trendLabels|trendValues/);
  assert.doesNotMatch(statCardSource, /grid-cols-\[1fr_86px\]/);
});

test("dashboard skeleton KPI cards keep loader rows inside the card bounds", () => {
  const skeletonSource = source.slice(
    source.indexOf("function DashboardSkeleton"),
    source.indexOf("function DashboardError"),
  );

  assert.doesNotMatch(skeletonSource, /className="h-24 /);
  assert.match(skeletonSource, /min-h-\[7\.75rem\]/);
});

test("dashboard customer search button is separate from the input shell", () => {
  const searchSource = source.slice(
    source.indexOf("function DashboardSearch"),
    source.indexOf("function DashboardCharts"),
  );
  const inputShellIndex = searchSource.indexOf("focus-within:ring-primary/10");
  const buttonIndex = searchSource.indexOf('type="submit"');

  assert.ok(inputShellIndex !== -1, "search input shell should preserve focus styling");
  assert.ok(buttonIndex !== -1, "search submit button should exist");
  assert.ok(buttonIndex > inputShellIndex, "search button should render after the input shell");
  assert.doesNotMatch(searchSource, /hidden h-9 rounded-lg bg-primary/);
});

test("dashboard customer search supports debounced fuzzy autocomplete", () => {
  const searchSource = source.slice(
    source.indexOf("function DashboardSearch"),
    source.indexOf("function DashboardCharts"),
  );

  assert.match(source, /useRouter/);
  assert.match(searchSource, /\/api\/customers\/search/);
  assert.match(searchSource, /setTimeout/);
  assert.match(searchSource, /role="listbox"/);
  assert.match(searchSource, /role="option"/);
  assert.match(searchSource, /ArrowDown/);
  assert.match(searchSource, /ArrowUp/);
  assert.match(searchSource, /event\.key === "Enter" && activeIndex >= 0/);
  assert.match(searchSource, /setIsComboboxOpen\(true\)/);
  assert.match(searchSource, /setSearchError/);
  assert.match(searchSource, /Searching customers\.\.\./);
  assert.match(searchSource, /setRememberedCustomerSearch/);
  assert.match(searchSource, /bg-primary\/15/);
  assert.match(searchSource, /hover:bg-primary\/10/);
  assert.match(searchSource, /Clear search/);
  assert.match(searchSource, /LoaderCircle/);
  assert.match(searchSource, /disabled=\{isSearching\}/);
  assert.match(searchSource, /htmlFor="dashboard-customer-search"/);
  assert.match(searchSource, /id="dashboard-customer-search"/);
  assert.match(searchSource, /onMouseDown=\{\(event\) =>/);
  assert.match(searchSource, /setActiveIndex\(nextResults\.length > 0 \? 0 : -1\)/);
  assert.match(searchSource, /data-search-action="open-results"/);
  assert.match(searchSource, /submitter\?\.dataset\?\.searchAction === "open-results" \? null : results\[activeIndex\]/);
  assert.doesNotMatch(searchSource, /<label className="grid gap-2">/);
  assert.match(searchSource, /returnQuery/);
  assert.doesNotMatch(searchSource, />Searching</);
});

test("dashboard insights use one shared timeframe control and larger chart cards", () => {
  const chartCardSource = source.slice(
    source.indexOf("function ChartCard"),
    source.indexOf("function DashboardSearch"),
  );
  const chartsSource = source.slice(
    source.indexOf("function DashboardCharts"),
    source.indexOf("function AttentionTable"),
  );
  const timeframeSelectCount = chartsSource.match(/<TimeframeControl/g)?.length || 0;

  assert.match(chartCardSource, /min-h-\[380px\]/);
  assert.match(chartCardSource, /h-\[300px\]/);
  assert.equal(timeframeSelectCount, 1);
  assert.match(chartsSource, /const \[timeframe, setTimeframe\]/);
  assert.doesNotMatch(chartsSource, /const \[timeframes, setTimeframes\]/);
  assert.doesNotMatch(chartsSource, /updateTimeframe/);
  assert.doesNotMatch(chartsSource, /compact/);
});
