import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { DocsArticle } from "@/components/docs/docs-article";
import { MotionPanel } from "@/components/motion-panel";
import { getStaticSupportDocBySlug } from "@/lib/docs/static-docs";
import { isSystemDesignDocSlug } from "@/lib/docs/support-doc-catalog";
import { prisma } from "@/lib/prisma";

function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export default async function CsrDocArticlePage({ params }) {
  const resolvedParams = await params;
  let doc = null;

  if (isSystemDesignDocSlug(resolvedParams.slug)) {
    redirect("/demo/systemDesign");
  }

  if (prisma.supportDoc) {
    try {
      doc = await prisma.supportDoc.findUnique({
        where: { slug: resolvedParams.slug },
      });
    } catch (error) {
      console.error("Database support doc lookup failed, falling back to markdown doc", error);
    }
  }

  if (!doc) {
    doc = await getStaticSupportDocBySlug(resolvedParams.slug);
  }

  if (!doc || doc.isPublished === false) notFound();

  return (
    <MotionPanel className="grid gap-4">
      <Link
        className="inline-flex w-fit items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted shadow-sm hover:text-foreground"
        href="/csr/docs"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to docs
      </Link>
      <DocsArticle
        doc={{
          ...doc,
          tags: Array.isArray(doc.tags) ? doc.tags : parseJsonArray(doc.tags),
          customerPhrases: Array.isArray(doc.customerPhrases)
            ? doc.customerPhrases
            : parseJsonArray(doc.customerPhrases),
        }}
      />
    </MotionPanel>
  );
}
