"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
    icon: "bg-blue-50 text-blue-700 ring-blue-100",
    border: "border-blue-200/80",
    delta: "text-blue-700",
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
    icon: "bg-sky-50 text-sky-700 ring-sky-100",
    border: "border-sky-200/80",
    delta: "text-sky-700",
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

function ChartCard({ children, title, timeframe, onTimeframeChange, compact = false }) {
  return (
    <section className={`${compact ? "min-h-[260px]" : "min-h-[300px]"} rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70`}>
      <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        <TimeframeControl timeframe={timeframe} onTimeframeChange={onTimeframeChange} />
      </div>
      <div className={compact ? "h-[190px]" : "h-[218px]"}>{children}</div>
    </section>
  );
}

function DashboardSearch() {
  return (
    <form
      action="/csr/customers"
      className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70"
    >
      <label className="grid gap-2">
        <span className="text-sm font-semibold">Search customers</span>
        <div className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-surface px-4 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
          <Search className="text-muted" size={18} aria-hidden="true" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            name="q"
            placeholder="Find by name, phone, plate, payment issue, or subscription status..."
          />
          <button
            className="hidden h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95 sm:inline-flex sm:items-center"
            type="submit"
          >
            Search
          </button>
        </div>
      </label>
    </form>
  );
}

function DashboardCharts({ charts }) {
  const [timeframes, setTimeframes] = useState({
    revenue: "6m",
    growth: "6m",
    attention: "6m",
    impact: "6m",
  });
  const rawRevenue = charts?.monthlyRevenue || { labels: [], values: [] };
  const rawCustomers = charts?.customerGrowth || { labels: [], cumulativeCustomers: [] };
  const rawSubscriptions = charts?.subscriptionGrowth || { cumulativeSubscriptions: [] };
  const rawNeedsAttention = charts?.needsAttention || { labels: [], values: [] };
  const rawFixImpact = charts?.csrFixImpact || { labels: [], fixes: [], recoveredRevenue: [] };
  const revenue = sliceSeries(rawRevenue, timeframes.revenue);
  const customers = sliceSeries(rawCustomers, timeframes.growth);
  const subscriptions = sliceSeries(rawSubscriptions, timeframes.growth);
  const needsAttention = sliceSeries(rawNeedsAttention, timeframes.attention);
  const fixImpact = sliceSeries(rawFixImpact, timeframes.impact);
  const updateTimeframe = (key) => (value) =>
    setTimeframes((current) => ({ ...current, [key]: value }));

  return (
    <section className="mt-4 grid gap-4 xl:grid-cols-2">
      <ChartCard
        compact
        onTimeframeChange={updateTimeframe("revenue")}
        timeframe={timeframes.revenue}
        title="Revenue over time"
      >
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

      <ChartCard
        compact
        onTimeframeChange={updateTimeframe("growth")}
        timeframe={timeframes.growth}
        title="Customers and subscriptions"
      >
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

      <ChartCard
        onTimeframeChange={updateTimeframe("attention")}
        timeframe={timeframes.attention}
        title="Needs attention over time"
      >
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

      <ChartCard
        onTimeframeChange={updateTimeframe("impact")}
        timeframe={timeframes.impact}
        title="Bob Roberts fix impact"
      >
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
            className="h-24 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70"
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
