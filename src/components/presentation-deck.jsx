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
  SquareArrowOutUpRight,
  Sparkles,
  Workflow,
} from "lucide-react";
import Image from "next/image";
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

const prismaSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_URL_UNPOOLED")
}

enum CustomerStatus {
  ACTIVE
  OVERDUE
  CANCELLED
}

enum SubscriptionStatus {
  ACTIVE
  OVERDUE
  CANCELLED
  PAUSED
}

enum PurchaseType {
  SINGLE_WASH
  MEMBERSHIP_PAYMENT
  COUPON_REDEMPTION
}

enum PurchaseStatus {
  PAID
  FAILED
  REFUNDED
}

enum AuditEventType {
  ACCOUNT_UPDATED
  VEHICLE_ADDED
  VEHICLE_UPDATED
  SUBSCRIPTION_ADDED
  SUBSCRIPTION_CANCELLED
  SUBSCRIPTION_TRANSFERRED
  SUBSCRIPTION_PLAN_CHANGED
  SUPPORT_NOTE_ADDED
  PAYMENT_FAILED
  SUBSCRIPTION_OVERDUE
}

enum ActorType {
  CSR
  SYSTEM
}

model Customer {
  id            String         @id @default(cuid())
  memberId      String         @unique
  firstName     String
  lastName      String
  email         String         @unique
  phone         String
  status        CustomerStatus @default(ACTIVE)
  homeWashLocation String      @default("AMP Buckhead")
  vehicles      Vehicle[]
  subscriptions Subscription[]
  purchases     Purchase[]
  supportNotes  SupportNote[]
  auditEvents   AuditEvent[]
  laneSessions  LaneSession[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Vehicle {
  id                   String                @id @default(cuid())
  customerId           String
  year                 Int
  make                 String
  model                String
  color                String
  licensePlate         String                @unique
  customer             Customer              @relation(fields: [customerId], references: [id], onDelete: Cascade)
  subscriptionVehicles SubscriptionVehicle[]
  purchases            Purchase[]
  laneSessions         LaneSession[]
  createdAt            DateTime              @default(now())
  updatedAt            DateTime              @updatedAt

  @@index([customerId])
  @@index([licensePlate])
}

model SubscriptionPlan {
  id            String         @id @default(cuid())
  name          String         @unique
  description   String
  monthlyPrice  Decimal
  maxVehicles   Int
  cleaningTier  String
  subscriptions Subscription[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Subscription {
  id              String                @id @default(cuid())
  customerId      String
  planId          String
  status          SubscriptionStatus    @default(ACTIVE)
  startedAt       DateTime
  nextBillingDate DateTime?
  customer        Customer              @relation(fields: [customerId], references: [id], onDelete: Cascade)
  plan            SubscriptionPlan      @relation(fields: [planId], references: [id])
  vehicles        SubscriptionVehicle[]
  purchases       Purchase[]
  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt

  @@index([customerId])
  @@index([planId])
  @@index([status])
}

model SubscriptionVehicle {
  id             String       @id @default(cuid())
  subscriptionId String
  vehicleId      String
  subscription   Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  vehicle        Vehicle      @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  assignedAt     DateTime     @default(now())
  removedAt      DateTime?

  @@index([subscriptionId])
  @@index([vehicleId])
}

model Purchase {
  id             String         @id @default(cuid())
  customerId     String
  vehicleId      String?
  subscriptionId String?
  type           PurchaseType
  status         PurchaseStatus
  amount         Decimal
  description    String
  purchasedAt    DateTime
  customer       Customer       @relation(fields: [customerId], references: [id], onDelete: Cascade)
  vehicle        Vehicle?       @relation(fields: [vehicleId], references: [id])
  subscription   Subscription?  @relation(fields: [subscriptionId], references: [id])
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([customerId])
  @@index([vehicleId])
  @@index([subscriptionId])
  @@index([status])
  @@index([type])
}

model SupportNote {
  id         String   @id @default(cuid())
  customerId String
  note       String
  csrName    String
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())

  @@index([customerId])
}

model AuditEvent {
  id         String         @id @default(cuid())
  customerId String
  type       AuditEventType
  message    String
  metadata   Json?
  actorName  String
  actorType  ActorType
  customer   Customer       @relation(fields: [customerId], references: [id], onDelete: Cascade)
  createdAt  DateTime       @default(now())

  @@index([customerId])
  @@index([type])
}

model LaneSession {
  id            String    @id @default(cuid())
  customerId    String?
  vehicleId     String?
  locationName  String
  laneName      String
  status        String
  detectedPlate String
  detectedAt    DateTime
  confidence    Float?
  issueCode     String    @default("NONE")
  issueSeverity String    @default("NONE")
  resolvedAt    DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  customer      Customer? @relation(fields: [customerId], references: [id])
  vehicle       Vehicle?  @relation(fields: [vehicleId], references: [id])

  @@index([customerId])
  @@index([vehicleId])
  @@index([status])
  @@index([issueCode])
  @@index([detectedPlate])
}

model FaqArticle {
  id        String   @id @default(cuid())
  title     String
  question  String
  answer    String
  category  String
  keywords  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([category])
}

model SupportDoc {
  id              String            @id @default(cuid())
  slug            String            @unique
  title           String
  category        String
  severity        String
  tags            String            @default("[]")
  customerPhrases String            @default("[]")
  summary         String
  body            String
  source          String            @default("docs/csr")
  version         Int               @default(1)
  isPublished     Boolean           @default(true)
  chunks          SupportDocChunk[]
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@index([category])
  @@index([severity])
  @@index([isPublished])
}

model SupportDocChunk {
  id         String     @id @default(cuid())
  docId      String
  chunkIndex Int
  heading    String
  content    String
  tokenCount Int        @default(0)
  doc        SupportDoc @relation(fields: [docId], references: [id], onDelete: Cascade)
  createdAt  DateTime   @default(now())

  @@unique([docId, chunkIndex])
  @@index([docId])
}`;

function getPrismaDeclaration(kind, name) {
  return prismaSchema.match(new RegExp(`${kind} ${name} \\{[\\s\\S]*?\\n\\}`))?.[0] ?? "";
}

const dataModelEntities = [
  {
    name: "Customer",
    detail: "Profile, status, contact info",
    schema: [getPrismaDeclaration("enum", "CustomerStatus"), getPrismaDeclaration("model", "Customer")].join("\n\n"),
  },
  {
    name: "Vehicle",
    detail: "Plate, make, model, coverage",
    schema: getPrismaDeclaration("model", "Vehicle"),
  },
  {
    name: "Subscription",
    detail: "Plan, status, billing cycle",
    schema: [
      getPrismaDeclaration("enum", "SubscriptionStatus"),
      getPrismaDeclaration("model", "SubscriptionPlan"),
      getPrismaDeclaration("model", "Subscription"),
      getPrismaDeclaration("model", "SubscriptionVehicle"),
    ].join("\n\n"),
  },
  {
    name: "Purchase",
    detail: "Payments, washes, coupons, refunds",
    schema: [
      getPrismaDeclaration("enum", "PurchaseType"),
      getPrismaDeclaration("enum", "PurchaseStatus"),
      getPrismaDeclaration("model", "Purchase"),
    ].join("\n\n"),
  },
  {
    name: "LaneSession",
    detail: "Gate, queue, blocked, plate mismatch",
    schema: getPrismaDeclaration("model", "LaneSession"),
  },
  {
    name: "SupportNote",
    detail: "CSR notes and follow-up context",
    schema: getPrismaDeclaration("model", "SupportNote"),
  },
  {
    name: "AuditEvent",
    detail: "Every support action is traceable",
    schema: [
      getPrismaDeclaration("enum", "AuditEventType"),
      getPrismaDeclaration("enum", "ActorType"),
      getPrismaDeclaration("model", "AuditEvent"),
    ].join("\n\n"),
  },
  {
    name: "SupportDoc",
    detail: "Searchable playbooks for CSRs",
    schema: [getPrismaDeclaration("model", "FaqArticle"), getPrismaDeclaration("model", "SupportDoc"), getPrismaDeclaration("model", "SupportDocChunk")].join("\n\n"),
  },
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

function MockPhone({ children }) {
  return (
    <div className="flex h-full">
      <div
        className="mx-auto flex h-full w-full max-w-[340px] rounded-[2.25rem] border border-slate-300 bg-slate-950 p-3 shadow-2xl shadow-slate-300/60"
      >
        <div className="flex min-h-0 flex-1 flex-col rounded-[1.8rem] bg-surface p-4">
          <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-slate-300" />
          <div className="min-h-[440px] flex-1 rounded-[1.35rem] bg-card p-4 shadow-inner">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowStep({ icon: Icon, label }) {
  return (
    <div className="flex min-h-28 min-w-0 flex-1 flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm shadow-slate-200/70">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-primary">
        <Icon size={22} aria-hidden="true" />
      </span>
      <span className="min-w-0 text-base font-semibold leading-6">{label}</span>
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
      <div className="grid min-w-0 items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]">
        {steps.map((step, index) => (
          <div className="contents" key={step.label}>
            <div className="min-w-0">
              <p className="mb-2 text-sm font-semibold text-primary">{index + 1}</p>
              <FlowStep {...step} />
            </div>
            {index < steps.length - 1 ? (
              <ArrowRight className="mx-auto hidden self-center text-primary lg:block" size={24} aria-hidden="true" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScenarioFlowPanel({ headline, steps }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70">
      <h2 className="text-xl font-semibold tracking-tight">{headline}</h2>
      <div className="mt-4 grid min-h-0 flex-1 auto-rows-fr gap-3 lg:grid-cols-4">
        {steps.map((step, index) => (
          <div className="flex min-h-32 flex-col justify-between rounded-2xl border border-border bg-surface p-4" key={step}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
              {index + 1}
            </span>
            <p className="mt-4 text-lg font-semibold leading-7">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScenarioSlide({ children, context, flowHeadline, flowSteps, title, subtitle }) {
  return (
    <section className="grid h-[calc(100vh-76px)] overflow-hidden px-5 py-4 sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-col">
        <div className="mb-5">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-base leading-7 text-muted">{subtitle}</p> : null}
        </div>
        <div className="grid min-h-0 flex-1 items-stretch gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <MockPhone>{children}</MockPhone>
          <div className="flex min-h-0 flex-col gap-5">
            <div className="shrink-0 rounded-3xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Mock customer / car context</p>
              <p className="mt-3 text-2xl font-semibold leading-8">{context.title}</p>
              <p className="mt-2 max-w-4xl text-base leading-7 text-muted">{context.body}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {context.stats.map(([label, value]) => (
                  <div className="rounded-2xl border border-border bg-surface p-4" key={label}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
                    <p className="mt-2 text-lg font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <ScenarioFlowPanel headline={flowHeadline} steps={flowSteps} />
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
    <section className="grid h-[calc(100vh-76px)] overflow-hidden px-5 py-4 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-col gap-5">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm shadow-slate-200/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Intro</p>
          <h1 className="mt-2 max-w-5xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            AMP CSR Command Center
          </h1>
          <p className="mt-3 max-w-4xl text-base leading-7 text-muted">
            A full-stack support portal for resolving car wash membership, payment, vehicle, lane, and subscription issues.
          </p>
          <div className="flex flex-wrap gap-2">
            {stack.map((item) => (
              <Pill key={item} tone="primary">{item}</Pill>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ["Search fast", Search],
              ["Diagnose clearly", ShieldCheck],
              ["Act safely", BadgeCheck],
            ].map(([label, Icon]) => (
              <div className="rounded-2xl border border-border bg-surface p-5" key={label}>
                <Icon className="text-primary" size={28} aria-hidden="true" />
                <p className="mt-4 text-xl font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-primary/20 bg-primary p-7 text-primary-foreground shadow-xl shadow-blue-200/70">
          <Sparkles size={30} aria-hidden="true" />
          <p className="mt-5 text-2xl font-semibold leading-9">
            Built around the real CSR call flow: find the member, understand the blocker,
            take the action, and leave a trace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
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
    </section>
  );
}

function ProblemSlide() {
  return (
    <SlideShell
      eyebrow="Problem statement"
      title="A normal wash should not turn into a support scavenger hunt."
      subtitle="When a member is blocked, the CSR needs the account, car, payment, lane, and subscription story in one place."
    >
      <ProblemFlow />
    </SlideShell>
  );
}

function MvpSlide() {
  return (
    <SlideShell
      eyebrow="MVP coverage"
      title="CSR Workflows cover the required support paths end to end."
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
            <label className="text-sm font-semibold text-muted" htmlFor="docs-query-demo">Elastic-style query</label>
            <div className="mt-3 flex min-h-14 items-center gap-3 rounded-xl border border-primary/30 bg-card px-4 shadow-inner">
              <Search className="shrink-0 text-primary" size={21} aria-hidden="true" />
              <input
                id="docs-query-demo"
                aria-label="Support docs query"
                className="min-w-0 flex-1 bg-transparent text-xl font-semibold outline-none"
                readOnly
                value={'"gate denied but app says active"'}
              />
            </div>
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

function DataModelSlide() {
  const [selectedModelName, setSelectedModelName] = useState(null);
  const selectedEntity = dataModelEntities.find((entity) => entity.name === selectedModelName);

  return (
    <SlideShell
      eyebrow="Data model"
      title="The customer record connects account, vehicle, payment, lane, and support context."
      subtitle="The schema is centered on the entities a CSR actually needs during a call."
    >
      <div className="grid max-h-[64vh] gap-4 overflow-hidden lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <div className="grid gap-4 overflow-auto pr-1">
          {dataModelEntities.map(({ name, detail }) => (
            <button
              className={cn(
                "rounded-2xl border bg-card p-4 text-left shadow-sm shadow-slate-200/70 transition hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selectedModelName === name ? "border-primary bg-primary/5" : "border-border",
              )}
              key={name}
              onClick={() => setSelectedModelName(name)}
              type="button"
              aria-pressed={selectedModelName === name}
            >
              <p className="text-xl font-semibold">{name}</p>
              <p className="mt-1 text-sm font-medium leading-6 text-muted">{detail}</p>
            </button>
          ))}
        </div>
        <div className="min-h-0 rounded-3xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70">
          <p className="text-lg font-semibold">View actual Prisma schema</p>
          {selectedEntity ? (
            <>
              <p className="mt-2 text-sm font-medium text-muted">{selectedEntity.name} schema excerpt</p>
              <pre className="mt-3 max-h-[52vh] overflow-hidden whitespace-pre-wrap rounded-2xl border border-border bg-slate-950 p-3 text-[9px] leading-[1.18] text-slate-100">
                <code>{selectedEntity.schema}</code>
              </pre>
            </>
          ) : (
            <div className="mt-4 flex min-h-[52vh] items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
              <p className="max-w-sm text-lg font-semibold leading-7 text-muted">
                Choose one of the options to view its Prisma schema.
              </p>
            </div>
          )}
        </div>
      </div>
    </SlideShell>
  );
}

function DiagramNode({ detail, icon, name }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm shadow-slate-200/70">
      {icon ? (
        <Image alt="" aria-hidden="true" className="mx-auto h-11 w-11" height={44} src={icon} width={44} />
      ) : (
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-xs font-black text-primary-foreground">
          {name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 3)}
        </span>
      )}
      <p className="mt-2 text-sm font-semibold leading-5">{name}</p>
      {detail ? <p className="text-xs font-medium text-muted">{detail}</p> : null}
    </div>
  );
}

function DiagramArrow() {
  return <ArrowRight className="mx-auto hidden self-center text-primary xl:block" size={22} aria-hidden="true" />;
}

function AwsArchitectureDiagram() {
  const edge = [
    ["CSR Browser", "User"],
    ["CloudFront", "CDN", "/aws-icons/cloudfront.svg"],
    ["Application Load Balancer", "Ingress", "/aws-icons/application-load-balancer.svg"],
    ["ECS Fargate Next.js Service", "App", "/aws-icons/fargate.svg"],
    ["RDS PostgreSQL Multi-AZ", "Data", "/aws-icons/rds.svg"],
  ];

  const dependencies = [
    ["Secrets Manager", "Secrets", "/aws-icons/secrets-manager.svg"],
    ["CloudWatch Logs/Metrics", "Observe", "/aws-icons/cloudwatch.svg"],
  ];

  return (
    <div className="rounded-3xl border border-border bg-surface p-5">
      <div className="grid items-stretch gap-3 xl:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]">
        {edge.map(([name, detail, icon], index) => (
          <div className="contents" key={name}>
            <DiagramNode detail={detail} icon={icon} name={name} />
            {index < edge.length - 1 ? <DiagramArrow /> : null}
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-primary">Runtime basics</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {dependencies.map(([name, detail, icon]) => (
              <DiagramNode detail={detail} icon={icon} key={name} name={name} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-primary">Deploy path</p>
          <div className="mt-3 grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <DiagramNode detail="CI/CD" name="GitHub Actions" />
            <DiagramArrow />
            <DiagramNode detail="Image registry" icon="/aws-icons/ecr.svg" name="Amazon ECR" />
            <DiagramArrow />
            <DiagramNode detail="Rolling service" icon="/aws-icons/ecs.svg" name="Amazon ECS" />
          </div>
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
      subtitle="The same boundaries map to CDN delivery, load balancing, containers, RDS, secrets, logs, and CI/CD."
    >
      <div className="grid max-h-[64vh] gap-4 overflow-auto">
        <AwsArchitectureDiagram />
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
          context={{
            title: "Overdue member at the gate",
            body: "Mock customer Maria Chen is at AMP Buckhead in a Honda Civic. The lane sees plate CZR4821, but the membership is blocked by a failed card charge.",
            stats: [
              ["Member", "Maria Chen"],
              ["Plate", "CZR4821"],
              ["Blocker", "Payment failed"],
            ],
          }}
          flowHeadline="What the CSR does"
          flowSteps={[
            "Search by plate CZR4821.",
            "See the failed payment and blocked lane status.",
            "Update the card or retry the charge.",
            "Confirm the customer can wash again.",
          ]}
          title="Unable to get a wash"
          subtitle="The customer is blocked at the gate because the membership payment failed."
        >
          <BlockedWashPhone />
        </ScenarioSlide>
      ),
    },
    {
      id: "vehicle-transfer",
      label: "Vehicle transfer",
      render: () => (
        <ScenarioSlide
          context={{
            title: "Existing subscriber bought a replacement car",
            body: "The mock customer has an active plan attached to an older vehicle and needs coverage moved to a newly added Subaru before the next wash.",
            stats: [
              ["Old vehicle", "2019 Camry"],
              ["New vehicle", "2024 Outback"],
              ["Action", "Transfer coverage"],
            ],
          }}
          flowHeadline="Coverage transfer flow"
          flowSteps={[
            "Find the member by name, plate, or issue.",
            "Confirm old and new vehicles.",
            "Transfer coverage to the new car.",
            "Leave an audit trail on the account.",
          ]}
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
          context={{
            title: "Purchase history answers the money question",
            body: "The mock billing view keeps successful payments, failed renewals, coupons, refunds, and notes together so the CSR can explain the account state.",
            stats: [
              ["Plan", "Unlimited Wash"],
              ["Last receipt", "Jun 20, 2026"],
              ["Failed charge", "Jun 26, 2026"],
            ],
          }}
          flowHeadline="Billing question flow"
          flowSteps={[
            "Open purchase history from the profile.",
            "Check payments, failed charges, coupons, and refunds.",
            "Explain what happened in plain language.",
            "Add a note if follow-up is needed.",
          ]}
          title="Purchase history is right where the CSR needs it."
          subtitle="The CSR can explain membership payments, failed charges, single washes, coupon redemptions, and refunds."
        >
          <BillingPhone />
        </ScenarioSlide>
      ),
    },
    {
      id: "lane-context",
      label: "Lane context",
      render: () => (
        <ScenarioSlide
          context={{
            title: "Worker view at the wash",
            body: "Lane context represents what an on-site worker sees at the wash: vehicle at gate, detected plate, blocker, and recommended CSR action.",
            stats: [
              ["Location", "AMP Buckhead"],
              ["Lane", "Gate 2"],
              ["Recommendation", "Resolve blocker"],
            ],
          }}
          flowHeadline="How lane context helps"
          flowSteps={[
            "Spot blocked cars before the call gets messy.",
            "Open the linked customer profile.",
            "Use the recommended fix path.",
            "Move the car back into the queue.",
          ]}
          title="Lane context shows the worker's view at the wash."
          subtitle="The CSR can see whether the car is at the gate, blocked, in queue, or cleared."
        >
          <LaneContextPhone />
        </ScenarioSlide>
      ),
    },
    { id: "docs-search", label: "Docs", render: () => <DocsSearchSlide /> },
    { id: "data-model", label: "Data model", render: () => <DataModelSlide /> },
    { id: "production", label: "Production", render: () => <ScaleSlide /> },
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
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
              href="/demo"
            >
              <SquareArrowOutUpRight size={16} aria-hidden="true" />
              Demo
            </Link>
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
