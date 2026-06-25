import { listCustomersForSupport } from "@/lib/data/customers";
import { searchCustomers } from "@/lib/domain/customer-search";
import { fail, ok } from "@/lib/api/responses";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = Number(searchParams.get("limit") || 25);
    const customers = await listCustomersForSupport();

    return ok({
      query,
      results: searchCustomers(customers, query, {
        limit: Number.isFinite(limit) ? limit : 25,
      }),
    });
  } catch (error) {
    console.error(error);
    return fail("Unable to search customers.", 500);
  }
}
