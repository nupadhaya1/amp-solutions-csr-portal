"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CarFront,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  FileClock,
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
    <section className="grid h-[calc(100vh-76px)] content-center overflow-hidden px-5 py-5 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-5">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
          ) : null}
          <h1 className="mt-2 max-w-5xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-4xl text-base leading-7 text-muted">{subtitle}</p>
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

function MockPhone({ children, label = "Customer mobile view" }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
        <Smartphone size={16} aria-hidden="true" />
        {label}
      </div>
      <div
        className="mx-auto w-full max-w-[340px] rounded-[2.25rem] border border-slate-300 bg-slate-950 p-3 shadow-2xl shadow-slate-300/60"
      >
        <div className="rounded-[1.8rem] bg-surface p-4">
          <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-slate-300" />
          <div className="min-h-[440px] rounded-[1.35rem] bg-card p-4 shadow-inner">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowStep({ icon: Icon, label }) {
  return (
    <div className="flex min-h-24 flex-1 items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-primary">
        <Icon size={22} aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold leading-6">{label}</span>
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
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm shadow-slate-200/70">
      <div className="grid items-center gap-4 xl:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]">
        {steps.map((step, index) => (
          <div className="contents" key={step.label}>
            <FlowStep {...step} />
            {index < steps.length - 1 ? (
              <ArrowRight className="mx-auto hidden text-primary xl:block" size={30} aria-hidden="true" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScenarioFlowPanel({ headline, steps }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm shadow-slate-200/70">
      <h2 className="text-2xl font-semibold tracking-tight">{headline}</h2>
      <div className="mt-6 grid gap-3">
        {steps.map((step, index) => (
          <div className="grid grid-cols-[42px_minmax(0,1fr)] gap-3" key={step}>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
              {index + 1}
            </span>
            <div className="rounded-2xl border border-border bg-surface p-4 text-lg font-semibold leading-7">
              {step}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScenarioSlide({ children, flowHeadline, flowSteps, phoneTitle, title, subtitle }) {
  return (
    <section className="grid h-[calc(100vh-76px)] content-center overflow-hidden px-5 py-5 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-5">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-base leading-7 text-muted">{subtitle}</p> : null}
        </div>
        <div className="grid items-start gap-8 lg:grid-cols-[390px_minmax(0,1fr)]">
          <MockPhone label={phoneTitle}>{children}</MockPhone>
          <ScenarioFlowPanel headline={flowHeadline} steps={flowSteps} />
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

function ChecklistGrid({ items }) {
  return (
    <div className="grid auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          className="flex min-h-24 items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70"
          key={item}
        >
          <CheckCircle2 className="shrink-0 text-success" size={22} aria-hidden="true" />
          <p className="text-base font-semibold leading-6">{item}</p>
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
              ["System design", "/demo/systemDesign"],
              ["Presentation", "/demo/presentation"],
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
      title="A normal wash should not turn into a support scavenger hunt."
      subtitle="When a member is blocked, the CSR needs the account, car, payment, lane, and subscription story in one place."
    >
      <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <div className="grid gap-2">
          {[
            "Payment failed",
            "New car needs coverage",
            "Charge or refund question",
            "Cancel or change plan",
          ].map((item) => (
            <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm shadow-slate-200/70" key={item}>
              <p className="text-xl font-semibold leading-7">{item}</p>
            </div>
          ))}
        </div>
        <ProblemFlow />
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
      title="Support docs are built into the workflow."
      subtitle="A CSR can search plain-language issues and open the exact playbook instead of guessing from memory."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm shadow-slate-200/70">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm font-semibold text-muted">Search example</p>
            <p className="mt-2 text-2xl font-semibold">gate denied but app says active</p>
          </div>
          <div className="mt-5 grid gap-3">
            {[
              "Find matching playbook",
              "Show the remediation steps",
              "Link back to the customer action",
            ].map((step, index) => (
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4" key={step}>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <p className="text-lg font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          {["Markdown playbooks", "Local embeddings", "pgvector ranking", "Keyword fallback"].map((item) => (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70" key={item}>
              <FileSearch className="text-primary" size={24} aria-hidden="true" />
              <p className="mt-3 text-xl font-semibold">{item}</p>
            </div>
          ))}
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
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm shadow-slate-200/70">
          <div className="grid items-center gap-3 xl:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
            {["CSR browser", "Next.js app", "Server actions", "Postgres"].map((item, index) => (
              <div className="contents" key={item}>
                <div className="rounded-2xl border border-border bg-surface p-5 text-center text-xl font-semibold">
                  {item}
                </div>
                {index < 3 ? <ArrowRight className="mx-auto hidden text-primary xl:block" size={28} aria-hidden="true" /> : null}
              </div>
            ))}
          </div>
        </div>
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
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {[
          ["Customer", "Profile, status, contact info"],
          ["Vehicle", "Plate, make, model, coverage"],
          ["Subscription", "Plan, status, billing cycle"],
          ["Purchase", "Payments, washes, coupons, refunds"],
          ["LaneSession", "Gate, queue, blocked, plate mismatch"],
          ["SupportNote", "CSR notes and follow-up context"],
          ["AuditEvent", "Every support action is traceable"],
          ["SupportDoc", "Searchable playbooks for CSRs"],
        ].map(([name, detail]) => (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70" key={name}>
            <p className="text-2xl font-semibold">{name}</p>
            <p className="mt-2 text-base font-medium leading-6 text-muted">{detail}</p>
          </div>
        ))}
      </div>
    </SlideShell>
  );
}

function AwsServiceCard({ name, detail }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ff9900] text-sm font-black text-slate-950">
          AWS
        </span>
        <div>
          <p className="text-lg font-semibold">{name}</p>
          <p className="text-sm font-medium text-muted">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function ScaleSlide() {
  return (
    <SlideShell
      eyebrow="Production"
      title="The MVP can move cleanly from Vercel/Neon to an AWS production architecture."
      subtitle="The same boundaries map to CDN, WAF, containers, RDS, secrets, logs, and CI/CD."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm shadow-slate-200/70">
          <div className="grid gap-3">
            {[
              ["Route 53", "DNS"],
              ["CloudFront + WAF", "edge + protection"],
              ["ALB + ECS Fargate", "Next.js service"],
              ["RDS Postgres", "customer/support data"],
            ].map(([name, detail]) => (
              <AwsServiceCard detail={detail} key={name} name={name} />
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm shadow-slate-200/70">
          <div className="grid gap-3">
            {[
              ["Secrets Manager", "database and provider keys"],
              ["CloudWatch", "logs, metrics, alarms"],
              ["ECR", "container registry"],
              ["GitHub Actions", "test, build, deploy"],
            ].map(([name, detail]) => (
              <AwsServiceCard detail={detail} key={name} name={name} />
            ))}
          </div>
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
          flowHeadline="What the CSR does"
          flowSteps={[
            "Search by plate CZR4821",
            "See the failed payment and blocked lane status",
            "Update the card or retry the charge",
            "Confirm the customer can wash again",
          ]}
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
          flowHeadline="How lane context helps"
          flowSteps={[
            "Spot blocked cars before the call gets messy",
            "Open the linked customer profile",
            "Use the recommended fix path",
            "Move the car back into the queue",
          ]}
          phoneTitle="Operational lane view"
          title="Lane context shows what is happening at the wash."
          subtitle="The CSR can see whether the car is at the gate, blocked, in queue, or cleared."
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
          flowHeadline="Coverage transfer flow"
          flowSteps={[
            "Find the member by name, plate, or issue",
            "Confirm old and new vehicles",
            "Transfer coverage to the new car",
            "Leave an audit trail on the account",
          ]}
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
          flowHeadline="Billing question flow"
          flowSteps={[
            "Open purchase history from the profile",
            "Check payments, failed charges, coupons, and refunds",
            "Explain what happened in plain language",
            "Add a note if follow-up is needed",
          ]}
          phoneTitle="Customer billing view"
          title="Purchase history is right where the CSR needs it."
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
