import { PortalShell } from "@/components/portal-shell";
import { listCustomersForSupport } from "@/lib/data/customers";
import { flattenCustomerForSearch, searchCustomers } from "@/lib/domain/customer-search";
import { createPortalDashboardViewModel } from "@/lib/domain/dashboard-view-model";
import { buildSemanticDocuments, semanticSearch } from "@/lib/domain/semantic-search";
import { prisma } from "@/lib/prisma";

function filterByField(results, field, value) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return results;

  return results.filter((result) =>
    String(result[field] || "")
      .toLowerCase()
      .includes(normalized),
  );
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const activeTab = params?.tab || "dashboard";
  const customerQuery = params?.q || "";
  const semanticQuery = params?.smart || "";
  const customers = await listCustomersForSupport();
  const faqArticles = await prisma.faqArticle.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  let customerResults = customerQuery
    ? searchCustomers(customers, customerQuery)
    : customers.map(flattenCustomerForSearch);

  customerResults = filterByField(customerResults, "fullName", params?.name || "");
  customerResults = filterByField(customerResults, "email", params?.email || "");
  customerResults = filterByField(customerResults, "phone", params?.phone || "");
  customerResults = filterByField(customerResults, "licensePlate", params?.licensePlate || "");

  const semanticDocuments = buildSemanticDocuments({
    customers,
    faqs: faqArticles,
  });

  return (
    <PortalShell
      activeTab={activeTab}
      customerQuery={customerQuery}
      customerResults={customerResults}
      semanticQuery={semanticQuery}
      semanticResults={semanticSearch(semanticDocuments, semanticQuery, { limit: 8 })}
      viewModel={createPortalDashboardViewModel(customers)}
    />
  );
}
