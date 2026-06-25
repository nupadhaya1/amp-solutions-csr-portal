import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CarFront,
  ClipboardList,
  CreditCard,
  FileClock,
  MessageSquarePlus,
  ShieldAlert,
  UserRound,
} from "lucide-react";

import {
  addCustomerVehicle,
  cancelCustomerSubscription,
  updateCustomerAccount,
} from "@/lib/data/customer-actions";
import { customerInclude } from "@/lib/data/customers";
import { createCustomerProfileViewModel } from "@/lib/domain/customer-profile-view-model";
import { prisma } from "@/lib/prisma";
import { supportNoteSchema } from "@/lib/validation/support-note";

const CSR_NAME = "Bob Roberts";

async function addSupportNote(formData) {
  "use server";

  const customerId = String(formData.get("customerId") || "");
  const parsed = supportNoteSchema.safeParse({
    note: String(formData.get("note") || ""),
  });

  if (!customerId || !parsed.success) {
    redirect(`/csr/customers/${customerId}?note=invalid`);
  }

  await prisma.$transaction([
    prisma.supportNote.create({
      data: {
        customerId,
        note: parsed.data.note,
        csrName: CSR_NAME,
      },
    }),
    prisma.auditEvent.create({
      data: {
        customerId,
        type: "SUPPORT_NOTE_ADDED",
        message: "Support note added by CSR.",
        metadata: { notePreview: parsed.data.note.slice(0, 80) },
        actorName: CSR_NAME,
        actorType: "CSR",
      },
    }),
  ]);

  revalidatePath(`/csr/customers/${customerId}`);
  redirect(`/csr/customers/${customerId}?note=added`);
}

