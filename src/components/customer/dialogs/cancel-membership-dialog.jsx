"use client";

import { Button, DialogShell, Input } from "../customer-ui.jsx";

export function CancelMembershipDialog({ action, customerId, onOpenChange, open, subscription }) {
  return (
    <DialogShell
      description="Cancel the selected membership and capture the reason in the audit log."
      onOpenChange={onOpenChange}
      open={open}
      title="Cancel membership"
    >
      {subscription ? (
        <form action={action} className="grid gap-4">
          <input name="customerId" type="hidden" value={customerId} />
          <input name="subscriptionId" type="hidden" value={subscription.id} />
          <Input name="reason" placeholder="Reason for cancellation" />
          <div className="flex justify-end">
            <Button tone="danger" type="submit">
              Cancel membership
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted">No active or overdue membership is available to cancel.</p>
      )}
    </DialogShell>
  );
}
