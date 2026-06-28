import { DocsSearchWorkspace } from "@/components/docs/docs-search-workspace";
import { MotionPanel } from "@/components/motion-panel";
import { searchSupportDocs } from "@/lib/docs/search-docs";

export default async function CsrDocsPage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || "";
  const results = q ? await searchSupportDocs(q, { limit: 8 }) : [];

  return (
    <MotionPanel className="grid gap-5">
      <DocsSearchWorkspace initialQuery={q} initialResults={results} />
    </MotionPanel>
  );
}
