"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { DialogShell } from "../customer-ui.jsx";

function OptionButton({ children, onClick, selected }) {
  return (
    <button
      className={`flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 text-left text-sm ${
        selected
          ? "border-primary bg-primary/5 font-semibold text-foreground shadow-sm"
          : "border-border bg-surface text-muted hover:border-primary/50 hover:bg-card hover:text-foreground"
      }`}
      onClick={onClick}
      type="button"
    >
      <span>{children}</span>
      {selected ? <Check className="text-primary" size={17} aria-hidden="true" /> : null}
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
  const canAssign = subscriptionId && vehicleId;

  return (
    <DialogShell
      description="Add an uncovered vehicle to a membership plan that still has open capacity."
      onOpenChange={onOpenChange}
      open={open}
      title="Assign vehicle to plan"
      widthClass="sm:max-w-3xl"
    >
      {subscriptions.length > 0 && vehicles.length > 0 ? (
        <form action={action} className="grid gap-3 rounded-2xl border border-border bg-card p-4">
          <input type="hidden" name="customerId" value={customerId} />
          <input type="hidden" name="subscriptionId" value={subscriptionId} />
          <input type="hidden" name="vehicleId" value={vehicleId} />

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="grid gap-2">
              <p className="text-xs font-semibold uppercase text-muted">Plan</p>
              {subscriptions.map((subscription) => (
                <OptionButton
                  key={subscription.id}
                  onClick={() => setSubscriptionId(subscription.id)}
                  selected={subscriptionId === subscription.id}
                >
                  {subscription.planName} · {subscription.coveredVehicleCount} of{" "}
                  {subscription.maxVehicles} covered
                </OptionButton>
              ))}
            </div>
            <div className="grid gap-2">
              <p className="text-xs font-semibold uppercase text-muted">Vehicle</p>
              {vehicles.map((vehicle) => (
                <OptionButton
                  key={vehicle.id}
                  onClick={() => setVehicleId(vehicle.id)}
                  selected={vehicleId === vehicle.id}
                >
                  {vehicle.label} · {vehicle.licensePlate}
                </OptionButton>
              ))}
            </div>
          </div>
          <button
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:border-primary hover:text-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted disabled:opacity-60"
            disabled={!canAssign}
            type="submit"
          >
            Assign vehicle
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted">
          Assignment requires an uncovered vehicle and an active plan with open capacity.
        </p>
      )}
    </DialogShell>
  );
}
