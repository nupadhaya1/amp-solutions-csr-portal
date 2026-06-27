import { Alert, Badge, Button, Card, CardContent, CardHeader, CardTitle } from "./customer-ui.jsx";

function BillingRow({ label, value, subtle }) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={subtle ? "text-sm text-muted" : "text-sm font-medium text-foreground"}>{value}</p>
    </div>
  );
}

export function PaymentBillingCard({ billing, onUpdatePayment, onRetryPayment }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Payment &amp; billing</CardTitle>
          <Badge tone={billing.badgeTone}>{billing.paymentStatus === "OVERDUE" ? "Overdue" : "Current"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {billing.paymentStatus === "OVERDUE" ? (
          <Alert tone="critical">
            Payment is overdue. The account may be unable to wash until the failed membership payment is resolved.
          </Alert>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-surface p-4">
            <BillingRow label="Payment method" value={`${billing.paymentMethod.label} · Expires ${billing.expiresAt}`} />
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <BillingRow label="Next billing date" value={billing.nextBillingDate} />
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <BillingRow
              label="Last successful charge"
              value={
                billing.lastSuccessfulCharge
                  ? `${billing.lastSuccessfulCharge.amount} · ${billing.lastSuccessfulCharge.date}`
                  : "No successful membership charge yet"
              }
              subtle={!billing.lastSuccessfulCharge}
            />
          </div>
          <div className="rounded-2xl bg-surface p-4">
            <BillingRow
              label="Last failed charge"
              value={
                billing.lastFailedCharge
                  ? `${billing.lastFailedCharge.amount} · ${billing.lastFailedCharge.date} · ${billing.lastFailedCharge.reason}`
                  : "No failed charge on record"
              }
              subtle={!billing.lastFailedCharge}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={onUpdatePayment} type="button">Update payment method</Button>
          <Button
            disabled={!billing.retryEligible}
            onClick={onRetryPayment}
            title={billing.retryEligible ? "Retry the failed membership charge" : billing.retryLabel}
            tone="secondary"
            type="button"
          >
            Retry failed charge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
