"use client";

import { Check } from "lucide-react";
import { useState } from "react";

export function PlanChangeControl({
  action,
  alwaysShowSubmit = false,
  coveredVehicles = [],
  customerId,
  plans,
  submitLabel = "Save plan",
  subscriptionId,
  subscriptionPlanId,
  title = "Change plan",
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(subscriptionPlanId);
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || null;
  const maxVehicles = Number(selectedPlan?.maxVehicles || 0);
  const requiresVehicleChoice = coveredVehicles.length > maxVehicles;
  const [keepVehicleIds, setKeepVehicleIds] = useState(
    coveredVehicles.slice(0, Math.max(0, maxVehicles)).map((vehicle) => vehicle.id),
  );
  const isDirty = selectedPlanId !== subscriptionPlanId;
  const canSubmit =
    selectedPlanId &&
    (!requiresVehicleChoice || keepVehicleIds.length === maxVehicles);

  function handlePlanSelect(plan) {
    const nextMaxVehicles = Number(plan.maxVehicles || 0);
    setSelectedPlanId(plan.id);
    setKeepVehicleIds((current) => {
      const currentCoveredIds = new Set(coveredVehicles.map((vehicle) => vehicle.id));
      const validCurrent = current.filter((vehicleId) => currentCoveredIds.has(vehicleId));
      const fallback = coveredVehicles.map((vehicle) => vehicle.id);
      return (validCurrent.length > 0 ? validCurrent : fallback).slice(0, nextMaxVehicles);
    });
  }

  function handleKeepVehicleToggle(vehicleId) {
    setKeepVehicleIds((current) => {
      if (current.includes(vehicleId)) {
        return current.filter((id) => id !== vehicleId);
      }

      return [...current, vehicleId].slice(-maxVehicles);
    });
  }

  return (
    <form action={action} className="grid gap-3 rounded-2xl border border-border bg-card p-4">
      <input type="hidden" name="customerId" value={customerId} />
      <input type="hidden" name="subscriptionId" value={subscriptionId} />
      <input type="hidden" name="planId" value={selectedPlanId} />
      {keepVehicleIds.map((vehicleId) => (
        <input key={vehicleId} type="hidden" name="keepVehicleIds" value={vehicleId} />
      ))}

      <div className="grid gap-2">
        <p className="text-sm font-semibold">{title}</p>
        <div className="grid gap-2">
          {plans.map((plan) => {
            const selected = selectedPlanId === plan.id;
            return (
              <button
                className={`flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3 text-left text-sm font-semibold ${
                  selected
                    ? "border-primary bg-primary/5 text-foreground shadow-sm"
                    : "border-border bg-surface text-muted hover:border-primary/50 hover:bg-card hover:text-foreground"
                }`}
                key={plan.id}
                onClick={() => handlePlanSelect(plan)}
                type="button"
              >
                <span>
                  {plan.name} · ${Number(plan.monthlyPrice).toFixed(2)}
                </span>
                {selected ? <Check className="text-primary" size={18} aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      {requiresVehicleChoice ? (
        <div className="grid gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-950">
            Choose {maxVehicles === 1 ? "the vehicle" : `${maxVehicles} vehicles`} to keep on this plan
          </p>
          <div className="grid gap-2">
            {coveredVehicles.map((vehicle) => {
              const selected = keepVehicleIds.includes(vehicle.id);
              return (
                <button
                  className={`flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3 text-left text-sm ${
                    selected
                      ? "border-primary bg-white font-semibold text-foreground shadow-sm"
                      : "border-amber-200 bg-amber-100/60 text-amber-950 hover:bg-white"
                  }`}
                  key={vehicle.id}
                  onClick={() => handleKeepVehicleToggle(vehicle.id)}
                  type="button"
                >
                  <span>{vehicle.label}</span>
                  {selected ? <Check className="text-primary" size={17} aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {alwaysShowSubmit || isDirty ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:brightness-95 focus:ring-4 focus:ring-primary/20"
            disabled={!canSubmit}
            type="submit"
          >
            {submitLabel}
          </button>
          <button
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:border-primary hover:text-primary focus:ring-4 focus:ring-primary/10"
            onClick={() => {
              const currentPlan = plans.find((plan) => plan.id === subscriptionPlanId) || null;
              const currentMaxVehicles = Number(currentPlan?.maxVehicles || 0);
              setSelectedPlanId(subscriptionPlanId);
              setKeepVehicleIds(
                coveredVehicles.slice(0, Math.max(0, currentMaxVehicles)).map((vehicle) => vehicle.id),
              );
            }}
            type="button"
          >
            Cancel change
          </button>
        </div>
      ) : null}
    </form>
  );
}
