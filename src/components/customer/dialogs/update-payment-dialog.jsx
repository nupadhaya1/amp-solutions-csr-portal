"use client";

import { Alert, Button, DialogShell, Input, Label } from "../customer-ui.jsx";

export function UpdatePaymentDialog({ action, billing, customerId, onOpenChange, open }) {
  return (
    <DialogShell
      description="Store only safe, redacted payment fields. This flow retries any failed membership payment after the update."
      onOpenChange={onOpenChange}
      open={open}
      title="Update payment method"
    >
      <div className="grid gap-4">
        <Alert tone="info">Only card brand, last four, expiration, and ZIP are collected in this demo workflow.</Alert>
        <form action={action} className="grid gap-4">
          <input name="customerId" type="hidden" value={customerId} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Label>
              <span>Card brand</span>
              <Input defaultValue={billing.paymentMethod.brand} name="brand" placeholder="Visa" />
            </Label>
            <Label>
              <span>Last four</span>
              <Input defaultValue={billing.paymentMethod.last4} inputMode="numeric" maxLength={4} name="last4" placeholder="4242" />
            </Label>
            <Label>
              <span>Expiration</span>
              <Input defaultValue={billing.paymentMethod.expiry} name="expiry" placeholder="09/27" />
            </Label>
            <Label>
              <span>Billing ZIP</span>
              <Input inputMode="numeric" maxLength={5} name="postalCode" placeholder="30328" />
            </Label>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save and retry charge</Button>
          </div>
        </form>
      </div>
    </DialogShell>
  );
}
