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
