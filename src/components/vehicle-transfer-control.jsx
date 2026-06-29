"use client";

import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Alert, Button } from "@/components/customer/customer-ui.jsx";

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

export function VehicleTransferControl({
  action,
  coveredVehicles,
  customerId,
  subscriptionId,
  vehicles,
}) {
  const [fromVehicleId, setFromVehicleId] = useState(coveredVehicles[0]?.id || "");
  const [toVehicleId, setToVehicleId] = useState("");

  const safeFromVehicleId = useMemo(() => {
    return coveredVehicles.some((vehicle) => vehicle.id === fromVehicleId)
      ? fromVehicleId
      : coveredVehicles[0]?.id || "";
  }, [coveredVehicles, fromVehicleId]);

  const safeToVehicleId = useMemo(() => {
    return vehicles.some((vehicle) => vehicle.id === toVehicleId) ? toVehicleId : "";
  }, [toVehicleId, vehicles]);

  useEffect(() => {
    setFromVehicleId((current) =>
      coveredVehicles.some((vehicle) => vehicle.id === current)
        ? current
        : coveredVehicles[0]?.id || "",
    );

    setToVehicleId((current) =>
      vehicles.some((vehicle) => vehicle.id === current) ? current : "",
    );
  }, [coveredVehicles, vehicles]);

  const canTransfer = Boolean(
    safeFromVehicleId && safeToVehicleId && safeFromVehicleId !== safeToVehicleId,
  );

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="customerId" value={customerId} />
      <input type="hidden" name="subscriptionId" value={subscriptionId} />
      <input type="hidden" name="fromVehicleId" value={safeFromVehicleId} />
      <input type="hidden" name="toVehicleId" value={safeToVehicleId} />

      <div className="grid gap-4 rounded-2xl border border-border bg-card p-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid content-start gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Currently covered vehicle
            </p>
            {coveredVehicles.map((vehicle) => (
              <OptionButton
                key={vehicle.id}
                onClick={() => setFromVehicleId(vehicle.id)}
                selected={safeFromVehicleId === vehicle.id}
              >
                <span>{vehicle.label}</span>
              </OptionButton>
            ))}
          </div>

          <div className="grid content-start gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              New vehicle to cover
            </p>
            {vehicles.map((vehicle) => (
              <OptionButton
                key={vehicle.id}
                onClick={() => setToVehicleId(vehicle.id)}
                selected={safeToVehicleId === vehicle.id}
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
          This removes coverage from the current vehicle and assigns the same membership coverage to
          the new vehicle.
        </Alert>
      </div>

      <div className="flex justify-end">
        <Button disabled={!canTransfer} type="submit">
          Transfer coverage
        </Button>
      </div>
    </form>
  );
}
