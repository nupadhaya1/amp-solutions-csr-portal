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
  const coveredVehicleIds = new Set(subscription?.coveredVehicles.map((vehicle) => vehicle.id) || []);
  const uncoveredVehicles = vehicles.filter((vehicle) => !coveredVehicleIds.has(vehicle.id));

  return (
    <DialogShell
      description="Transfer subscription coverage between vehicles on the same customer account."
      onOpenChange={onOpenChange}
      open={open}
      title="Transfer vehicle"
      widthClass="sm:max-w-3xl"
    >
      {subscription && subscription.coveredVehicles.length > 0 && uncoveredVehicles.length > 0 ? (
        <VehicleTransferControl
          action={action}
          coveredVehicles={subscription.coveredVehicles}
          customerId={customerId}
          subscriptionId={subscription.id}
          vehicles={uncoveredVehicles.map((vehicle) => ({
            id: vehicle.id,
            label: vehicle.label,
            licensePlate: vehicle.licensePlate,
          }))}
        />
      ) : (
        <p className="text-sm text-muted">Transfer requires one covered vehicle and one uncovered vehicle on this account.</p>
      )}
    </DialogShell>
  );
}
