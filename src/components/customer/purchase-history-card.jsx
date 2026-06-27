import { Badge, Card, CardContent, CardHeader, CardTitle } from "./customer-ui.jsx";

function PurchaseRow({ purchase }) {
  return (
    <article className="rounded-2xl bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{purchase.description}</p>
            <Badge tone={purchase.statusTone}>{purchase.statusLabel}</Badge>
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted">{purchase.typeLabel}</p>
          <p className="mt-2 text-sm text-muted">{purchase.vehicleLabel}</p>
          {purchase.subscriptionPlanName ? (
            <p className="mt-1 text-sm text-muted">{purchase.subscriptionPlanName}</p>
          ) : null}
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <p className="text-sm font-semibold text-foreground">{purchase.amount}</p>
          <p className="mt-1 text-xs text-muted">{purchase.purchasedAt}</p>
        </div>
      </div>
    </article>
  );
}

export function PurchaseHistoryCard({ purchases }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {purchases.length === 0 ? (
          <p className="text-sm text-muted">No purchase history is on record yet.</p>
        ) : (
          purchases.map((purchase) => <PurchaseRow key={purchase.id} purchase={purchase} />)
        )}
      </CardContent>
    </Card>
  );
}
