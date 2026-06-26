"use client";

import { Check } from "lucide-react";
import { useState } from "react";

export function PlanChangeControl({
  action,
  customerId,
  plans,
  subscriptionId,
  subscriptionPlanId,
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(subscriptionPlanId);
  const isDirty = selectedPlanId !== subscriptionPlanId;

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="customerId" value={customerId} />
      <input type="hidden" name="subscriptionId" value={subscriptionId} />
      <input type="hidden" name="planId" value={selectedPlanId} />

      <div className="grid gap-2">
        <p className="text-sm font-semibold">Change plan</p>
        <div className="grid gap-2">
          {plans.map((plan) => {
            const selected = selectedPlanId === plan.id;
            return (
              <button
                className={`flex min-h-12 items-center justify-between gap-3 rounded-md border px-3 text-left text-sm font-semibold transition ${
                  selected
                    ? "border-primary bg-background text-foreground"
                    : "border-border bg-card text-muted hover:border-primary hover:text-foreground"
                }`}
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
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

      {isDirty ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
            type="submit"
          >
            Save plan
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold transition hover:border-primary hover:text-primary"
            onClick={() => setSelectedPlanId(subscriptionPlanId)}
            type="button"
          >
            Cancel change
          </button>
        </div>
      ) : null}
    </form>
  );
}
