"use client";

import { DialogShell } from "../customer-ui.jsx";
import { PlanChangeControl } from "@/components/plan-change-control";

export function StartMembershipDialog({
  action,
  customerId,
  onOpenChange,
  open,
  plans,
  subscription,
}) {
  return (
    <DialogShell
      description="Select the membership plan to restart for this customer."
      onOpenChange={onOpenChange}
      open={open}
      title="Start membership"
      widthClass="sm:max-w-2xl"
    >
      {subscription ? (
        <PlanChangeControl
          action={action}
          alwaysShowSubmit
          customerId={customerId}
          plans={plans}
          submitLabel="Start membership"
          subscriptionId={subscription.id}
          subscriptionPlanId={subscription.planId}
          title="Membership plan"
        />
      ) : (
        <p className="text-sm text-muted">No cancelled membership is available to restart.</p>
      )}
    </DialogShell>
  );
}
