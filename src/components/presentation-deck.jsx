"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Brain,
  CarFront,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Database,
  FileClock,
  KeyRound,
  Monitor,
  Phone,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const stack = ["Next.js", "React", "Prisma", "Postgres/Neon", "Tailwind", "Server Actions", "pgvector", "MiniLM"];

const requirements = [
  "View list of users",
  "Quickly find and view user details",
  "View account info, active vehicle subscriptions, and purchase history",
  "Edit account information",
  "View/edit vehicle subscriptions",
  "Add vehicle",
  "Transfer subscription coverage",
  "Cancel/change plan",
  "Persist data on backend",
  "Helpful extras: lane context, docs search, recommended next steps",
];

const scaleItems = [
  "Auth + RBAC for CSR permissions",
  "Real payment webhooks",
  "Lane/kiosk event ingestion",
  "CloudWatch logs and alarms",
  "RDS backups and connection pooling",
  "Queue workers for retries and notifications",
];

const tradeoffs = [
  "Mock CSR identity instead of real auth",
  "No real payment processor",
  "Seeded lane context rather than real gate/kiosk integration",
  "Mobile app is a demo companion",
  "Dashboard data is seeded",
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function SlideShell({ children, eyebrow, title, subtitle }) {
  return (
    <section className="grid min-h-[calc(100vh-132px)] content-center px-5 py-7 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-7">
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
          ) : null}
          <h1 className="mt-2 max-w-5xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 max-w-4xl text-lg leading-8 text-muted">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

function Pill({ children, tone = "neutral" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold",
        tone === "primary"
          ? "border-primary/20 bg-primary/5 text-primary"
          : "border-border bg-card text-muted",
      )}
    >
      {children}
    </span>
  );
}

