import { fail, ok } from "@/lib/api/responses";
import { listCustomersForSupport } from "@/lib/data/customers";
import { buildSemanticDocuments, semanticSearch } from "@/lib/domain/semantic-search";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = Number(searchParams.get("limit") || 8);
    const customers = await listCustomersForSupport();
    const faqs = await prisma.faqArticle.findMany({
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });
    const documents = buildSemanticDocuments({ customers, faqs });

    return ok({
      query,
      results: semanticSearch(documents, query, {
        limit: Number.isFinite(limit) ? limit : 8,
      }),
    });
  } catch (error) {
    console.error(error);
    return fail("Unable to run semantic search.", 500);
  }
}
