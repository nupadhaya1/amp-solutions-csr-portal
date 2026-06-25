import { createDashboardSummary } from "@/lib/domain/dashboard-summary";
import { listCustomersForSupport } from "@/lib/data/customers";
import { fail, ok } from "@/lib/api/responses";

export async function GET() {
  try {
    const customers = await listCustomersForSupport();
    const summary = createDashboardSummary(customers);
    const criticalCustomers = customers
      .filter((customer) =>
        customer.subscriptions.some(
          (subscription) => subscription.status === "OVERDUE",
        ),
      )
      .slice(0, 5);

    return ok({
      summary,
      criticalCustomers,
      recentCustomers: customers.slice(0, 5),
    });
  } catch (error) {
    console.error(error);
    return fail("Unable to load dashboard data.", 500);
  }
}