function MockPhone({ children, label = "Customer mobile view", size = "default" }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
        <Smartphone size={16} aria-hidden="true" />
        {label}
      </div>
      <div
        className={cn(
          "w-full rounded-[2.25rem] border border-slate-300 bg-slate-950 p-3 shadow-2xl shadow-slate-300/60",
          size === "compact" ? "max-w-[260px]" : "mx-auto max-w-[300px]",
        )}
      >
        <div className="rounded-[1.8rem] bg-surface p-4">
          <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-slate-300" />
          <div
            className={cn(
              "rounded-[1.35rem] bg-card p-4 shadow-inner",
              size === "compact" ? "min-h-[400px]" : "min-h-[430px]",
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function LivePortalFrame({ caption, large = false, path = "/" }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
        <Monitor size={16} aria-hidden="true" />
        Live CSR portal
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-slate-300/50">
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-critical/70" />
            <span className="h-3 w-3 rounded-full bg-warning/70" />
            <span className="h-3 w-3 rounded-full bg-success/70" />
          </div>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted">
            {path}
          </span>
        </div>
        <div className={cn("relative bg-surface", large ? "h-[620px]" : "h-[500px]")}>
          <div className="absolute left-4 top-4 z-0 rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted">
            Loading live route...
          </div>
          <iframe
            className="relative z-10 h-full w-full bg-background"
            src={path}
            title={`Live CSR portal frame ${path}`}
          />
        </div>
      </div>
      {caption ? <p className="mt-3 text-sm leading-6 text-muted">{caption}</p> : null}
    </div>
  );
}

function DiagramCard({ alt, caption, src }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70">
      <img alt={alt} className="w-full rounded-2xl border border-border bg-surface" src={src} />
      {caption ? <p className="mt-3 text-sm leading-6 text-muted">{caption}</p> : null}
    </div>
  );
}

function FlowStep({ icon: Icon, label }) {
  return (
    <div className="flex min-w-[150px] flex-1 items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-primary">
        <Icon size={19} aria-hidden="true" />
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

function ProblemFlow() {
  const steps = [
    { icon: Phone, label: "Customer problem" },
    { icon: Search, label: "CSR lookup" },
    { icon: ShieldCheck, label: "Diagnosis" },
    { icon: Workflow, label: "Action" },
    { icon: FileClock, label: "Audit trail" },
  ];

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70">
      <div className="flex flex-wrap items-center gap-3">
        {steps.map((step, index) => (
          <div className="contents" key={step.label}>
            <FlowStep {...step} />
            {index < steps.length - 1 ? (
              <ArrowRight className="hidden text-muted xl:block" size={20} aria-hidden="true" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScenarioSlide({ caption, children, framePath, note, phoneTitle, title, subtitle }) {
  return (
    <section className="grid min-h-[calc(100vh-132px)] content-center px-5 py-4 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-3 flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Scenario</p>
          <h1 className="min-w-0 text-3xl font-semibold tracking-tight text-foreground lg:whitespace-nowrap">
            {title}
          </h1>
          {subtitle ? <p className="text-sm font-medium text-muted">{subtitle}</p> : null}
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <MockPhone label={phoneTitle} size="compact">{children}</MockPhone>
        <div className="grid gap-4">
          <LivePortalFrame caption={caption} large path={framePath} />
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-sm font-medium leading-6 text-foreground">
            {note}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

function PhoneHeader({ children }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">AMP Wash</p>
        <h2 className="text-xl font-semibold">{children}</h2>
      </div>
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <CarFront size={19} aria-hidden="true" />
      </span>
    </div>
  );
}

function BlockedWashPhone() {
  return (
    <div>
      <PhoneHeader>Gate check-in</PhoneHeader>
      <div className="rounded-2xl border border-critical/30 bg-critical-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-critical">Wash blocked</p>
        <p className="mt-2 text-lg font-semibold">Membership payment failed</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Your unlimited plan needs payment before the gate can approve this wash.
        </p>
      </div>
      <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Vehicle</span>
          <span className="font-semibold">Honda Civic</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Plate</span>
          <span className="font-semibold">CZR4821</span>
        </div>
      </div>
      <button className="mt-5 h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
        Call support
      </button>
    </div>
  );
}

function VehicleTransferPhone() {
  return (
    <div>
      <PhoneHeader>Vehicles</PhoneHeader>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-success">New vehicle added</p>
        <p className="mt-2 text-lg font-semibold">2024 Subaru Outback</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Customer request: Move my membership to my new car.
        </p>
      </div>
      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-primary">
            <CarFront size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold">Current covered car</p>
            <p className="text-sm text-muted">2019 Toyota Camry</p>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm font-semibold text-primary">
        Transfer coverage requested
      </div>
    </div>
  );
}

function BillingPhone() {
  return (
    <div>
      <PhoneHeader>Billing</PhoneHeader>
      <div className="grid gap-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Unlimited Wash</p>
            <p className="font-semibold">$29.99</p>
          </div>
          <p className="mt-2 text-sm text-muted">Receipt · Jun 20, 2026</p>
        </div>
        <div className="rounded-2xl border border-critical/30 bg-critical-background p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-critical">Failed charge</p>
            <p className="font-semibold text-critical">$29.99</p>
          </div>
          <p className="mt-2 text-sm text-muted">Card declined · Jun 26, 2026</p>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Question</p>
        <p className="mt-2 text-sm leading-6">
          Why was I charged, and why is my membership blocked?
        </p>
      </div>
      <div className="mt-4 rounded-2xl border border-success/30 bg-success-background p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-success">Payment update</p>
        <p className="mt-2 text-sm font-semibold text-success">New card ending 1111 validated</p>
      </div>
    </div>
  );
}

function LaneContextPhone() {
  return (
    <div>
      <PhoneHeader>Lane status</PhoneHeader>
      <div className="grid gap-3">
        <div className="rounded-2xl border border-critical/30 bg-critical-background p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-critical">At gate</p>
          <p className="mt-2 text-lg font-semibold">Payment blocker</p>
          <p className="mt-2 text-sm leading-6 text-muted">Vehicle is identified, but membership approval is blocked.</p>
        </div>
        <div className="rounded-2xl border border-warning/30 bg-warning-background p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-warning">Plate mismatch</p>
          <p className="mt-2 text-sm font-semibold">Coverage may need transfer</p>
        </div>
        <div className="rounded-2xl border border-success/30 bg-success-background p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-success">Cleared</p>
          <p className="mt-2 text-sm font-semibold">Ready to queue after remediation</p>
        </div>
      </div>
    </div>
  );
}

function ArchitectureDiagram() {
  const nodes = [
    { icon: Monitor, label: "Browser" },
    { icon: Workflow, label: "Next.js App Router / Server Components" },
    { icon: KeyRound, label: "Server Actions + Domain Logic" },
    { icon: Database, label: "Prisma ORM" },
    { icon: Database, label: "Neon Postgres" },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm shadow-slate-200/70">
        <div className="grid gap-3">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <div key={node.label}>
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-card text-primary">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <p className="font-semibold">{node.label}</p>
                </div>
                {index < nodes.length - 1 ? (
                  <div className="ml-9 h-7 border-l-2 border-dashed border-primary/30" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid gap-3">
        {[
          ["Fuse.js search", Search],
          ["Local semantic search / TF-IDF smart search", Brain],
          ["Audit events", FileClock],
          ["Seeded demo data", ClipboardList],
        ].map(([label, Icon]) => (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70" key={label}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-muted text-primary">
                <Icon size={19} aria-hidden="true" />
              </span>
              <p className="font-semibold">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChecklistGrid({ items }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70"
          key={item}
        >
          <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={20} aria-hidden="true" />
          <p className="text-sm font-semibold leading-6">{item}</p>
        </div>
      ))}
    </div>
  );
}

function IntroSlide() {
  return (
    <SlideShell
      eyebrow="Intro"
      title="AMP CSR Command Center"
      subtitle="A full-stack support portal for resolving car wash membership, payment, vehicle, lane, and subscription issues."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="rounded-3xl border border-border bg-card p-7 shadow-sm shadow-slate-200/70">
          <div className="flex flex-wrap gap-2">
            {stack.map((item) => (
              <Pill key={item} tone="primary">{item}</Pill>
            ))}
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Search fast", Search],
              ["Diagnose clearly", ShieldCheck],
              ["Act safely", BadgeCheck],
            ].map(([label, Icon]) => (
              <div className="rounded-2xl border border-border bg-surface p-4" key={label}>
                <Icon className="text-primary" size={24} aria-hidden="true" />
                <p className="mt-4 font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-primary/20 bg-primary p-7 text-primary-foreground shadow-xl shadow-blue-200/70">
          <Sparkles size={30} aria-hidden="true" />
          <p className="mt-8 text-2xl font-semibold leading-9">
            Built around the real CSR call flow: find the member, understand the blocker,
            take the action, and leave a trace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              ["Open portal", "/csr/dashboard"],
              ["Open docs", "/csr/docs"],
              ["Lane context", "/csr/lane-context"],
            ].map(([label, href]) => (
              <Link
                className="rounded-xl bg-primary-foreground px-4 py-3 text-sm font-semibold text-primary"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

function ProblemSlide() {
  return (
    <SlideShell
      eyebrow="Problem statement"
      title="Customers call when a membership issue blocks a normal wash experience."
      subtitle="The CSR needs account context, vehicle context, payment context, subscription actions, and notes without jumping between tools."
    >
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="grid gap-3">
          {[
            "Cannot get a wash because payment failed / account is overdue",
            "Bought a new vehicle and need coverage transferred",
            "Have a question about a purchase or membership charge",
            "Want to cancel or change their plan",
          ].map((item) => (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70" key={item}>
              <p className="text-sm font-semibold leading-6">{item}</p>
            </div>
          ))}
        </div>
        <DiagramCard
          alt="Support flow"
          caption="The app keeps the call flow visible: search, diagnose, act, audit, and confirm."
          src="/docs/diagrams/support-flow.svg"
        />
      </div>
    </SlideShell>
  );
}

function MvpSlide() {
  return (
    <SlideShell
      eyebrow="MVP coverage"
      title="The demo covers the required CSR workflow end to end."
      subtitle="The portal keeps the high-value actions inside the customer profile so subscription and billing context stays attached to the caller."
    >
      <ChecklistGrid items={requirements} />
    </SlideShell>
  );
}

function DocsSearchSlide() {
  return (
    <SlideShell
      eyebrow="Docs"
      title="Searchable support playbooks turn tribal knowledge into source-of-truth guidance."
      subtitle="CSRs can search natural support scenarios and open remediation steps without leaving the portal."
    >
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
        <LivePortalFrame
          large
          path="/csr/docs?q=customer%20says%20gate%20denied%20but%20app%20is%20active"
        />
        <div className="grid gap-4">
          <DiagramCard
            alt="Semantic search"
            caption="This is deterministic source-of-truth retrieval with vector ranking, keyword fallback, and static Markdown fallback."
            src="/docs/diagrams/semantic-search.svg"
          />
          <div className="flex flex-wrap gap-2">
            {["Markdown source of truth", "MiniLM local embeddings", "pgvector + keyword fallback"].map((item) => (
              <Pill key={item} tone="primary">{item}</Pill>
            ))}
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

function CurrentArchitectureSlide() {
  return (
    <SlideShell
      eyebrow="Architecture"
      title="A simple full-stack path from browser action to persisted audit event."
      subtitle="The implementation keeps UI, server actions, domain logic, and Prisma data access easy to inspect."
    >
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <DiagramCard alt="Current architecture" src="/docs/diagrams/current-architecture.svg" />
        <div className="grid gap-3">
          {[
            "Server actions own mutations",
            "View models shape CSR-friendly data",
            "Prisma persists support state",
            "Docs search uses local embeddings and pgvector",
          ].map((item) => (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70" key={item}>
              <p className="text-sm font-semibold leading-6">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

function DataModelSlide() {
  return (
    <SlideShell
      eyebrow="Data model"
      title="The customer record connects account, vehicle, payment, lane, and support context."
      subtitle="The schema is centered on the entities a CSR actually needs during a call."
    >
      <div className="grid gap-5">
        <DiagramCard alt="Data model" src="/docs/diagrams/data-model.svg" />
        <div className="flex flex-wrap gap-2">
          {["Customer", "Vehicle", "Subscription", "Purchase", "SupportNote", "AuditEvent", "LaneSession", "SupportDoc"].map((item) => (
            <Pill key={item}>{item}</Pill>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

function ScaleSlide() {
  return (
    <SlideShell
      eyebrow="Production"
      title="The MVP can move cleanly from Vercel/Neon to an AWS production architecture."
      subtitle="The same boundaries map to CDN, WAF, containers, RDS, secrets, logs, and CI/CD."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        <DiagramCard alt="AWS production deployment" src="/docs/diagrams/aws-production.svg" />
        <div className="grid gap-3">
          {scaleItems.map((item) => (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70" key={item}>
              <p className="text-sm font-semibold leading-6">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

function TradeoffsSlide() {
  return (
    <SlideShell
      eyebrow="Tradeoffs / next steps"
      title="The take-home stays focused on the CSR workflow, not production integrations."
      subtitle="These are deliberate MVP boundaries and the next pieces I would harden first."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm shadow-slate-200/70">
          <h2 className="text-xl font-semibold">MVP tradeoffs</h2>
          <div className="mt-5 grid gap-3">
            {tradeoffs.map((item) => (
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4" key={item}>
                <ArrowRight className="mt-0.5 shrink-0 text-primary" size={18} aria-hidden="true" />
                <p className="text-sm font-semibold leading-6">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm shadow-slate-200/70">
          <h2 className="text-xl font-semibold">Next hardening steps</h2>
          <div className="mt-5 grid gap-3">
            {[
              "Auth/RBAC",
              "Real payments and webhooks",
              "Production lane event stream",
              "Stronger server-action authorization",
              "More workflow state-transition tests",
              "Observability dashboards",
            ].map((item) => (
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4" key={item}>
                <CheckCircle2 className="mt-0.5 shrink-0 text-success" size={18} aria-hidden="true" />
                <p className="text-sm font-semibold leading-6">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-5 rounded-3xl border border-primary/20 bg-primary/5 p-5 text-center text-xl font-semibold text-primary">
        Search fast. Diagnose clearly. Act safely. Leave an audit trail.
      </div>
    </SlideShell>
  );
}

function ClosingSlide() {
  return (
    <SlideShell
      eyebrow="Closing"
      title="Built for the CSR call flow"
      subtitle="Search fast, diagnose clearly, act safely, and leave an audit trail."
    >
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm shadow-slate-200/70">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Search fast", Search],
            ["Diagnose clearly", Brain],
            ["Act safely", ShieldCheck],
            ["Audit trail", FileClock],
          ].map(([label, Icon]) => (
            <div className="rounded-2xl border border-border bg-surface p-5 text-center" key={label}>
              <Icon className="mx-auto text-primary" size={28} aria-hidden="true" />
              <p className="mt-4 font-semibold">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-muted">AMP CSR Command Center</p>
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            href="/csr/dashboard"
          >
            Open portal
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </SlideShell>
  );
}

function createSlides() {
  return [
    { id: "intro", label: "Intro", render: () => <IntroSlide /> },
    { id: "problem", label: "Problem", render: () => <ProblemSlide /> },
    { id: "mvp", label: "MVP coverage", render: () => <MvpSlide /> },
    {
      id: "blocked-wash",
      label: "Blocked wash",
      render: () => (
        <ScenarioSlide
          caption="Search for the overdue demo customer or license plate CZR4821, then open the profile."
          framePath="/csr/customers?q=CZR4821"
          note="CSR searches by license plate, opens the profile, sees the overdue subscription, failed payment, lane context, and purchase history, then updates payment or retries the charge."
          phoneTitle="Customer mobile view"
          title="Unable to get a wash"
          subtitle="The customer is blocked at the gate because the membership payment failed."
        >
          <BlockedWashPhone />
        </ScenarioSlide>
      ),
    },
    {
      id: "lane-context",
      label: "Lane context",
      render: () => (
        <ScenarioSlide
          caption="CSR sees vehicles at gate, blocked, in queue, cleared, or needing plate/coverage attention."
          framePath="/csr/lane-context"
          note="Lane sessions link directly back to the customer profile and recommended remediation flow."
          phoneTitle="Operational lane view"
          title="The portal now includes operational context from the wash lane."
          subtitle="This mirrors the real-world attendant workflow: vehicles can be at gate, blocked, in queue, or cleared."
        >
          <LaneContextPhone />
        </ScenarioSlide>
      ),
    },
    {
      id: "vehicle-transfer",
      label: "Vehicle transfer",
      render: () => (
        <ScenarioSlide
          caption="CSR opens the member profile, confirms vehicles, and transfers subscription coverage."
          framePath="/csr/customers?q=new%20vehicle"
          note="Vehicle and subscription actions stay on the profile so coverage changes are made with full account context."
          phoneTitle="Customer mobile view"
          title="New vehicle transfer"
          subtitle="A member bought a new vehicle and wants the existing membership moved."
        >
          <VehicleTransferPhone />
        </ScenarioSlide>
      ),
    },
    {
      id: "billing",
      label: "Billing",
      render: () => (
        <ScenarioSlide
          caption="CSR reviews purchase history, subscription status, support notes, and audit timeline."
          framePath="/csr/customers?q=refund"
          note="The purchase history card closes the take-home requirement around recent purchase questions."
          phoneTitle="Customer billing view"
          title="Purchase history is visible inside the customer profile."
          subtitle="The CSR can explain membership payments, failed charges, single washes, coupon redemptions, and refunds."
        >
          <BillingPhone />
        </ScenarioSlide>
      ),
    },
    { id: "docs-search", label: "Docs", render: () => <DocsSearchSlide /> },
    { id: "architecture", label: "Architecture", render: () => <CurrentArchitectureSlide /> },
    { id: "data-model", label: "Data model", render: () => <DataModelSlide /> },
    { id: "production", label: "Production", render: () => <ScaleSlide /> },
    { id: "tradeoffs", label: "Tradeoffs", render: () => <TradeoffsSlide /> },
  ];
}

export function PresentationDeck() {
  const slides = useMemo(() => createSlides(), []);
  const [index, setIndex] = useState(0);
  const activeSlide = slides[index];
  const progress = ((index + 1) / slides.length) * 100;

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        setIndex((current) => Math.min(current + 1, slides.length - 1));
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        setIndex((current) => Math.max(current - 1, 0));
      }
      if (event.key === "Home") {
        event.preventDefault();
        setIndex(0);
      }
      if (event.key === "End") {
        event.preventDefault();
        setIndex(slides.length - 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  return (
    <main className="min-h-screen overflow-hidden text-foreground">
      <div className="fixed left-0 right-0 top-0 z-20 border-b border-border bg-card/90 px-5 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="min-w-0">
            <Link className="text-sm font-semibold text-primary" href="/csr/dashboard">
              AMP CSR Command Center
            </Link>
            <p className="truncate text-xs font-medium text-muted">
              {String(index + 1).padStart(2, "0")} / {slides.length} · {activeSlide.label}
            </p>
          </div>
          <div className="hidden min-w-0 flex-1 items-center gap-1 lg:flex">
            {slides.map((slide, slideIndex) => (
              <button
                className={cn(
                  "h-2 flex-1 rounded-full",
                  slideIndex <= index ? "bg-primary" : "bg-surface-muted",
                )}
                key={slide.id}
                onClick={() => setIndex(slideIndex)}
                type="button"
                aria-label={`Go to slide ${slideIndex + 1}: ${slide.label}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              disabled={index === 0}
              onClick={() => setIndex((current) => Math.max(current - 1, 0))}
              type="button"
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={index === slides.length - 1}
              onClick={() => setIndex((current) => Math.min(current + 1, slides.length - 1))}
              type="button"
            >
              Next
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 bg-primary" style={{ width: `${progress}%` }} />
      </div>

      <div className="pt-[76px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            initial={{ opacity: 0, x: 18 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            {activeSlide.render()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-2 text-xs font-semibold text-muted shadow-lg shadow-slate-300/60 backdrop-blur">
        <ArrowLeft size={14} aria-hidden="true" />
        Arrow keys
        <ArrowRight size={14} aria-hidden="true" />
      </div>
    </main>
  );
}
