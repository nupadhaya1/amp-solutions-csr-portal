import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { customerInclude } from "@/lib/data/customers";
import { getCustomerCriticalIssue } from "@/lib/domain/customer-critical-issue";
import { prisma } from "@/lib/prisma";

export default async function CustomerProfilePlaceholder({ params }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: customerInclude,
  });

  if (!customer) notFound();

  const criticalIssue = getCustomerCriticalIssue(customer);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <Link
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-primary"
          href="/csr/search"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Search
        </Link>

        {criticalIssue ? (
          <section className="mb-5 rounded-lg border border-critical bg-critical-background p-5">
            <p className="text-sm font-semibold text-critical">{criticalIssue.title}</p>
            <p className="mt-2 text-sm leading-6">{criticalIssue.message}</p>
            <p className="mt-2 text-sm text-muted">
              Recommended action: {criticalIssue.recommendedAction}
            </p>
          </section>
        ) : null}

        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h1 className="text-2xl font-semibold">
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {customer.email} · {customer.phone}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-md border border-border bg-background p-4">
              <p className="text-sm text-muted">Account status</p>
              <p className="mt-1 font-semibold">{customer.status}</p>
            </div>
            <div className="rounded-md border border-border bg-background p-4">
              <p className="text-sm text-muted">Vehicles</p>
              <p className="mt-1 font-semibold">{customer.vehicles.length}</p>
            </div>
            <div className="rounded-md border border-border bg-background p-4">
              <p className="text-sm text-muted">Purchases</p>
              <p className="mt-1 font-semibold">{customer.purchases.length}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
