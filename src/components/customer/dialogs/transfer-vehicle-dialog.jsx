"use client";

import { DialogShell } from "../customer-ui.jsx";
import { VehicleTransferControl } from "@/components/vehicle-transfer-control";

export function TransferVehicleDialog({
  action,
  customerId,
  onOpenChange,
  open,
  subscription,
  vehicles,
}) {
  return (
    <DialogShell
      description="Transfer subscription coverage between vehicles on the same customer account."
      onOpenChange={onOpenChange}
      open={open}
      title="Transfer vehicle"
      widthClass="sm:max-w-3xl"
    >
      {subscription && subscription.coveredVehicles.length > 0 ? (
        <VehicleTransferControl
          action={action}
          coveredVehicles={subscription.coveredVehicles}
          customerId={customerId}
          subscriptionId={subscription.id}
          vehicles={vehicles.map((vehicle) => ({
            id: vehicle.id,
            label: vehicle.label,
            licensePlate: vehicle.licensePlate,
          }))}
        />
      ) : (
        <p className="text-sm text-muted">No subscription coverage is available to transfer.</p>
      )}
    </DialogShell>
  );
}
