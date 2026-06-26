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
  changeSubscriptionPlan,
  transferSubscriptionVehicle,
  updateCustomerAccount,
} from "@/lib/data/customer-actions";
import { PlanChangeControl } from "@/components/plan-change-control";
import { VehicleTransferControl } from "@/components/vehicle-transfer-control";
import { MotionPanel } from "@/components/motion-panel";
import { customerInclude } from "@/lib/data/customers";
import { createCustomerProfileViewModel } from "@/lib/domain/customer-profile-view-model";
import { prisma } from "@/lib/prisma";
import { supportNoteSchema } from "@/lib/validation/support-note";

const CSR_NAME = "Bob Roberts";
const cardClass = "rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-200/70";
const innerCardClass = "rounded-2xl border border-border bg-surface p-4";
const inputClass =
  "h-11 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";
const textareaClass =
  "min-h-28 rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";
const primaryButtonClass =
  "inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:brightness-95 focus:ring-4 focus:ring-primary/20";
const dangerButtonClass =
  "inline-flex h-11 items-center justify-center rounded-xl border border-critical px-4 text-sm font-semibold text-critical transition hover:bg-critical-background focus:ring-4 focus:ring-critical/10";
const pillClass = "rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold";

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

async function updatePaymentMethod(formData) {
  "use server";

  const customerId = String(formData.get("customerId") || "");
  const brand = String(formData.get("brand") || "").trim();
  const last4 = String(formData.get("last4") || "").trim();
  const expiry = String(formData.get("expiry") || "").trim();
  const postalCode = String(formData.get("postalCode") || "").trim();

  if (
    !customerId ||
    !/^[A-Za-z ]{2,20}$/.test(brand) ||
    !/^\d{4}$/.test(last4) ||
    !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) ||
    !/^\d{5}$/.test(postalCode)
  ) {
    redirect(`/csr/customers/${customerId}?action=invalid-payment`);
  }

  try {
    await prisma.$transaction(async (tx) => {
      const resolvedPayments = await tx.purchase.updateMany({
        where: {
          customerId,
          type: "MEMBERSHIP_PAYMENT",
          status: "FAILED",
        },
        data: {
          status: "PAID",
          description: "Monthly membership payment resolved after payment method update.",
        },
      });

      const restoredSubscriptions = await tx.subscription.updateMany({
        where: {
          customerId,
          status: "OVERDUE",
        },
        data: {
          status: "ACTIVE",
        },
      });

      await tx.customer.update({
        where: { id: customerId },
        data: {
          status: "ACTIVE",
        },
      });

      await tx.auditEvent.create({
        data: {
          customerId,
          type: "ACCOUNT_UPDATED",
          message: "Payment method updated and failed membership payment retried.",
          metadata: {
            paymentMethod: {
              brand,
              last4,
              expiry,
            },
            resolvedPayments: resolvedPayments.count,
            restoredSubscriptions: restoredSubscriptions.count,
          },
          actorName: CSR_NAME,
          actorType: "CSR",
        },
      });
    });
  } catch {
    redirect(`/csr/customers/${customerId}?action=invalid-payment`);
  }

  revalidatePath(`/csr/customers/${customerId}`);
  redirect(`/csr/customers/${customerId}?action=payment-updated`);
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

async function transferVehicleCoverage(formData) {
  "use server";

  const customerId = String(formData.get("customerId") || "");
  const subscriptionId = String(formData.get("subscriptionId") || "");

  try {
    await transferSubscriptionVehicle({
      prismaClient: prisma,
      customerId,
      subscriptionId,
      actorName: CSR_NAME,
      input: {
        fromVehicleId: String(formData.get("fromVehicleId") || ""),
        toVehicleId: String(formData.get("toVehicleId") || ""),
      },
    });
  } catch {
    redirect(`/csr/customers/${customerId}?action=invalid-transfer`);
  }

  revalidatePath(`/csr/customers/${customerId}`);
  redirect(`/csr/customers/${customerId}?action=subscription-transferred`);
}

async function changePlan(formData) {
  "use server";

  const customerId = String(formData.get("customerId") || "");
  const subscriptionId = String(formData.get("subscriptionId") || "");

  try {
    await changeSubscriptionPlan({
      prismaClient: prisma,
      customerId,
      subscriptionId,
      actorName: CSR_NAME,
      input: {
        planId: String(formData.get("planId") || ""),
      },
    });
  } catch {
    redirect(`/csr/customers/${customerId}?action=invalid-plan`);
  }

  revalidatePath(`/csr/customers/${customerId}`);
  redirect(`/csr/customers/${customerId}?action=plan-changed`);
}

