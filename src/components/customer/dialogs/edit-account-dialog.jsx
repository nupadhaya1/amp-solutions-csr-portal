"use client";

import { Button, DialogShell, Input, Label } from "../customer-ui.jsx";

export function EditAccountDialog({ action, customer, onOpenChange, open }) {
  return (
    <DialogShell
      description="Update the core account details while preserving the current customer record."
      onOpenChange={onOpenChange}
      open={open}
      title="Edit account"
    >
      <form action={action} className="grid gap-4">
        <input name="customerId" type="hidden" value={customer.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Label>
            <span>First name</span>
            <Input defaultValue={customer.firstName} name="firstName" />
          </Label>
          <Label>
            <span>Last name</span>
            <Input defaultValue={customer.lastName} name="lastName" />
          </Label>
          <Label>
            <span>Email</span>
            <Input defaultValue={customer.email} name="email" type="email" />
          </Label>
          <Label>
            <span>Phone</span>
            <Input defaultValue={customer.phone} name="phone" />
          </Label>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save account</Button>
        </div>
      </form>
    </DialogShell>
  );
}
