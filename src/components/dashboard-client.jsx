"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  CarFront,
  CreditCard,
  Grid2X2,
  LoaderCircle,
  RotateCcw,
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
        align: "start",
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

function StatCard({ stat }) {
  const Icon = statIconMap[stat.label] || Grid2X2;

  return (
    <article className="group rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-slate-200/80">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-primary ring-1 ring-primary/10 group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon size={32} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-3xl font-semibold">{stat.value}</p>
          <p className="text-sm font-medium text-muted">{stat.label}</p>
        </div>
      </div>
    </article>
  );
}

function ChartCard({ children, eyebrow, title }) {
  return (
    <section className="min-h-[360px] rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-semibold">{title}</h2>
      </div>
      <div className="h-[270px]">{children}</div>
    </section>
  );
}

function DashboardCharts({ charts }) {
  const revenue = charts?.monthlyRevenue || { labels: [], values: [] };
  const customers = charts?.customerGrowth || { labels: [], cumulativeCustomers: [] };
  const subscriptions = charts?.subscriptionGrowth || { cumulativeSubscriptions: [] };
  const needsAttention = charts?.needsAttention || { labels: [], values: [] };
  const fixImpact = charts?.csrFixImpact || { labels: [], fixes: [], recoveredRevenue: [] };

  return (
    <section className="mt-6 grid gap-5 xl:grid-cols-2">
      <ChartCard eyebrow="Revenue" title="Revenue over time">
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

      <ChartCard eyebrow="Growth" title="Customers and subscriptions">
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

      <ChartCard eyebrow="Queue" title="Needs attention over time">
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

      <ChartCard eyebrow="CSR impact" title="Bob Roberts fix impact">
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
    <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-slate-200/70">
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

function DashboardSkeleton() {
  return (
    <MotionPanel>
      <header className="rounded-3xl border border-border bg-card px-6 py-7 shadow-sm shadow-slate-200/70">
        <div className="h-4 w-20 rounded bg-surface-muted" />
        <div className="mt-4 h-10 w-full max-w-sm rounded bg-surface-muted" />
        <div className="mt-4 h-5 w-full max-w-xl rounded bg-surface-muted" />
      </header>
      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            className="h-36 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70"
            key={item}
          >
            <LoaderCircle className="animate-spin text-muted" size={24} aria-hidden="true" />
            <div className="mt-8 h-8 w-24 rounded bg-surface-muted" />
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

export function DashboardClient() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

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
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {(data?.stats || []).map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>
      <DashboardCharts charts={data?.charts} />
      <AttentionTable customers={data?.criticalCustomers || []} />
    </MotionPanel>
  );
}
