import { PortalShell } from "@/components/portal-shell";
import { listCustomersForSupport } from "@/lib/data/customers";
import { createPortalDashboardViewModel } from "@/lib/domain/dashboard-view-model";

export default async function Home() {
  const customers = await listCustomersForSupport();
  return <PortalShell viewModel={createPortalDashboardViewModel(customers)} />;
}
