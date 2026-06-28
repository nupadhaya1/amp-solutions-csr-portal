import { fail, ok } from "@/lib/api/responses";
import { searchSupportDocs, validateDocsSearchParams } from "@/lib/docs/search-docs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = validateDocsSearchParams({
      q: searchParams.get("q"),
      limit: searchParams.get("limit") || 8,
    });

    if (!parsed.ok) {
      return fail(parsed.error, 400);
    }

    const results = await searchSupportDocs(parsed.value.q, { limit: parsed.value.limit });

    return ok({
      query: parsed.value.q,
      results,
    });
  } catch (error) {
    console.error(error);
    return fail("Unable to search CSR docs.", 500);
  }
}
