import { CustomerTable } from "@/components/customer-table";
import { CustomerWorkspaceTabs } from "@/components/customer-workspace-tabs";
import { MotionPanel } from "@/components/motion-panel";
import { listCustomersForSupport } from "@/lib/data/customers";
import { getCustomerLookupResults } from "@/lib/domain/customer-lookup-view-model";
import { createCustomerTableViewModel } from "@/lib/domain/customer-table-view-model";

export default async function CustomerLookupPage({ searchParams }) {
  const params = await searchParams;
  const filters = {
    q: params?.q || "",
    name: params?.name || "",
    email: params?.email || "",
    phone: params?.phone || "",
    licensePlate: params?.licensePlate || "",
  };
  const customers = await listCustomersForSupport();
  const customerResults = getCustomerLookupResults(customers, filters);
  const tableViewModel = createCustomerTableViewModel(customerResults, {
    totalCustomers: customers.length,
    activeFilters: filters,
  });

  return (
    <MotionPanel className="grid gap-4">
      <CustomerWorkspaceTabs activeTab="customers" />
      <CustomerTable
        filters={filters}
        rows={tableViewModel.rows}
        summary={tableViewModel.summary}
      />
    </MotionPanel>
  );
}