function Section({ children, icon: Icon, title }) {
  return (
    <section className={cardClass}>
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-muted text-primary">
          <Icon size={20} aria-hidden="true" />
        </span>
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

  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: [{ monthlyPrice: "asc" }, { name: "asc" }],
  });
  const profile = createCustomerProfileViewModel(customer);

  return (
    <main className="min-h-screen text-foreground">
      <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <MotionPanel className="rounded-3xl border border-border bg-card p-6 shadow-sm shadow-slate-200/70">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-primary"
                href="/?tab=customers"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back to customer lookup
              </Link>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {profile.fullName}
              </h1>
              <p className="mt-2 text-sm text-muted">
                {profile.email} · {profile.phone}
              </p>
            </div>
            <span className={`${pillClass} w-fit bg-surface`}>
              {profile.status}
            </span>
          </header>
        </MotionPanel>

        {profile.criticalIssue ? (
          <section className="mt-6 rounded-2xl border border-critical/30 bg-critical-background p-5 shadow-sm shadow-red-100/70">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-card text-critical">
                <ShieldAlert size={24} aria-hidden="true" />
              </span>
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
          <div className="mt-6 rounded-2xl border border-success/30 bg-success-background p-4 text-sm font-semibold text-success">
            Support note added and audit timeline updated.
          </div>
        ) : null}

        {query?.action ? (
          <div className={`mt-6 rounded-2xl border p-4 text-sm font-semibold ${
            query.action?.startsWith("invalid")
              ? "border-critical/30 bg-critical-background text-critical"
              : "border-success/30 bg-success-background text-success"
          }`}>
            {query.action === "account-updated"
              ? "Customer account updated and audit timeline updated."
              : null}
            {query.action === "vehicle-added"
              ? "Vehicle added and audit timeline updated."
              : null}
            {query.action === "subscription-cancelled"
              ? "Subscription cancelled and audit timeline updated."
              : null}
            {query.action === "subscription-transferred"
              ? "Subscription coverage transferred and audit timeline updated."
              : null}
            {query.action === "plan-changed"
              ? "Subscription plan changed and audit timeline updated."
              : null}
            {query.action === "payment-updated"
              ? "Payment method marked valid, failed membership payment retried, and audit timeline updated."
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
                      className={inputClass}
                      defaultValue={customer.firstName}
                      name="firstName"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Last name</span>
                    <input
                      className={inputClass}
                      defaultValue={customer.lastName}
                      name="lastName"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Email</span>
                    <input
                      className={inputClass}
                      defaultValue={profile.email}
                      name="email"
                      type="email"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold">Phone</span>
                    <input
                      className={inputClass}
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
                    className={primaryButtonClass}
                    type="submit"
                  >
                    Save account
                  </button>
                </div>
              </form>
            </Section>

            <Section icon={CreditCard} title="Payment method">
              <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
                <div className={innerCardClass}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {profile.paymentSummary.cardBrand} ending {profile.paymentSummary.cardLast4}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        Expires {profile.paymentSummary.cardExpiry}
                      </p>
                    </div>
                    <span
                      className={`${pillClass} ${
                        profile.paymentSummary.hasFailedPayment
                          ? "border-critical/30 bg-critical-background text-critical"
                          : "border-success/30 bg-success-background text-success"
                      }`}
                    >
                      {profile.paymentSummary.status}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-muted">
                    Latest failed membership payment: {profile.paymentSummary.latestFailedPayment}
                  </p>
                </div>

                <form action={updatePaymentMethod} className="grid gap-3 rounded-2xl border border-border bg-surface p-4">
                  <input type="hidden" name="customerId" value={profile.id} />
                  <div>
                    <p className="font-semibold">Update payment and retry</p>
                    <p className="mt-1 text-sm text-muted">
                      Demo-safe fields only. Do not enter a full card number.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-sm font-semibold">Card brand</span>
                      <input
                        className={inputClass}
                        defaultValue={profile.paymentSummary.cardBrand}
                        name="brand"
                        placeholder="Visa"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-semibold">Last four</span>
                      <input
                        className={inputClass}
                        defaultValue={profile.paymentSummary.cardLast4}
                        inputMode="numeric"
                        maxLength={4}
                        name="last4"
                        placeholder="4242"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-semibold">Expiry</span>
                      <input
                        className={inputClass}
                        defaultValue={profile.paymentSummary.cardExpiry}
                        name="expiry"
                        placeholder="12/29"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-semibold">Billing ZIP</span>
                      <input
                        className={inputClass}
                        inputMode="numeric"
                        maxLength={5}
                        name="postalCode"
                        placeholder="90210"
                      />
                    </label>
                  </div>
                  <button className={`${primaryButtonClass} w-fit`} type="submit">
                    Mark payment valid and retry
                  </button>
                </form>
              </div>
            </Section>

            <Section icon={CarFront} title="Vehicles and subscriptions">
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="grid gap-3">
                  {profile.vehicles.map((vehicle) => (
                    <div className={innerCardClass} key={vehicle.id}>
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
                    <div className={innerCardClass} key={subscription.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{subscription.planName}</p>
                          <p className="mt-1 text-sm text-muted">
                            {subscription.monthlyPrice} · {subscription.cleaningTier}
                          </p>
                        </div>
                        <span className={pillClass}>
                          {subscription.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-muted">
                        Next billing: {subscription.nextBillingDate}
                      </p>
                      <p className="mt-2 text-sm">
                        Covers {subscription.coveredVehicles.length} of {subscription.maxVehicles} vehicles
                      </p>
                      {subscription.coveredVehicles.length > 0 ? (
                        <ul className="mt-2 grid gap-1 text-sm text-muted">
                          {subscription.coveredVehicles.map((vehicle) => (
                            <li key={vehicle.id}>{vehicle.label}</li>
                          ))}
                        </ul>
                      ) : null}
                      {subscription.status !== "CANCELLED" ? (
                        <div className="mt-4 grid gap-4">
                          <PlanChangeControl
                            action={changePlan}
                            customerId={profile.id}
                            plans={plans.map((plan) => ({
                              id: plan.id,
                              name: plan.name,
                              monthlyPrice: plan.monthlyPrice.toString(),
                            }))}
                            subscriptionId={subscription.id}
                            subscriptionPlanId={subscription.planId}
                          />

                          {subscription.coveredVehicles.length > 0 && profile.vehicles.length > 1 ? (
                            <VehicleTransferControl
                              action={transferVehicleCoverage}
                              coveredVehicles={subscription.coveredVehicles}
                              customerId={profile.id}
                              subscriptionId={subscription.id}
                              vehicles={profile.vehicles}
                            />
                          ) : null}

                          <form
                            action={cancelSubscription}
                            className="grid gap-3 rounded-2xl border border-critical/20 bg-critical-background/50 p-4"
                          >
                            <p className="text-sm font-semibold text-critical">
                              Cancel subscription
                            </p>
                            <input type="hidden" name="customerId" value={profile.id} />
                            <input type="hidden" name="subscriptionId" value={subscription.id} />
                            <input
                              className={inputClass}
                              name="reason"
                              placeholder="Cancellation reason"
                            />
                            <button
                              className={dangerButtonClass}
                              type="submit"
                            >
                              Cancel subscription
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
              <form action={addVehicle} className="mt-5 grid gap-3 rounded-2xl border border-border bg-surface p-4">
                <input type="hidden" name="customerId" value={profile.id} />
                <p className="font-semibold">Add vehicle</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <input
                    className={inputClass}
                    name="year"
                    placeholder="Year"
                  />
                  <input
                    className={inputClass}
                    name="make"
                    placeholder="Make"
                  />
                  <input
                    className={inputClass}
                    name="model"
                    placeholder="Model"
                  />
                  <input
                    className={inputClass}
                    name="color"
                    placeholder="Color"
                  />
                  <input
                    className={`${inputClass} uppercase`}
                    name="licensePlate"
                    placeholder="CZR4821"
                  />
                </div>
                <button
                  className={`${primaryButtonClass} w-fit`}
                  type="submit"
                >
                  Add vehicle
                </button>
              </form>
            </Section>

            <Section icon={CreditCard} title="Purchase history">
              <div className="grid gap-3">
                {profile.purchases.map((purchase) => (
                  <div className={innerCardClass} key={purchase.id}>
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
                  className={textareaClass}
                  name="note"
                  placeholder="Add a note from this support interaction"
                />
                <button
                  className={primaryButtonClass}
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
                    <div className="rounded-2xl border border-border bg-surface p-3" key={note.id}>
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
                  <div className="rounded-2xl border border-border bg-surface p-3" key={event.id}>
                    <p className="text-sm font-semibold">{event.type}</p>
                    <p className="mt-1 text-sm">{event.message}</p>
                    {event.detail ? (
                      <p className="mt-2 rounded-xl border border-border bg-card p-3 text-sm">
                        {event.detail}
                      </p>
                    ) : null}
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
