import { listCustomersForSupport } from "@/lib/data/customers";
import { flattenCustomerForSearch } from "@/lib/domain/customer-search";
import { fail, ok } from "@/lib/api/responses";

export async function GET() {
  try {
    const customers = await listCustomersForSupport();
    return ok(customers.map(flattenCustomerForSearch));
  } catch (error) {
    console.error(error);
    return fail("Unable to load customers.", 500);
  }
}
