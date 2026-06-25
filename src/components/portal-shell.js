import Link from "next/link";
import {
  AlertTriangle,
  CarFront,
  ClipboardList,
  Search,
  UserRound,
} from "lucide-react";

const stats = [
  { label: "Total customers", value: "6" },
  { label: "Active subscriptions", value: "5" },
  { label: "Open critical issues", value: "1" },
  { label: "Failed payments", value: "1" },
];

const recentCustomers = [
  {
    name: "Jordan Ellis",
    context: "Overdue subscription",
    status: "Critical",
  },
  {
    name: "Marcus Reed",
    context: "New vehicle transfer",
    status: "Active",
  },
  {
    name: "Alicia Brown",
    context: "Recent refund question",
    status: "Active",
  },
];

export function PortalShell() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CarFront size={23} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">AMP CSR Command Center</h1>
              <p className="text-sm text-muted">
                Bob Roberts · Customer Support Representative
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold transition hover:border-primary hover:text-primary"
              href="/csr/search"
            >
              Full Search
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold transition hover:border-primary hover:text-primary"
              href="/demo"
            >
              Demo Hub
            </Link>
          </nav>
        </header>

        <section className="grid gap-5 py-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  Customer lookup
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Start with the caller’s name, phone, email, or plate
                </h2>
              </div>
              <Search className="hidden text-primary sm:block" size={28} />
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <div className="flex min-h-12 flex-1 items-center gap-3 rounded-md border border-border bg-background px-4 text-muted">
                <Search size={18} aria-hidden="true" />
                <span className="text-sm">Search customers</span>
              </div>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
                href="/csr/search"
              >
                Open Search
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-critical bg-critical-background p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 text-critical" size={22} />
              <div>
                <p className="font-semibold text-critical">Critical queue</p>
                <p className="mt-2 text-sm leading-6">
                  One account needs attention because subscription access is
                  blocked by a payment issue.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-primary" size={20} />
              <h2 className="font-semibold">Dashboard stats</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {stats.map((stat) => (
                <div
                  className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3"
                  key={stat.label}
                >
                  <span className="text-sm text-muted">{stat.label}</span>
                  <span className="text-lg font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <UserRound className="text-primary" size={20} />
              <h2 className="font-semibold">Recent support contexts</h2>
            </div>
            <div className="mt-4 divide-y divide-border">
              {recentCustomers.map((customer) => (
                <div
                  className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  key={customer.name}
                >
                  <div>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="mt-1 text-sm text-muted">{customer.context}</p>
                  </div>
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold">
                    {customer.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
