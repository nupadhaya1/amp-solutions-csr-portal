"use client";

import { Check } from "lucide-react";
import { useState } from "react";

function OptionButton({ children, onClick, selected }) {
  return (
    <button
      className={`flex min-h-11 items-center justify-between gap-3 rounded-md border px-3 text-left text-sm transition ${
        selected
          ? "border-primary bg-background font-semibold text-foreground"
          : "border-border bg-card text-muted hover:border-primary hover:text-foreground"
      }`}
      onClick={onClick}
      type="button"
    >
      <span>{children}</span>
      {selected ? <Check className="text-primary" size={17} aria-hidden="true" /> : null}
    </button>
  );
}

export function VehicleTransferControl({
  action,
  coveredVehicles,
  customerId,
  subscriptionId,
  vehicles,
}) {
  const [fromVehicleId, setFromVehicleId] = useState(coveredVehicles[0]?.id || "");
  const [toVehicleId, setToVehicleId] = useState("");
  const canTransfer = fromVehicleId && toVehicleId && fromVehicleId !== toVehicleId;

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="customerId" value={customerId} />
      <input type="hidden" name="subscriptionId" value={subscriptionId} />
      <input type="hidden" name="fromVehicleId" value={fromVehicleId} />
      <input type="hidden" name="toVehicleId" value={toVehicleId} />

      <p className="text-sm font-semibold">Transfer coverage</p>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase text-muted">From vehicle</p>
          {coveredVehicles.map((vehicle) => (
            <OptionButton
              key={vehicle.id}
              onClick={() => setFromVehicleId(vehicle.id)}
              selected={fromVehicleId === vehicle.id}
            >
              {vehicle.label}
            </OptionButton>
          ))}
        </div>
        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase text-muted">To vehicle</p>
          {vehicles.map((vehicle) => (
            <OptionButton
              key={vehicle.id}
              onClick={() => setToVehicleId(vehicle.id)}
              selected={toVehicleId === vehicle.id}
            >
              {vehicle.label} · {vehicle.licensePlate}
            </OptionButton>
          ))}
        </div>
      </div>
      <button
        className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!canTransfer}
        type="submit"
      >
        Transfer coverage
      </button>
    </form>
  );
}
