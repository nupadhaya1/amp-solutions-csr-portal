import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { CustomerDashboardLayout } from "@/components/customer/customer-dashboard-layout.jsx";
import {
  addCustomerVehicle,
  cancelCustomerSubscription,
  changeSubscriptionPlan,
  transferSubscriptionVehicle,
  updateCustomerAccount,
} from "@/lib/data/customer-actions";
import { customerInclude } from "@/lib/data/customers";
import { createCustomerDashboardViewModel } from "@/lib/domain/customer-dashboard-view-model.js";
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
            postalCode,
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

async function retryFailedCharge(formData) {
  "use server";

  const customerId = String(formData.get("customerId") || "");

  if (!customerId) {
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
          description: "Monthly membership payment retried by CSR.",
        },
      });

      await tx.subscription.updateMany({
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
          message: "Failed membership payment retried by CSR.",
          metadata: {
            resolvedPayments: resolvedPayments.count,
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
  redirect(`/csr/customers/${customerId}?action=payment-retried`);
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
  const profile = createCustomerDashboardViewModel(customer, plans);

  return (
    <CustomerDashboardLayout
      addSupportNoteAction={addSupportNote}
      addVehicleAction={addVehicle}
      backHref="/csr/customers"
      cancelSubscriptionAction={cancelSubscription}
      changePlanAction={changePlan}
      customer={profile}
      messages={{
        action: String(query?.action || ""),
        note: String(query?.note || ""),
      }}
      plans={plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        monthlyPrice: plan.monthlyPrice.toString(),
      }))}
      retryFailedChargeAction={retryFailedCharge}
      transferVehicleAction={transferVehicleCoverage}
      updateAccountAction={updateAccount}
      updatePaymentAction={updatePaymentMethod}
    />
  );
}
