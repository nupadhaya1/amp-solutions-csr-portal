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
            <Input inputMode="numeric" max={2035} min={1980} name="year" placeholder="2025" required type="number" />
          </Label>
          <Label>
            <span>Make</span>
            <Input name="make" placeholder="Toyota" required />
          </Label>
          <Label>
            <span>Model</span>
            <Input name="model" placeholder="Camry" required />
          </Label>
          <Label>
            <span>Color</span>
            <Input name="color" placeholder="Silver" required />
          </Label>
          <Label className="sm:col-span-2">
            <span>License plate</span>
            <Input className="uppercase" minLength={2} name="licensePlate" placeholder="DFX0396" required />
          </Label>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Add vehicle</Button>
        </div>
      </form>
    </DialogShell>
  );
}
