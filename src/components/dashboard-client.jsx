"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  CarFront,
  CreditCard,
  Grid2X2,
  LoaderCircle,
  RotateCcw,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

import { MotionPanel } from "@/components/motion-panel";
import {
  clearRememberedCustomerSearch,
  setRememberedCustomerSearch,
} from "@/lib/customer-search-session";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
);

const statIconMap = {
  "Active subscriptions": CarFront,
  "Monthly revenue": CreditCard,
  "Needs attention": AlertTriangle,
  "Total customers": UsersRound,
};

const chartTextColor = "#64748b";
const chartGridColor = "rgba(148, 163, 184, 0.22)";
const timeframeOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "6m", label: "Last 6 months" },
];
const statAccentMap = {
  "Total customers": {
    icon: "bg-accent/10 text-primary ring-accent/15",
    border: "border-accent/25",
    delta: "text-primary",
  },
  "Needs attention": {
    icon: "bg-red-50 text-red-700 ring-red-100",
    border: "border-red-200/80",
    delta: "text-red-700",
  },
  "Active subscriptions": {
    icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    border: "border-emerald-200/80",
    delta: "text-emerald-700",
  },
  "Monthly revenue": {
    icon: "bg-primary/10 text-primary ring-primary/15",
    border: "border-primary/20",
    delta: "text-primary",
  },
};

async function fetchDashboardSummary() {
  const response = await fetch("/api/dashboard");
  const payload = await response.json();

  if (!response.ok || payload.error) {
    throw new Error(payload.error || "Unable to load dashboard data.");
  }

  return payload.data;
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function percentChange(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function latestPair(values = []) {
  const compact = values.filter((value) => value !== null && value !== undefined);
  return {
    current: Number(compact.at(-1) || 0),
    previous: Number(compact.at(-2) || 0),
  };
}

function buildStatDeltas(charts) {
  const customerPair = latestPair(charts?.customerGrowth?.cumulativeCustomers);
  const attentionPair = latestPair(charts?.needsAttention?.values);
  const subscriptionPair = latestPair(charts?.subscriptionGrowth?.cumulativeSubscriptions);
  const revenuePair = latestPair(charts?.monthlyRevenue?.values);

  return {
    "Total customers": percentChange(customerPair.current, customerPair.previous),
    "Needs attention": percentChange(attentionPair.current, attentionPair.previous),
    "Active subscriptions": percentChange(subscriptionPair.current, subscriptionPair.previous),
    "Monthly revenue": percentChange(revenuePair.current, revenuePair.previous),
  };
}

function sliceSeries(series, timeframe) {
  const source = timeframe === "6m" ? series : series.daily || series;
  const count = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 6;

  return {
    ...source,
    labels: (source.labels || []).slice(-count),
    values: source.values ? source.values.slice(-count) : undefined,
    newCustomers: source.newCustomers ? source.newCustomers.slice(-count) : undefined,
    cumulativeCustomers: source.cumulativeCustomers ? source.cumulativeCustomers.slice(-count) : undefined,
    newSubscriptions: source.newSubscriptions ? source.newSubscriptions.slice(-count) : undefined,
    cumulativeSubscriptions: source.cumulativeSubscriptions ? source.cumulativeSubscriptions.slice(-count) : undefined,
    fixes: source.fixes ? source.fixes.slice(-count) : undefined,
    recoveredRevenue: source.recoveredRevenue ? source.recoveredRevenue.slice(-count) : undefined,
  };
}

function baseChartOptions({ stacked = false, moneyAxis = false } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        align: "center",
        position: "bottom",
        labels: {
          boxHeight: 8,
          boxWidth: 8,
          color: chartTextColor,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 12,
        titleColor: "#f8fafc",
        bodyColor: "#e2e8f0",
        callbacks: moneyAxis
          ? {
              label(context) {
                return `${context.dataset.label}: ${money(context.parsed.y)}`;
              },
            }
          : undefined,
      },
    },
    scales: {
      x: {
        stacked,
        border: { display: false },
        grid: { display: false },
        ticks: { color: chartTextColor, maxRotation: 0 },
      },
      y: {
        stacked,
        border: { display: false },
        grid: { color: chartGridColor },
        ticks: {
          color: chartTextColor,
          callback: moneyAxis ? (value) => money(value) : undefined,
        },
      },
    },
  };
}

