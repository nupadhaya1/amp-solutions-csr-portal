import Link from "next/link";
import { ArrowRight, CarFront, ClipboardList, ShieldAlert } from "lucide-react";

export default function Home() {
  const metrics = [
    { label: "Critical accounts", value: "3", tone: "text-critical" },
    { label: "Active subscriptions", value: "11", tone: "text-primary" },
    { label: "Seeded demo workflows", value: "6", tone: "text-accent" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CarFront size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                AMP
              </p>
              <p className="text-sm text-muted">Membership support</p>
            </div>
          </div>
          <Link
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary hover:text-primary"
            href="/presentation"
          >
            View Presentation
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-muted">
              <ShieldAlert
                size={16}
                className="text-critical"
                aria-hidden="true"
              />
              CSR command center
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-normal text-foreground sm:text-6xl">
              AMP CSR Command Center
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              A support portal for resolving customer membership, vehicle,
              subscription, and payment issues.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95"
                href="/csr"
              >
                Open CSR Portal
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary hover:text-primary"
                href="/mobile"
              >
                Mobile Companion
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-semibold">Support queue snapshot</h2>
                <p className="mt-1 text-sm text-muted">
                  Seed data targets the demo workflows.
                </p>
              </div>
              <ClipboardList className="text-primary" size={24} aria-hidden="true" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  className="rounded-md border border-border bg-background p-4"
                  key={metric.label}
                >
                  <p className={`text-3xl font-semibold ${metric.tone}`}>
                    {metric.value}
                  </p>
                  <p className="mt-2 text-sm text-muted">{metric.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-md bg-critical-background p-4">
              <p className="text-sm font-semibold text-critical">Hero workflow</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                Search Jordan or AMP1234 to diagnose an overdue subscription
                caused by a failed membership payment.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
