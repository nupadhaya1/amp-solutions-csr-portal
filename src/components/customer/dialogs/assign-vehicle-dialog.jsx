"use client";

import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Alert, Button, DialogShell } from "../customer-ui.jsx";

function OptionButton({ children, onClick, selected }) {
  return (
    <button
      aria-pressed={selected}
      className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-3 text-left text-sm transition ${
        selected
          ? "border-primary bg-primary/5 font-semibold text-foreground shadow-sm"
          : "border-border bg-surface text-muted hover:border-primary/50 hover:bg-card hover:text-foreground"
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="min-w-0">{children}</span>
      {selected ? <Check className="shrink-0 text-primary" size={17} aria-hidden="true" /> : null}
    </button>
  );
}

export function AssignVehicleDialog({
  action,
  customerId,
  onOpenChange,
  open,
  subscriptions,
  vehicles,
}) {
  const [subscriptionId, setSubscriptionId] = useState(subscriptions[0]?.id || "");
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || "");

  const safeSubscriptionId = useMemo(() => {
    return subscriptions.some((subscription) => subscription.id === subscriptionId)
      ? subscriptionId
      : subscriptions[0]?.id || "";
  }, [subscriptionId, subscriptions]);

  const safeVehicleId = useMemo(() => {
    return vehicles.some((vehicle) => vehicle.id === vehicleId) ? vehicleId : vehicles[0]?.id || "";
  }, [vehicleId, vehicles]);

  useEffect(() => {
    if (!open) return;

    setSubscriptionId((current) =>
      subscriptions.some((subscription) => subscription.id === current)
        ? current
        : subscriptions[0]?.id || "",
    );

    setVehicleId((current) =>
      vehicles.some((vehicle) => vehicle.id === current) ? current : vehicles[0]?.id || "",
    );
  }, [open, subscriptions, vehicles]);

  const canAssign = Boolean(safeSubscriptionId && safeVehicleId);

  return (
    <DialogShell
      description="Add an uncovered vehicle to a membership plan that still has open capacity."
      onOpenChange={onOpenChange}
      open={open}
      title="Assign vehicle to plan"
      widthClass="sm:max-w-3xl"
    >
      {subscriptions.length > 0 && vehicles.length > 0 ? (
        <form action={action} className="grid gap-4">
          <input type="hidden" name="customerId" value={customerId} />
          <input type="hidden" name="subscriptionId" value={safeSubscriptionId} />
          <input type="hidden" name="vehicleId" value={safeVehicleId} />

          <div className="grid gap-4 rounded-2xl border border-border bg-card p-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="grid content-start gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Plan with open slot
                </p>
                {subscriptions.map((subscription) => (
                  <OptionButton
                    key={subscription.id}
                    onClick={() => setSubscriptionId(subscription.id)}
                    selected={safeSubscriptionId === subscription.id}
                  >
                    <span className="grid gap-0.5">
                      <span>{subscription.planName}</span>
                      <span className="text-xs font-medium text-muted">
                        {subscription.coveredVehicleCount} of {subscription.maxVehicles} covered ·{" "}
                        {subscription.openSlots} open{" "}
                        {subscription.openSlots === 1 ? "slot" : "slots"}
                      </span>
                    </span>
                  </OptionButton>
                ))}
              </div>

              <div className="grid content-start gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Uncovered vehicle
                </p>
                {vehicles.map((vehicle) => (
                  <OptionButton
                    key={vehicle.id}
                    onClick={() => setVehicleId(vehicle.id)}
                    selected={safeVehicleId === vehicle.id}
                  >
                    <span className="grid gap-0.5">
                      <span>{vehicle.label}</span>
                      <span className="text-xs font-medium text-muted">
                        Plate {vehicle.licensePlate}
                      </span>
                    </span>
                  </OptionButton>
                ))}
              </div>
            </div>

            <Alert tone="info">
              This assigns membership coverage to the selected vehicle without changing the
              customer&apos;s plan.
            </Alert>
          </div>

          <div className="flex justify-end">
            <Button disabled={!canAssign} type="submit">
              Assign vehicle
            </Button>
          </div>
        </form>
      ) : (
        <Alert tone="warning">
          Assignment requires an uncovered vehicle and an active plan with open capacity.
        </Alert>
      )}
    </DialogShell>
  );
}
