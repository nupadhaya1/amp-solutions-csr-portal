import { PortalShell } from "@/components/portal-shell";
import { listCustomersForSupport } from "@/lib/data/customers";
import { createPortalDashboardViewModel } from "@/lib/domain/dashboard-view-model";
import { searchFaqArticles } from "@/lib/domain/faq-search";
import { prisma } from "@/lib/prisma";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const helpQuery = params?.help || "";
  const customers = await listCustomersForSupport();
  const faqArticles = await prisma.faqArticle.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  return (
    <PortalShell
      helpArticles={searchFaqArticles(faqArticles, helpQuery, { limit: 4 })}
      helpQuery={helpQuery}
      viewModel={createPortalDashboardViewModel(customers)}
    />
  );
}
