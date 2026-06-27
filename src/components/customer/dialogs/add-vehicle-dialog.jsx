"use client";

import { Button, DialogShell, Input, Label } from "../customer-ui.jsx";

export function AddVehicleDialog({ action, customerId, onOpenChange, open }) {
  return (
    <DialogShell
      description="Capture the new vehicle details and attach the vehicle to this customer account."
      onOpenChange={onOpenChange}
      open={open}
      title="Add vehicle"
    >
      <form action={action} className="grid gap-4">
        <input name="customerId" type="hidden" value={customerId} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Label>
            <span>Year</span>
            <Input inputMode="numeric" name="year" placeholder="2025" />
          </Label>
          <Label>
            <span>Make</span>
            <Input name="make" placeholder="Toyota" />
          </Label>
          <Label>
            <span>Model</span>
            <Input name="model" placeholder="Camry" />
          </Label>
          <Label>
            <span>Color</span>
            <Input name="color" placeholder="Silver" />
          </Label>
          <Label className="sm:col-span-2">
            <span>License plate</span>
            <Input className="uppercase" name="licensePlate" placeholder="DFX0396" />
          </Label>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Add vehicle</Button>
        </div>
      </form>
    </DialogShell>
  );
}