function StatCard({ stat, delta = 0 }) {
  const Icon = statIconMap[stat.label] || Grid2X2;
  const accent = statAccentMap[stat.label] || statAccentMap["Total customers"];
  const isPositive = delta >= 0;
  const DeltaIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <article className={`group rounded-2xl border bg-card p-4 shadow-sm shadow-slate-200/70 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/80 ${accent.border}`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${accent.icon}`}>
          <Icon size={21} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold leading-none">{stat.value}</p>
          <p className="mt-1 text-xs font-medium text-muted">{stat.label}</p>
          <p className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${accent.delta}`}>
            <DeltaIcon size={13} aria-hidden="true" />
            {Math.abs(delta).toFixed(1)}% vs last month
          </p>
        </div>
      </div>
    </article>
  );
}

function TimeframeControl({ timeframe, onTimeframeChange }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <select
        className="h-9 rounded-lg border border-border bg-surface px-2 text-xs font-semibold outline-none focus:border-primary"
        onChange={(event) => onTimeframeChange(event.target.value)}
        value={timeframe}
      >
        {timeframeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ChartCard({ children, title }) {
  return (
    <section className="min-h-[380px] rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70">
      <div className="mb-3">
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <div className="h-[300px]">{children}</div>
    </section>
  );
}

function DashboardSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const trimmedQuery = query.trim();
  const canShowCombobox = trimmedQuery.length >= 2 && isComboboxOpen;
  const showResults = canShowCombobox && (isSearching || searchError || results.length > 0);

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");

      try {
        const params = new URLSearchParams({ q: trimmedQuery, limit: "6" });
        const response = await fetch(`/api/customers/search?${params}`, {
          signal: controller.signal,
        });
        const payload = await response.json();

        if (!response.ok || payload.error) {
          throw new Error(payload.error || "Unable to search customers.");
        }

        const nextResults = payload.data?.results || [];
        setResults(nextResults);
        setActiveIndex(nextResults.length > 0 ? 0 : -1);
      } catch (error) {
        if (error.name !== "AbortError") {
          setResults([]);
          setActiveIndex(-1);
          setSearchError("Unable to search customers.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [trimmedQuery]);

  function handleQueryChange(event) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    setRememberedCustomerSearch(nextQuery);
    setIsComboboxOpen(true);

    if (nextQuery.trim().length < 2) {
      setResults([]);
      setActiveIndex(-1);
      setIsSearching(false);
      setSearchError("");
    }
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
    setIsSearching(false);
    setSearchError("");
    setIsComboboxOpen(false);
    clearRememberedCustomerSearch();
  }

  function customerProfileHref(customer) {
    const params = new URLSearchParams();
    if (trimmedQuery) params.set("returnQuery", trimmedQuery);
    const suffix = params.toString() ? `?${params}` : "";
    return `/csr/customers/${customer.id}${suffix}`;
  }

  function openCustomer(customer) {
    setRememberedCustomerSearch(trimmedQuery);
    setIsComboboxOpen(false);
    router.push(customerProfileHref(customer));
  }

  function openCustomerResults() {
    const params = new URLSearchParams();
    if (trimmedQuery) params.set("q", trimmedQuery);
    const suffix = params.toString() ? `?${params}` : "";
    setRememberedCustomerSearch(trimmedQuery);
    setIsComboboxOpen(false);
    router.push(`/csr/customers${suffix}`);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const submitter = event.nativeEvent?.submitter;
    const selectedCustomer =
      submitter?.dataset?.searchAction === "open-results" ? null : results[activeIndex];

    if (selectedCustomer) {
      openCustomer(selectedCustomer);
      return;
    }

    openCustomerResults();
  }

  function handleKeyDown(event) {
    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsComboboxOpen(true);
      setActiveIndex((current) => (current + 1) % results.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsComboboxOpen(true);
      setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      openCustomer(results[activeIndex]);
    }

    if (event.key === "Escape") {
      setIsComboboxOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <form
      action="/csr/customers"
      className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-2">
        <label className="text-sm font-semibold" htmlFor="dashboard-customer-search">
          Search customers
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <div className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-surface px-4 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
              <Search className="shrink-0 text-muted" size={18} aria-hidden="true" />
              <input
                aria-activedescendant={activeIndex >= 0 ? `dashboard-customer-result-${activeIndex}` : undefined}
                aria-autocomplete="list"
                aria-controls="dashboard-customer-results"
                aria-expanded={showResults}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                id="dashboard-customer-search"
                name="q"
                onChange={handleQueryChange}
                onFocus={() => setIsComboboxOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Find by name, phone, plate, payment issue, or subscription status..."
                role="combobox"
                value={query}
              />
              {isSearching ? (
                <LoaderCircle className="shrink-0 animate-spin text-muted" size={16} aria-hidden="true" />
              ) : null}
              {query ? (
                <button
                  aria-label="Clear search"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-card hover:text-foreground"
                  onClick={clearSearch}
                  type="button"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              ) : null}
            </div>
            {showResults ? (
              <div
                className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-slate-200/80"
                id="dashboard-customer-results"
                role="listbox"
              >
                {isSearching ? (
                  <div className="px-4 py-3 text-sm font-semibold text-muted">Searching customers...</div>
                ) : searchError ? (
                  <div className="px-4 py-3 text-sm font-semibold text-critical">{searchError}</div>
                ) : (
                  results.map((customer, index) => (
                    <button
                      aria-selected={index === activeIndex}
                      className={`grid w-full gap-1 px-4 py-3 text-left transition ${
                        index === activeIndex
                          ? "bg-primary/15 text-foreground ring-1 ring-inset ring-primary/25"
                          : "hover:bg-primary/10 hover:text-foreground"
                      }`}
                      id={`dashboard-customer-result-${index}`}
                      key={customer.id}
                      onClick={() => openCustomer(customer)}
                      onFocus={() => setActiveIndex(index)}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        openCustomer(customer);
                      }}
                      role="option"
                      type="button"
                    >
                      <span className="font-semibold">{customer.fullName}</span>
                      <span className="text-xs text-muted">
                        {customer.primaryVehicle} · {customer.licensePlate || "No plate"}
                      </span>
                      <span className="text-xs text-muted">
                        {customer.phone} · {customer.subscriptionSummary}
                      </span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>
          <button
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100"
            data-search-action="open-results"
            disabled={isSearching}
            type="submit"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}

function DashboardCharts({ charts }) {
  const [timeframe, setTimeframe] = useState("6m");
  const rawRevenue = charts?.monthlyRevenue || { labels: [], values: [] };
  const rawCustomers = charts?.customerGrowth || { labels: [], cumulativeCustomers: [] };
  const rawSubscriptions = charts?.subscriptionGrowth || { cumulativeSubscriptions: [] };
  const rawNeedsAttention = charts?.needsAttention || { labels: [], values: [] };
  const rawFixImpact = charts?.csrFixImpact || { labels: [], fixes: [], recoveredRevenue: [] };
  const revenue = sliceSeries(rawRevenue, timeframe);
  const customers = sliceSeries(rawCustomers, timeframe);
  const subscriptions = sliceSeries(rawSubscriptions, timeframe);
  const needsAttention = sliceSeries(rawNeedsAttention, timeframe);
  const fixImpact = sliceSeries(rawFixImpact, timeframe);

  return (
    <section className="mt-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Insights</h2>
          <p className="mt-1 text-sm text-muted">One timeframe updates every dashboard chart.</p>
        </div>
        <TimeframeControl timeframe={timeframe} onTimeframeChange={setTimeframe} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Revenue over time">
          <Line
            data={{
              labels: revenue.labels,
              datasets: [
                {
                  label: "Membership revenue",
                  data: revenue.values,
                  borderColor: "#2563eb",
                  backgroundColor: "rgba(37, 99, 235, 0.14)",
                  borderWidth: 3,
                  fill: true,
                  pointRadius: 3,
                  tension: 0.35,
                },
              ],
            }}
            options={baseChartOptions({ moneyAxis: true })}
          />
        </ChartCard>

        <ChartCard title="Customers and subscriptions">
          <Line
            data={{
              labels: customers.labels,
              datasets: [
                {
                  label: "Customers",
                  data: customers.cumulativeCustomers,
                  borderColor: "#0f766e",
                  backgroundColor: "rgba(15, 118, 110, 0.12)",
                  borderWidth: 3,
                  fill: true,
                  pointRadius: 3,
                  tension: 0.32,
                },
                {
                  label: "Subscriptions",
                  data: subscriptions.cumulativeSubscriptions,
                  borderColor: "#7c3aed",
                  backgroundColor: "rgba(124, 58, 237, 0.08)",
                  borderWidth: 3,
                  fill: true,
                  pointRadius: 3,
                  tension: 0.32,
                },
              ],
            }}
            options={baseChartOptions()}
          />
        </ChartCard>

        <ChartCard title="Needs attention over time">
          <Bar
            data={{
              labels: needsAttention.labels,
              datasets: [
                {
                  label: "Payment and subscription issues",
                  data: needsAttention.values,
                  backgroundColor: "rgba(220, 38, 38, 0.72)",
                  borderRadius: 8,
                  maxBarThickness: 34,
                },
              ],
            }}
            options={baseChartOptions()}
          />
        </ChartCard>

        <ChartCard title="Bob Roberts fix impact">
          <Bar
            data={{
              labels: fixImpact.labels,
              datasets: [
                {
                  label: "Resolved payments",
                  data: fixImpact.fixes,
                  backgroundColor: "rgba(34, 197, 94, 0.76)",
                  borderRadius: 8,
                  maxBarThickness: 34,
                  yAxisID: "y",
                },
                {
                  label: "Recovered revenue",
                  data: fixImpact.recoveredRevenue,
                  backgroundColor: "rgba(14, 165, 233, 0.6)",
                  borderRadius: 8,
                  maxBarThickness: 34,
                  yAxisID: "y1",
                },
              ],
            }}
            options={{
              ...baseChartOptions(),
              scales: {
                ...baseChartOptions().scales,
                y1: {
                  position: "right",
                  border: { display: false },
                  grid: { drawOnChartArea: false },
                  ticks: {
                    color: chartTextColor,
                    callback: (value) => money(value),
                  },
                },
              },
            }}
          />
        </ChartCard>
      </div>
    </section>
  );
}

function AttentionTable({ customers }) {
  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-slate-200/70">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-critical-background text-critical">
            <AlertTriangle size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-semibold">Customers needing attention</h2>
            <p className="text-sm text-muted">Payment and subscription blockers requiring CSR review.</p>
          </div>
        </div>
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-primary"
          href="/csr/customers"
        >
          View all customers
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="border-b border-border bg-card text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Issue</th>
              <th className="px-5 py-3 font-semibold">Context</th>
              <th className="px-5 py-3 font-semibold">Priority</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-muted" colSpan={6}>
                  No overdue accounts are open.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr className="hover:bg-surface" key={customer.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-xs font-semibold text-primary-foreground shadow-sm">
                        {customer.initials}
                      </div>
                      <span className="font-semibold">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">Payment blocked wash access</td>
                  <td className="max-w-sm px-5 py-4 text-muted">{customer.context}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-critical-background px-3 py-1 text-xs font-semibold text-critical">
                      High
                    </span>
                  </td>
                  <td className="px-5 py-4">{customer.status}</td>
                  <td className="px-5 py-4">
                    <Link
                      className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
                      href={`/csr/customers/${customer.id}`}
                    >
                      View profile
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DashboardTabs({ activeTab, charts, customers, onTabChange }) {
  return (
    <Tabs.Root className="mt-5" onValueChange={onTabChange} value={activeTab}>
      <Tabs.List className="flex border-b border-border" aria-label="Dashboard sections">
        <Tabs.Trigger
          className="-mb-px inline-flex h-11 items-center justify-center whitespace-nowrap border-b-2 border-transparent px-4 text-sm font-semibold text-muted transition hover:text-primary data-[state=active]:border-primary data-[state=active]:text-foreground"
          value="attention"
        >
          Customers needing attention
        </Tabs.Trigger>
        <Tabs.Trigger
          className="-mb-px inline-flex h-11 items-center justify-center whitespace-nowrap border-b-2 border-transparent px-4 text-sm font-semibold text-muted transition hover:text-primary data-[state=active]:border-primary data-[state=active]:text-foreground"
          value="insights"
        >
          Insights
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="attention">
        <AttentionTable customers={customers} />
      </Tabs.Content>
      <Tabs.Content value="insights">
        <DashboardCharts charts={charts} />
      </Tabs.Content>
    </Tabs.Root>
  );
}

function DashboardSkeleton() {
  return (
    <MotionPanel>
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            className="min-h-[7.75rem] rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70"
            key={item}
          >
            <LoaderCircle className="animate-spin text-muted" size={24} aria-hidden="true" />
            <div className="mt-4 h-6 w-24 rounded bg-surface-muted" />
            <div className="mt-3 h-4 w-32 rounded bg-surface-muted" />
          </div>
        ))}
      </section>
    </MotionPanel>
  );
}

function DashboardError({ message, onRetry }) {
  return (
    <MotionPanel>
      <section className="rounded-3xl border border-critical/30 bg-critical-background p-8 shadow-sm shadow-red-100/70">
        <AlertTriangle className="text-critical" size={32} aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-semibold">Dashboard data could not load</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{message}</p>
        <button
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
          onClick={onRetry}
          type="button"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Retry
        </button>
      </section>
    </MotionPanel>
  );
}

export function DashboardClient({ view = "dashboard" }) {
  const [activeTab, setActiveTab] = useState(view === "insights" ? "insights" : "attention");
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const statDeltas = useMemo(() => buildStatDeltas(data?.charts), [data?.charts]);

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <DashboardError
        message={error.message || "Try refreshing the dashboard."}
        onRetry={refetch}
      />
    );
  }

  return (
    <MotionPanel>
      <DashboardSearch />
      <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {(data?.stats || []).map((stat) => (
          <StatCard
            delta={statDeltas[stat.label]}
            key={stat.label}
            stat={stat}
          />
        ))}
      </section>
      <DashboardTabs
        activeTab={activeTab}
        charts={data?.charts}
        customers={data?.criticalCustomers || []}
        onTabChange={setActiveTab}
      />
    </MotionPanel>
  );
}
