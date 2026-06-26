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
    <form action={action} className="grid gap-3 rounded-2xl border border-border bg-card p-4">
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
                className={`flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3 text-left text-sm font-semibold ${
                  selected
                    ? "border-primary bg-primary/5 text-foreground shadow-sm"
                    : "border-border bg-surface text-muted hover:border-primary/50 hover:bg-card hover:text-foreground"
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
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:brightness-95 focus:ring-4 focus:ring-primary/20"
            type="submit"
          >
            Save plan
          </button>
          <button
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:border-primary hover:text-primary focus:ring-4 focus:ring-primary/10"
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
