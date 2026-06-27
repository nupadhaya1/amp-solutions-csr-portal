"use client";

import { DialogShell } from "../customer-ui.jsx";
import { PlanChangeControl } from "@/components/plan-change-control";

export function ChangePlanDialog({
  action,
  onOpenChange,
  open,
  plans,
  subscription,
  customerId,
}) {
  return (
    <DialogShell
      description="Select a replacement membership plan for the currently selected subscription."
      onOpenChange={onOpenChange}
      open={open}
      title="Change plan"
      widthClass="sm:max-w-2xl"
    >
      {subscription ? (
        <PlanChangeControl
          action={action}
          customerId={customerId}
          plans={plans}
          subscriptionId={subscription.id}
          subscriptionPlanId={subscription.planId}
        />
      ) : (
        <p className="text-sm text-muted">No active or overdue subscription is available for a plan change.</p>
      )}
    </DialogShell>
  );
}
