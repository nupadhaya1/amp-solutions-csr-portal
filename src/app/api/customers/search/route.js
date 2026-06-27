import { listCustomerSearchRecords } from "@/lib/data/customers";
import { createCustomerSearchIndex } from "@/lib/domain/customer-search";
import { fail, ok } from "@/lib/api/responses";

const SEARCH_INDEX_TTL_MS = 15 * 1000;
let cachedSearchIndex = null;
let cachedSearchIndexExpiresAt = 0;

async function getSearchIndex() {
  const now = Date.now();

  if (cachedSearchIndex && cachedSearchIndexExpiresAt > now) {
    return cachedSearchIndex;
  }

  const customers = await listCustomerSearchRecords();
  cachedSearchIndex = createCustomerSearchIndex(customers);
  cachedSearchIndexExpiresAt = now + SEARCH_INDEX_TTL_MS;

  return cachedSearchIndex;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = Number(searchParams.get("limit") || 25);
    const searchIndex = await getSearchIndex();

    return ok({
      query,
      results: searchIndex.search(query, {
        limit: Number.isFinite(limit) ? limit : 25,
      }),
    });
  } catch (error) {
    console.error(error);
    return fail("Unable to search customers.", 500);
  }
}
