import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { MotionPanel } from "@/components/motion-panel";
import { listCustomersForSupport } from "@/lib/data/customers";
import { getCustomerLookupResults } from "@/lib/domain/customer-lookup-view-model";

export default async function CustomerLookupPage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || "";
  const name = params?.name || "";
  const email = params?.email || "";
  const phone = params?.phone || "";
  const licensePlate = params?.licensePlate || "";
  const customers = await listCustomersForSupport();
  const customerResults = getCustomerLookupResults(customers, {
    q,
    name,
    email,
    phone,
    licensePlate,
  });

  return (
    <MotionPanel>
      <header className="rounded-3xl border border-border bg-card px-6 py-7 shadow-sm shadow-slate-200/70">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Customer lookup</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Find a member account</h1>
        <p className="mt-2 max-w-3xl text-muted">
          Search by name, phone, email, license plate, purchase context, or support history.
        </p>
      </header>

      <form action="/csr/customers" className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70">
        <label className="grid gap-2">
          <span className="text-sm font-semibold">Customer search</span>
          <div className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-surface px-4 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
            <Search className="text-muted" size={18} aria-hidden="true" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              defaultValue={q}
              name="q"
              placeholder="Try CZR4821, failed payment, refund, new truck..."
            />
          </div>
        </label>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Name</span>
            <input
              className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              defaultValue={name}
              name="name"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Email</span>
            <input
              className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              defaultValue={email}
              name="email"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">Phone</span>
            <input
              className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              defaultValue={phone}
              name="phone"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold">License plate</span>
            <input
              className="h-11 rounded-xl border border-border bg-surface px-3 text-sm uppercase outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              defaultValue={licensePlate}
              name="licensePlate"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
            type="submit"
          >
            Search
          </button>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold transition hover:border-primary hover:text-primary"
            href="/csr/customers"
          >
            Clear filters
          </Link>
        </div>
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
                <p className="mt-1 text-sm text-muted">
                  Subscription: {customer.subscriptionSummary}
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
