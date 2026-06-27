import Link from "next/link";
import { ArrowRight, Search, UserRound } from "lucide-react";

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
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm shadow-slate-200/70">
        <div className="border-b border-border bg-surface p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
              <p className="mt-1 text-sm text-muted">{customerResults.length} results</p>
            </div>
            <form action="/csr/customers" className="grid flex-1 gap-3 xl:max-w-5xl xl:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))_auto_auto]">
              <label className="grid gap-1">
                <span className="text-xs font-semibold text-muted">Search</span>
                <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 focus-within:border-primary">
                  <Search className="text-muted" size={16} aria-hidden="true" />
                  <input
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                    defaultValue={q}
                    name="q"
                    placeholder="Name, plate, issue..."
                  />
                </div>
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold text-muted">Name</span>
                <input
                  className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                  defaultValue={name}
                  name="name"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold text-muted">Email</span>
                <input
                  className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                  defaultValue={email}
                  name="email"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold text-muted">Phone</span>
                <input
                  className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                  defaultValue={phone}
                  name="phone"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold text-muted">Plate</span>
                <input
                  className="h-10 rounded-lg border border-border bg-card px-3 text-sm uppercase outline-none focus:border-primary"
                  defaultValue={licensePlate}
                  name="licensePlate"
                />
              </label>
              <button
                className="h-10 self-end rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
                type="submit"
              >
                Search
              </button>
              <Link
                className="inline-flex h-10 items-center justify-center self-end rounded-lg border border-border bg-card px-4 text-sm font-semibold transition hover:border-primary hover:text-primary"
                href="/csr/customers"
              >
                Clear
              </Link>
            </form>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-border bg-card text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Vehicle</th>
                <th className="px-5 py-3 font-semibold">Subscription</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customerResults.map((customer) => (
                <tr className="hover:bg-surface" key={customer.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-xs font-semibold text-primary">
                        {customer.fullName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold">{customer.fullName}</p>
                        {customer.hasCriticalIssue ? (
                          <span className="mt-1 inline-flex rounded-full bg-critical-background px-2 py-0.5 text-xs font-semibold text-critical">
                            Critical
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted">
                    <p>{customer.email}</p>
                    <p className="mt-1">{customer.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p>{customer.primaryVehicle}</p>
                    <p className="mt-1 text-xs font-semibold text-muted">Plate {customer.licensePlate}</p>
                  </td>
                  <td className="max-w-xs px-5 py-4 text-muted">{customer.subscriptionSummary}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      customer.hasCriticalIssue
                        ? "bg-critical-background text-critical"
                        : "bg-success-background text-success"
                    }`}>
                      {customer.hasCriticalIssue ? "Needs attention" : "Active"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
                      href={`/csr/customers/${customer.id}`}
                    >
                      Open profile
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
              {customerResults.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center" colSpan={6}>
                    <UserRound className="mx-auto text-muted" size={34} aria-hidden="true" />
                    <h2 className="mt-3 font-semibold">No matching customers</h2>
                    <p className="mt-2 text-sm text-muted">
                      Try a phone number, plate, email, or support issue.
                    </p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </MotionPanel>
  );
}
