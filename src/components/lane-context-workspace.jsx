"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CarFront,
  CheckCircle2,
  CircleDot,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";

import {
  formatLaneDetectedTime,
  getLaneCustomerHref,
  getLaneIssueResolution,
  getLaneSeverityTone,
  getLaneStatusLabel,
  summarizeLaneSessions,
} from "@/lib/domain/lane-context";

const filterOptions = [
  { label: "All", value: "all" },
  { label: "At gate", value: "at_gate" },
  { label: "Blocked", value: "blocked" },
  { label: "In queue", value: "in_queue" },
  { label: "Plate mismatch", value: "plate_mismatch" },
  { label: "Failed payment", value: "failed_payment" },
];

const resolverDocs = {
  FAILED_PAYMENT: "/csr/docs/unable-to-wash-overdue-payment",
  PLATE_MISMATCH: "/csr/docs/transfer-subscription-new-vehicle",
  UNKNOWN_VEHICLE: "/csr/docs/add-new-vehicle",
};

const toneClasses = {
  critical: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-accent/20 bg-accent/10 text-primary",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

function statTone(tone) {
  return {
    primary: "bg-primary/10 text-primary ring-primary/15",
    critical: "bg-red-50 text-red-700 ring-red-100",
    warning: "bg-amber-50 text-amber-700 ring-amber-100",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  }[tone];
}

function SummaryCard({ icon: Icon, label, tone, value }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${statTone(tone)}`}>
          <Icon size={19} aria-hidden="true" />
        </span>
        <div>
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        </div>
      </div>
    </article>
  );
}

function matchedVehicleLabel(session) {
  if (!session.vehicle) return "No matched vehicle";
  return `${session.vehicle.year} ${session.vehicle.make} ${session.vehicle.model}`;
}

function customerName(session) {
  if (!session.customer) return "Unknown customer";
  return `${session.customer.firstName} ${session.customer.lastName}`;
}

function matchesFilter(session, filter) {
  if (filter === "at_gate") return session.status === "AT_GATE";
  if (filter === "blocked") return session.status === "BLOCKED";
  if (filter === "in_queue") return session.status === "IN_QUEUE";
  if (filter === "plate_mismatch") return session.issueCode === "PLATE_MISMATCH";
  if (filter === "failed_payment") return session.issueCode === "FAILED_PAYMENT";
  return true;
}

function filterSessions(sessions, { filter, plate }) {
  const normalizedPlate = String(plate || "").trim().toLowerCase();

  return sessions.filter((session) => {
    if (!matchesFilter(session, filter)) return false;
    if (!normalizedPlate) return true;
    return String(session.detectedPlate || "").toLowerCase().includes(normalizedPlate);
  });
}

function filterCustomerSessions(sessions, customerId) {
  if (!customerId) return sessions;
  return sessions.filter((session) => session.customerId === customerId);
}

function updateLaneContextUrl({ customerId, filter, plate }) {
  const params = new URLSearchParams();
  if (customerId) params.set("customerId", customerId);
  if (filter && filter !== "all") params.set("filter", filter);
  if (plate) params.set("plate", plate);

  const query = params.toString();
  window.history.pushState(null, "", query ? `/csr/lane-context?${query}` : "/csr/lane-context");
}

function LaneSessionCard({ session }) {
  const statusLabel = getLaneStatusLabel(session.status);
  const tone = getLaneSeverityTone(session.issueSeverity);
  const issue = getLaneIssueResolution(session.issueCode);
  const customerHref = getLaneCustomerHref(session);

  return (
    <article className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Lane Context</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">{session.detectedPlate}</h2>
        </div>
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
          {statusLabel}
        </span>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Matched vehicle</p>
          <p className="mt-1 font-medium">{matchedVehicleLabel(session)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Customer</p>
          <p className="mt-1 font-medium">{customerName(session)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Location</p>
          <p className="mt-1 font-medium">{session.locationName}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Lane</p>
          <p className="mt-1 font-medium">{session.laneName}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Last detected</p>
          <p className="mt-1 font-medium">{formatLaneDetectedTime(session.detectedAt)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Confidence</p>
          <p className="mt-1 font-medium">
            {session.confidence ? `${Math.round(session.confidence * 100)}%` : "Not available"}
          </p>
        </div>
      </div>

      <div className={`rounded-xl border px-4 py-3 text-sm ${toneClasses[tone]}`}>
        <p className="font-semibold">{issue.summary}</p>
        <p className="mt-1">{issue.recommendedAction}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
          href={customerHref}
        >
          {session.customerId ? "View customer" : "Search customer"}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
        {session.issueCode === "FAILED_PAYMENT" ? (
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:border-primary hover:text-primary"
            href={customerHref}
          >
            Update payment / Retry charge
          </Link>
        ) : null}
        {session.issueCode === "PLATE_MISMATCH" ? (
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:border-primary hover:text-primary"
            href={customerHref}
          >
            Transfer subscription
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function ResultsSkeleton() {
  return (
    <>
      {[0, 1, 2].map((item) => (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70" key={item}>
          <div className="h-5 w-24 rounded bg-surface-muted" />
          <div className="mt-4 h-7 w-32 rounded bg-surface-muted" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="h-4 rounded bg-surface-muted" />
            <div className="h-4 rounded bg-surface-muted" />
            <div className="h-4 rounded bg-surface-muted" />
            <div className="h-4 rounded bg-surface-muted" />
          </div>
        </div>
      ))}
    </>
  );
}

export function LaneContextWorkspace({
  initialCustomerId = "",
  initialFilter = "all",
  initialPlate = "",
  sessions = [],
}) {
  const scopedSessions = useMemo(
    () => filterCustomerSessions(sessions, initialCustomerId),
    [initialCustomerId, sessions],
  );
  const [filter, setFilter] = useState(initialFilter);
  const [plateInput, setPlateInput] = useState(initialPlate);
  const [activePlate, setActivePlate] = useState(initialPlate);
  const [isFiltering, setIsFiltering] = useState(false);
  const didMountRef = useRef(false);
  const summary = summarizeLaneSessions(scopedSessions);
  const visibleSessions = useMemo(
    () => filterSessions(scopedSessions, { filter, plate: activePlate }),
    [activePlate, filter, scopedSessions],
  );

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return undefined;
    }

    setIsFiltering(true);

    const searchDelay = window.setTimeout(() => {
      const normalizedPlate = plateInput.trim().replace(/\s+/g, " ");
      setActivePlate(normalizedPlate);
      updateLaneContextUrl({ customerId: initialCustomerId, filter, plate: normalizedPlate });
      setIsFiltering(false);
    }, 250);

    return () => window.clearTimeout(searchDelay);
  }, [filter, initialCustomerId, plateInput]);

  function clearSearch() {
    setPlateInput("");
    setActivePlate("");
    setIsFiltering(false);
    updateLaneContextUrl({ customerId: initialCustomerId, filter, plate: "" });
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Operations</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Live Lane Context</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              {initialCustomerId
                ? "Operational view of this customer's active AMP wash lane context."
                : "Operational view of vehicles currently moving through AMP wash lanes."}
            </p>
          </div>
          <label className="flex min-h-11 min-w-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
            <Search size={17} className="text-muted" aria-hidden="true" />
            <input
              className="min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-muted"
              onChange={(event) => setPlateInput(event.target.value)}
              placeholder="Search detected plate"
              value={plateInput}
            />
            {isFiltering ? (
              <LoaderCircle className="shrink-0 animate-spin text-muted" size={16} aria-hidden="true" />
            ) : null}
            {plateInput ? (
              <button
                aria-label="Clear detected plate search"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-card hover:text-foreground"
                onClick={clearSearch}
                type="button"
              >
                <X size={16} aria-hidden="true" />
              </button>
            ) : null}
          </label>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={CarFront} label="Active sessions" tone="primary" value={summary.activeSessions} />
        <SummaryCard icon={AlertTriangle} label="Blocking issues" tone="critical" value={summary.blockingIssues} />
        <SummaryCard icon={CircleDot} label="At gate" tone="warning" value={summary.atGate} />
        <SummaryCard icon={CheckCircle2} label="Cleared/in queue" tone="success" value={summary.clearedInQueue} />
      </section>

      <section className="rounded-2xl border border-border bg-card p-3 shadow-sm shadow-slate-200/70">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const selected = option.value === filter;

            return (
              <button
                className={`inline-flex min-h-10 items-center rounded-xl px-4 text-sm font-semibold transition ${
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface text-foreground/80 hover:bg-primary/10 hover:text-primary"
                }`}
                key={option.value}
                onClick={() => setFilter(option.value)}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-busy={isFiltering} className="grid gap-4 xl:grid-cols-3">
        {isFiltering ? (
          <ResultsSkeleton />
        ) : (
          visibleSessions.map((session) => <LaneSessionCard key={session.id} session={session} />)
        )}
        {!isFiltering && visibleSessions.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm shadow-slate-200/70 xl:col-span-3">
            <CarFront className="mx-auto text-muted" size={36} aria-hidden="true" />
            <h2 className="mt-3 font-semibold">No lane sessions match this view</h2>
            <p className="mt-2 text-sm text-muted">Clear the filter or search for one of the seeded detected plates.</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70">
        <h2 className="text-lg font-semibold tracking-tight">How to resolve lane issues</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {["FAILED_PAYMENT", "PLATE_MISMATCH", "UNKNOWN_VEHICLE"].map((issueCode) => {
            const issue = getLaneIssueResolution(issueCode);
            return (
                  <Link
                    className="rounded-xl border border-border bg-surface p-4 transition hover:border-primary/40 hover:bg-primary/5"
                    href={resolverDocs[issueCode]}
                    key={issueCode}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                <p className="text-sm font-semibold">{issue.summary}</p>
                <p className="mt-2 text-sm text-muted">{issue.recommendedAction}</p>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Open CSR docs
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
