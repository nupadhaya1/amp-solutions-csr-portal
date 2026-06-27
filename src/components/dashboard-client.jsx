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

import { MotionPanel } from "@/components/motion-panel";

const statIconMap = {
  "Active subscriptions": CarFront,
  "Monthly revenue": CreditCard,
  "Needs attention": AlertTriangle,
  "Total customers": UsersRound,
};

async function fetchDashboardSummary() {
  const response = await fetch("/api/dashboard");
  const payload = await response.json();

  if (!response.ok || payload.error) {
    throw new Error(payload.error || "Unable to load dashboard data.");
  }

  return payload.data;
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

function AttentionList({ customers }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-slate-200/70">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-surface p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-critical-background text-critical">
            <AlertTriangle size={20} aria-hidden="true" />
          </span>
          <h2 className="font-semibold">Accounts needing attention</h2>
        </div>
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-primary"
          href="/csr/customers"
        >
          View all customers
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {customers.length === 0 ? (
          <p className="p-5 text-sm text-muted">No overdue accounts are open.</p>
        ) : (
          customers.map((customer) => (
            <Link
              className="flex flex-col gap-4 p-5 hover:bg-surface sm:flex-row sm:items-center sm:justify-between"
              href={`/csr/customers/${customer.id}`}
              key={customer.id}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-sm font-semibold text-primary-foreground shadow-sm">
                  {customer.initials}
                </div>
                <div>
                  <p className="font-semibold">{customer.name}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{customer.context}</p>
                </div>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-critical bg-critical-background px-3 py-1 text-sm font-semibold text-critical">
                <span className="h-2 w-2 rounded-full bg-critical" />
                {customer.status}
              </span>
            </Link>
          ))
        )}
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
      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div
            className="h-44 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70"
            key={item}
          >
            <LoaderCircle className="animate-spin text-muted" size={24} aria-hidden="true" />
            <div className="mt-10 h-8 w-24 rounded bg-surface-muted" />
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
      <header className="rounded-3xl border border-border bg-card px-6 py-7 shadow-sm shadow-slate-200/70">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, Bob</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Here&apos;s what&apos;s happening across AMP memberships today.
        </p>
      </header>
      <section className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {(data?.stats || []).map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>
      <div className="mt-4">
        <AttentionList customers={data?.criticalCustomers || []} />
      </div>
    </MotionPanel>
  );
}
