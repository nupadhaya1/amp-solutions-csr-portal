import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CarFront,
  CreditCard,
  Grid2X2,
  Search,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";

import { MotionPanel } from "@/components/motion-panel";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: Grid2X2 },
  { id: "customers", label: "Customer lookup", icon: UsersRound },
  { id: "smart", label: "Smart search", icon: Brain },
];

const soonItems = [
  { label: "Subscriptions", icon: CarFront },
  { label: "Billing", icon: WalletCards },
];

const statIconMap = {
  "Active subscriptions": CarFront,
  "Monthly revenue": CreditCard,
  "Needs attention": AlertTriangle,
  "Total customers": UsersRound,
};

function tabHref(tab) {
  return tab === "dashboard" ? "/" : `/?tab=${tab}`;
}

function StatCard({ stat }) {
  const Icon = statIconMap[stat.label] || Grid2X2;
  return (
    <article className="group rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-slate-200/80">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-primary ring-1 ring-primary/10 group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon size={23} aria-hidden="true" />
      </div>
      <p className="mt-6 text-3xl font-semibold tracking-tight">{stat.value}</p>
      <p className="mt-2 text-sm font-medium text-muted">{stat.label}</p>
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
          href="/?tab=customers"
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

function DashboardTab({ viewModel }) {
  return (
    <MotionPanel>
      <header className="rounded-3xl border border-border bg-card px-6 py-7 shadow-sm shadow-slate-200/70">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Overview</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, Bob</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Here&apos;s what&apos;s happening across AMP memberships today.
        </p>
      </header>
      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {viewModel.stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>
      <div className="mt-8">
        <AttentionList customers={viewModel.criticalCustomers || []} />
      </div>
    </MotionPanel>
  );
}

function CustomerLookupTab({ customerQuery, customerResults }) {
  return (
    <MotionPanel>
      <header className="rounded-3xl border border-border bg-card px-6 py-7 shadow-sm shadow-slate-200/70">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Customer lookup</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Find a member account</h1>
        <p className="mt-2 max-w-3xl text-muted">
          Search by name, phone, email, license plate, purchase context, or support history.
        </p>
      </header>
      <form action="/" className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70">
        <input type="hidden" name="tab" value="customers" />
        <label className="grid gap-2">
          <span className="text-sm font-semibold">Customer search</span>
          <div className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-surface px-4 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
            <Search className="text-muted" size={18} aria-hidden="true" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              defaultValue={customerQuery}
              name="q"
              placeholder="Try CZR4821, failed payment, refund, new truck..."
            />
          </div>
        </label>
      </form>
      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-slate-200/70">
        <div className="border-b border-border bg-surface p-5">
          <h2 className="font-semibold">{customerResults.length} customer results</h2>
        </div>
        <div className="divide-y divide-border">
          {customerResults.map((customer) => (
            <Link
              className="flex flex-col gap-4 p-5 hover:bg-surface lg:flex-row lg:items-center lg:justify-between"
              href={`/csr/customers/${customer.id}`}
              key={customer.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{customer.fullName}</p>
                  {customer.hasCriticalIssue ? (
                    <span className="rounded-full bg-critical-background px-3 py-1 text-xs font-semibold text-critical">
                      Critical
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted">{customer.email} · {customer.phone}</p>
                <p className="mt-2 text-sm">
                  {customer.primaryVehicle} · Plate {customer.licensePlate}
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-muted px-3 py-1 text-sm font-semibold text-primary">
                Open profile
                <ArrowRight size={15} aria-hidden="true" />
              </span>
            </Link>
          ))}
          {customerResults.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="mx-auto text-muted" size={34} aria-hidden="true" />
              <h2 className="mt-3 font-semibold">No matching customers</h2>
              <p className="mt-2 text-sm text-muted">
                Try a phone number, plate, email, or support issue.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </MotionPanel>
  );
}

function SmartSearchTab({ semanticQuery, semanticResults }) {
  return (
    <MotionPanel>
      <header className="rounded-3xl border border-border bg-card px-6 py-7 shadow-sm shadow-slate-200/70">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Semantic KNN search</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Search support meaning, not just keywords</h1>
        <p className="mt-2 max-w-3xl text-muted">
          Current MVP uses local TF-IDF vectors with cosine similarity across customer
          cases and FAQ articles. It is private, free, deterministic, and easy to
          upgrade later to `pgvector` plus a small embedding model.
        </p>
      </header>
      <form action="/" className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70">
        <input type="hidden" name="tab" value="smart" />
        <label className="grid gap-2">
          <span className="text-sm font-semibold">Smart search prompt</span>
          <div className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-surface px-4 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
            <Brain className="text-muted" size={18} aria-hidden="true" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              defaultValue={semanticQuery}
              name="smart"
              placeholder="Try gate denied after card failed, new truck needs membership moved..."
            />
          </div>
        </label>
      </form>
      <section className="mt-6 grid gap-4">
        {semanticResults.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm shadow-slate-200/70">
            <Brain className="mx-auto text-muted" size={34} aria-hidden="true" />
            <h2 className="mt-3 font-semibold">Enter a support scenario</h2>
            <p className="mt-2 text-sm text-muted">
              Results will include related customer cases and help articles.
            </p>
          </div>
        ) : (
          semanticResults.map((result) => (
            <Link
              className="rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              href={result.href}
              key={`${result.kind}-${result.id}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    {result.kind}
                  </span>
                  <h2 className="mt-3 text-lg font-semibold">{result.title}</h2>
                  <p className="mt-1 text-sm text-muted">{result.subtitle}</p>
                </div>
                <span className="rounded-full border border-border bg-surface px-3 py-1 text-sm font-semibold text-muted">
                  {(result.score * 100).toFixed(0)}% match
                </span>
              </div>
            </Link>
          ))
        )}
      </section>
    </MotionPanel>
  );
}

export function PortalShell({
  activeTab = "dashboard",
  customerQuery = "",
  customerResults = [],
  semanticQuery = "",
  semanticResults = [],
  viewModel,
}) {
  const active = tabs.some((tab) => tab.id === activeTab) ? activeTab : "dashboard";

  return (
    <main className="min-h-screen text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-border bg-sidebar/90 p-5 shadow-sm lg:border-b-0 lg:border-r">
          <div className="flex min-h-full flex-col gap-8">
            <div className="rounded-3xl border border-white/80 bg-card/80 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <CarFront size={25} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold">AMP Care</p>
                  <p className="text-sm text-muted">CSR Portal</p>
                </div>
              </div>
            </div>

            <nav className="grid gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const selected = active === tab.id;
                return (
                  <Link
                    className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition ${
                      selected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted hover:bg-card hover:text-foreground hover:shadow-sm"
                    }`}
                    href={tabHref(tab.id)}
                    key={tab.id}
                  >
                    <Icon size={20} aria-hidden="true" />
                    {tab.label}
                  </Link>
                );
              })}
              {soonItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    className="flex min-h-12 items-center justify-between gap-3 rounded-xl px-4 text-sm font-semibold text-muted"
                    key={item.label}
                  >
                    <span className="inline-flex items-center gap-3">
                      <Icon size={20} aria-hidden="true" />
                      {item.label}
                    </span>
                    <span className="rounded-full border border-border bg-card px-2 py-1 text-xs">Soon</span>
                  </div>
                );
              })}
            </nav>

            <div className="mt-auto flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                  BR
                </div>
                <div>
                  <p className="font-semibold">Bob Roberts</p>
                  <p className="text-sm text-muted">Support agent</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          {active === "dashboard" ? <DashboardTab viewModel={viewModel} /> : null}
          {active === "customers" ? (
            <CustomerLookupTab customerQuery={customerQuery} customerResults={customerResults} />
          ) : null}
          {active === "smart" ? (
            <SmartSearchTab semanticQuery={semanticQuery} semanticResults={semanticResults} />
          ) : null}
        </section>
      </div>
    </main>
  );
}
