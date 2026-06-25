import Link from "next/link";
import { ArrowLeft, Search, UserRound } from "lucide-react";

import { listCustomersForSupport } from "@/lib/data/customers";
import { flattenCustomerForSearch, searchCustomers } from "@/lib/domain/customer-search";

function filterByField(results, field, value) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return results;

  return results.filter((result) =>
    String(result[field] || "")
      .toLowerCase()
      .includes(normalized),
  );
}

export default async function CustomerSearchPage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || "";
  const name = params?.name || "";
  const email = params?.email || "";
  const phone = params?.phone || "";
  const licensePlate = params?.licensePlate || "";
  const customers = await listCustomersForSupport();

  let results = q
    ? searchCustomers(customers, q)
    : customers.map(flattenCustomerForSearch);

  results = filterByField(results, "fullName", name);
  results = filterByField(results, "email", email);
  results = filterByField(results, "phone", phone);
  results = filterByField(results, "licensePlate", licensePlate);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-primary"
              href="/"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Portal
            </Link>
            <h1 className="text-2xl font-semibold">Customer search</h1>
            <p className="mt-1 text-sm text-muted">
              Find customers by caller details, vehicle information, purchases,
              support notes, or audit history.
            </p>
          </div>
        </header>

        <section className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm">
          <form className="grid gap-4" action="/csr/search">
            <label className="grid gap-2">
              <span className="text-sm font-semibold">Smart search</span>
              <div className="flex min-h-12 items-center gap-3 rounded-md border border-border bg-background px-4">
                <Search className="text-muted" size={18} aria-hidden="true" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                  defaultValue={q}
                  name="q"
                  placeholder="Search name, phone, email, plate, payment issue, refund, transfer..."
                />
              </div>
            </label>

            <div className="grid gap-3 md:grid-cols-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Name</span>
                <input
                  className="h-11 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  defaultValue={name}
                  name="name"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Email</span>
                <input
                  className="h-11 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  defaultValue={email}
                  name="email"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold">Phone</span>
                <input
                  className="h-11 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  defaultValue={phone}
                  name="phone"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold">License plate</span>
                <input
                  className="h-11 rounded-md border border-border bg-background px-3 text-sm uppercase outline-none focus:border-primary"
                  defaultValue={licensePlate}
                  name="licensePlate"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
                type="submit"
              >
                Search
              </button>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-card px-5 text-sm font-semibold transition hover:border-primary hover:text-primary"
                href="/csr/search"
              >
                Clear filters
              </Link>
            </div>
          </form>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="font-semibold">{results.length} results</h2>
          </div>

          {results.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
              <UserRound className="mx-auto text-muted" size={34} aria-hidden="true" />
              <h3 className="mt-3 font-semibold">No customers found</h3>
              <p className="mt-2 text-sm text-muted">
                Try clearing filters or searching with another customer detail.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {results.map((customer) => (
                <article
                  className="rounded-lg border border-border bg-card p-5 shadow-sm"
                  key={customer.id}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold">{customer.fullName}</h3>
                        {customer.hasCriticalIssue ? (
                          <span className="rounded-full bg-critical-background px-3 py-1 text-xs font-semibold text-critical">
                            Critical issue
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {customer.email} · {customer.phone}
                      </p>
                      <p className="mt-3 text-sm">
                        {customer.primaryVehicle} · Plate {customer.licensePlate}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        Subscription: {customer.subscriptionSummary}
                      </p>
                    </div>
                    <Link
                      className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-semibold transition hover:border-primary hover:text-primary"
                      href={`/csr/customers/${customer.id}`}
                    >
                      Open customer
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
