import { fail, ok } from "@/lib/api/responses";
import { searchFaqArticles } from "@/lib/domain/faq-search";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = Number(searchParams.get("limit") || 5);
    const articles = await prisma.faqArticle.findMany({
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });

    return ok({
      query,
      results: searchFaqArticles(articles, query, {
        limit: Number.isFinite(limit) ? limit : 5,
      }),
    });
  } catch (error) {
    console.error(error);
    return fail("Unable to search help articles.", 500);
  }
}