async function updateAccount(formData) {
  "use server";

  const customerId = String(formData.get("customerId") || "");

  try {
    await updateCustomerAccount({
      prismaClient: prisma,
      customerId,
      actorName: CSR_NAME,
      input: {
        firstName: String(formData.get("firstName") || ""),
        lastName: String(formData.get("lastName") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
      },
    });
  } catch {
    redirect(`/csr/customers/${customerId}?action=invalid-account`);
  }

  revalidatePath(`/csr/customers/${customerId}`);
  redirect(`/csr/customers/${customerId}?action=account-updated`);
}

async function addVehicle(formData) {
  "use server";

  const customerId = String(formData.get("customerId") || "");

  try {
    await addCustomerVehicle({
      prismaClient: prisma,
      customerId,
      actorName: CSR_NAME,
      input: {
        year: String(formData.get("year") || ""),
        make: String(formData.get("make") || ""),
        model: String(formData.get("model") || ""),
        color: String(formData.get("color") || ""),
        licensePlate: String(formData.get("licensePlate") || ""),
      },
    });
  } catch {
    redirect(`/csr/customers/${customerId}?action=invalid-vehicle`);
  }

  revalidatePath(`/csr/customers/${customerId}`);
  redirect(`/csr/customers/${customerId}?action=vehicle-added`);
}

async function cancelSubscription(formData) {
  "use server";

  const customerId = String(formData.get("customerId") || "");
  const subscriptionId = String(formData.get("subscriptionId") || "");

  try {
    await cancelCustomerSubscription({
      prismaClient: prisma,
      customerId,
      subscriptionId,
      actorName: CSR_NAME,
      input: {
        reason: String(formData.get("reason") || ""),
      },
    });
  } catch {
    redirect(`/csr/customers/${customerId}?action=invalid-cancel`);
  }

  revalidatePath(`/csr/customers/${customerId}`);
  redirect(`/csr/customers/${customerId}?action=subscription-cancelled`);
}

function Section({ children, icon: Icon, title }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="text-primary" size={20} aria-hidden="true" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default async function CustomerProfilePage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: customerInclude,
  });

  if (!customer) notFound();

  const profile = createCustomerProfileViewModel(customer);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-primary"
              href="/csr/search"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Search
            </Link>
            <h1 className="text-2xl font-semibold">{profile.fullName}</h1>
            <p className="mt-1 text-sm text-muted">
              {profile.email} · {profile.phone}
            </p>
          </div>
          <span className="w-fit rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold">
            {profile.status}
          </span>
        </header>

        {profile.criticalIssue ? (
          <section className="mt-6 rounded-lg border border-critical bg-critical-background p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 text-critical" size={24} />
              <div>
                <p className="font-semibold text-critical">
                  {profile.criticalIssue.title}
                </p>
                <p className="mt-2 text-sm leading-6">
                  {profile.criticalIssue.message}
                </p>
                <p className="mt-2 text-sm text-muted">
                  Recommended action: {profile.criticalIssue.recommendedAction}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {query?.note === "added" ? (
          <div className="mt-6 rounded-lg border border-border bg-card p-4 text-sm font-semibold text-primary">
            Support note added and audit timeline updated.
          </div>
        ) : null}

        {query?.action ? (
          <div className="mt-6 rounded-lg border border-border bg-card p-4 text-sm font-semibold text-primary">
            {query.action === "account-updated"
              ? "Customer account updated and audit timeline updated."
              : null}
            {query.action === "vehicle-added"
              ? "Vehicle added and audit timeline updated."
              : null}
            {query.action === "subscription-cancelled"
              ? "Subscription cancelled and audit timeline updated."
              : null}
            {query.action?.startsWith("invalid")
              ? "Action could not be completed. Check the form details and try again."
              : null}
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="grid gap-5">
            <Section icon={UserRound} title="Customer account">
              <form action={updateAccount} className="grid gap-4">
                <input type="hidden" name="customerId" value={profile.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">First name</span>
                    <input
                      className="h-11 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      defaultValue={customer.firstName}
                      name="firstName"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Last name</span>
                    <input
                      className="h-11 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      defaultValue={customer.lastName}
                      name="lastName"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Email</span>
                    <input
                      className="h-11 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      defaultValue={profile.email}
                      name="email"
                      type="email"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Phone</span>
                    <input
                      className="h-11 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      defaultValue={profile.phone}
                      name="phone"
                    />
                  </label>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted">
                    Created {profile.createdAt} · Updated {profile.updatedAt}
                  </p>
                  <button
                    className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
                    type="submit"
                  >
                    Save account
                  </button>
                </div>
              </form>
            </Section>

            <Section icon={CarFront} title="Vehicles and subscriptions">
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="grid gap-3">
                  {profile.vehicles.map((vehicle) => (
                    <div className="rounded-md border border-border bg-background p-4" key={vehicle.id}>
                      <p className="font-semibold">{vehicle.label}</p>
                      <p className="mt-1 text-sm text-muted">
                        {vehicle.color} · Plate {vehicle.licensePlate}
                      </p>
                      <p className="mt-3 text-sm">{vehicle.coverageStatus}</p>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3">
                  {profile.subscriptions.map((subscription) => (
                    <div className="rounded-md border border-border bg-background p-4" key={subscription.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{subscription.planName}</p>
                          <p className="mt-1 text-sm text-muted">
                            {subscription.monthlyPrice} · {subscription.cleaningTier}
                          </p>
                        </div>
                        <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold">
                          {subscription.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-muted">
                        Next billing: {subscription.nextBillingDate}
                      </p>
                      <p className="mt-2 text-sm">
                        Covers {subscription.coveredVehicles.length} of {subscription.maxVehicles} vehicles
                      </p>
                      {subscription.status !== "CANCELLED" ? (
                        <form action={cancelSubscription} className="mt-4 grid gap-2">
                          <input type="hidden" name="customerId" value={profile.id} />
                          <input type="hidden" name="subscriptionId" value={subscription.id} />
                          <input
                            className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                            name="reason"
                            placeholder="Cancellation reason"
                          />
                          <button
                            className="inline-flex h-10 items-center justify-center rounded-md border border-critical px-4 text-sm font-semibold text-critical transition hover:bg-critical-background"
                            type="submit"
                          >
                            Cancel subscription
                          </button>
                        </form>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
              <form action={addVehicle} className="mt-5 grid gap-3 rounded-md border border-border bg-background p-4">
                <input type="hidden" name="customerId" value={profile.id} />
                <p className="font-semibold">Add vehicle</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <input
                    className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                    name="year"
                    placeholder="Year"
                  />
                  <input
                    className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                    name="make"
                    placeholder="Make"
                  />
                  <input
                    className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                    name="model"
                    placeholder="Model"
                  />
                  <input
                    className="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-primary"
                    name="color"
                    placeholder="Color"
                  />
                  <input
                    className="h-10 rounded-md border border-border bg-card px-3 text-sm uppercase outline-none focus:border-primary"
                    name="licensePlate"
                    placeholder="CZR4821"
                  />
                </div>
                <button
                  className="inline-flex h-10 w-fit items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
                  type="submit"
                >
                  Add vehicle
                </button>
              </form>
            </Section>

            <Section icon={CreditCard} title="Purchase history">
              <div className="grid gap-3">
                {profile.purchases.map((purchase) => (
                  <div className="rounded-md border border-border bg-background p-4" key={purchase.id}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{purchase.description}</p>
                        <p className="mt-1 text-sm text-muted">
                          {purchase.type} · {purchase.vehicleLabel} · {purchase.purchasedAt}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-semibold">{purchase.amount}</p>
                        <p className="text-sm text-muted">{purchase.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <aside className="grid h-fit gap-5">
            <Section icon={MessageSquarePlus} title="Support notes">
              <form action={addSupportNote} className="grid gap-3">
                <input type="hidden" name="customerId" value={profile.id} />
                <textarea
                  className="min-h-28 rounded-md border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                  name="note"
                  placeholder="Add a note from this support interaction"
                />
                <button
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
                  type="submit"
                >
                  Add note
                </button>
              </form>
              <div className="mt-4 grid gap-3">
                {profile.supportNotes.length === 0 ? (
                  <p className="text-sm text-muted">No support notes yet.</p>
                ) : (
                  profile.supportNotes.map((note) => (
                    <div className="rounded-md border border-border bg-background p-3" key={note.id}>
                      <p className="text-sm">{note.note}</p>
                      <p className="mt-2 text-xs text-muted">
                        {note.csrName} · {note.createdAt}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Section>

            <Section icon={FileClock} title="Audit timeline">
              <div className="grid gap-3">
                {profile.auditEvents.map((event) => (
                  <div className="rounded-md border border-border bg-background p-3" key={event.id}>
                    <p className="text-sm font-semibold">{event.type}</p>
                    <p className="mt-1 text-sm">{event.message}</p>
                    <p className="mt-2 text-xs text-muted">
                      {event.actorName} · {event.actorType} · {event.createdAt}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          </aside>
        </div>
      </div>
    </main>
  );
}
