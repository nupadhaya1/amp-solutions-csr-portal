import { listCustomersForSupport } from "@/lib/data/customers";
import { createDashboardApiViewModel } from "@/lib/domain/dashboard-api-view-model";
import { fail, ok } from "@/lib/api/responses";

export async function GET() {
  try {
    const customers = await listCustomersForSupport();
    return ok(createDashboardApiViewModel(customers));
  } catch (error) {
    console.error(error);
    return fail("Unable to load dashboard data.", 500);
  }
}
