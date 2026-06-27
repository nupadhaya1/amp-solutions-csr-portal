"use client";

import { startTransition, useMemo, useState } from "react";
import { toast } from "sonner";

import { CustomerActionPanel } from "./customer-action-panel.jsx";
import { CustomerSummaryCard } from "./customer-summary-card.jsx";
import { PaymentBillingCard } from "./payment-billing-card.jsx";
import { RecommendedNextStepsCard } from "./recommended-next-steps-card.jsx";
import { RecentActivityTimeline } from "./recent-activity-timeline.jsx";
import { SupportNotesCard } from "./support-notes-card.jsx";
import { VehicleSubscriptionCard } from "./vehicle-subscription-card.jsx";
import { Alert, Badge } from "./customer-ui.jsx";
import { AddVehicleDialog } from "./dialogs/add-vehicle-dialog.jsx";
import { AllActivityDialog } from "./dialogs/all-activity-dialog.jsx";
import { AllNotesDialog } from "./dialogs/all-notes-dialog.jsx";
import { CancelMembershipDialog } from "./dialogs/cancel-membership-dialog.jsx";
import { ChangePlanDialog } from "./dialogs/change-plan-dialog.jsx";
import { EditAccountDialog } from "./dialogs/edit-account-dialog.jsx";
import { TransferVehicleDialog } from "./dialogs/transfer-vehicle-dialog.jsx";
import { UpdatePaymentDialog } from "./dialogs/update-payment-dialog.jsx";

const successMessages = {
  "account-updated": "Customer account updated and audit timeline refreshed.",
  "vehicle-added": "Vehicle added and audit timeline refreshed.",
  "subscription-cancelled": "Membership cancelled and audit timeline refreshed.",
  "subscription-transferred": "Vehicle coverage transferred and audit timeline refreshed.",
  "plan-changed": "Membership plan updated and audit timeline refreshed.",
  "payment-updated": "Payment method updated, failed membership payment retried, and audit timeline refreshed.",
  "payment-retried": "Failed membership payment retried and audit timeline refreshed.",
};

export function CustomerDashboardLayout({
  addSupportNoteAction,
  addVehicleAction,
  backHref,
  customer,
  messages,
  plans,
  retryFailedChargeAction,
  updateAccountAction,
  updatePaymentAction,
  cancelSubscriptionAction,
  changePlanAction,
  transferVehicleAction,
}) {
  const [openDialog, setOpenDialog] = useState(null);
  const primarySubscription = useMemo(
    () => customer.subscriptions.find((subscription) => ["ACTIVE", "OVERDUE"].includes(subscription.status)) || null,
    [customer.subscriptions],
  );

  function handleWorkflowAction(action) {
    if (action === "open-billing-docs") {
      toast.info("Billing docs are not wired yet.");
      return;
    }

    if (action === "add-note") {
      setOpenDialog("add-note");
      return;
    }

    const dialogMap = {
      "edit-account": "edit-account",
      "add-vehicle": "add-vehicle",
      "change-plan": "change-plan",
      "transfer-vehicle": "transfer-vehicle",
      "cancel-membership": "cancel-membership",
      "update-payment": "update-payment",
    };

    setOpenDialog(dialogMap[action] || null);
  }

  async function handleRetryPayment() {
    const formData = new FormData();
    formData.set("customerId", customer.id);
    startTransition(async () => {
      await retryFailedChargeAction(formData);
    });
  }

  return (
    <>
      <div className="space-y-4">
        {messages.note === "added" ? (
          <Alert tone="success">Support note added and audit timeline refreshed.</Alert>
        ) : null}
        {messages.action ? (
          <Alert tone={messages.action.startsWith("invalid") ? "critical" : "success"}>
            {messages.action.startsWith("invalid")
              ? "Action could not be completed. Check the form details and try again."
              : successMessages[messages.action]}
          </Alert>
        ) : null}

        {customer.status === "OVERDUE" ? (
          <Alert tone="critical">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">Account requires payment follow-up</p>
                <p className="text-sm">
                  Overdue subscriptions or failed membership payments may be blocking wash access.
                </p>
              </div>
              <Badge tone="critical">Needs attention</Badge>
            </div>
          </Alert>
        ) : null}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
          <CustomerSummaryCard backHref={backHref} customer={customer} />
          <CustomerActionPanel customer={customer} onAction={handleWorkflowAction} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
          <main className="space-y-4">
            <VehicleSubscriptionCard customer={customer} />
            <PaymentBillingCard
              billing={customer.billing}
              onRetryPayment={handleRetryPayment}
              onUpdatePayment={() => handleWorkflowAction("update-payment")}
            />
            <SupportNotesCard
              addSupportNoteAction={addSupportNoteAction}
              customerId={customer.id}
              notes={customer.supportNotesPreview}
              noteDialogOpen={openDialog === "add-note"}
              onNoteDialogChange={(nextOpen) => setOpenDialog(nextOpen ? "add-note" : null)}
              onViewAll={() => setOpenDialog("all-notes")}
            />
          </main>

          <aside className="space-y-4">
            <RecentActivityTimeline
              events={customer.recentActivityPreview}
              onViewAll={() => setOpenDialog("all-activity")}
            />
            <RecommendedNextStepsCard nextStep={customer.recommendedNextStep} onAction={handleWorkflowAction} />
          </aside>
        </div>
      </div>

      <EditAccountDialog
        action={updateAccountAction}
        customer={customer}
        onOpenChange={(nextOpen) => setOpenDialog(nextOpen ? "edit-account" : null)}
        open={openDialog === "edit-account"}
      />
      <AddVehicleDialog
        action={addVehicleAction}
        customerId={customer.id}
        onOpenChange={(nextOpen) => setOpenDialog(nextOpen ? "add-vehicle" : null)}
        open={openDialog === "add-vehicle"}
      />
      <UpdatePaymentDialog
        action={updatePaymentAction}
        billing={customer.billing}
        customerId={customer.id}
        onOpenChange={(nextOpen) => setOpenDialog(nextOpen ? "update-payment" : null)}
        open={openDialog === "update-payment"}
      />
      <ChangePlanDialog
        action={changePlanAction}
        customerId={customer.id}
        onOpenChange={(nextOpen) => setOpenDialog(nextOpen ? "change-plan" : null)}
        open={openDialog === "change-plan"}
        plans={plans}
        subscription={primarySubscription}
      />
      <TransferVehicleDialog
        action={transferVehicleAction}
        customerId={customer.id}
        onOpenChange={(nextOpen) => setOpenDialog(nextOpen ? "transfer-vehicle" : null)}
        open={openDialog === "transfer-vehicle"}
        subscription={primarySubscription}
        vehicles={customer.vehiclesWithSubscriptions}
      />
      <CancelMembershipDialog
        action={cancelSubscriptionAction}
        customerId={customer.id}
        onOpenChange={(nextOpen) => setOpenDialog(nextOpen ? "cancel-membership" : null)}
        open={openDialog === "cancel-membership"}
        subscription={primarySubscription}
      />
      <AllNotesDialog
        notes={customer.supportNotesAll}
        onOpenChange={(nextOpen) => setOpenDialog(nextOpen ? "all-notes" : null)}
        open={openDialog === "all-notes"}
      />
      <AllActivityDialog
        events={customer.activityAll}
        onOpenChange={(nextOpen) => setOpenDialog(nextOpen ? "all-activity" : null)}
        open={openDialog === "all-activity"}
      />
    </>
  );
}
