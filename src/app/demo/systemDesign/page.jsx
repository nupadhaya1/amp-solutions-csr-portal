import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { getStaticSupportDocBySlug } from "@/lib/docs/static-docs";
import { supportDocCatalog, systemDesignCategory } from "@/lib/docs/support-doc-catalog";

export const metadata = {
  title: "AMP CSR System Design",
  description: "System design overview for the AMP CSR Command Center take-home project.",
};

function renderInline(text) {
  return cleanSystemDesignText(text).split(/(`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-primary" key={index}>
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}

function cleanSystemDesignText(text) {
  return text
    .replace("CloudFront, WAF, an ALB", "CloudFront, an ALB")
    .replace("CloudFront, WAF, ECS Fargate", "CloudFront, ECS Fargate")
    .replace(/, WAF,/g, ",")
    .replace(/WAF, /g, "")
    .replace(/AWS WAF,? /g, "")
    .replace(/Route 53,? /g, "");
}

function PlainDocBody({ body }) {
  const nodes = [];
  let list = [];
  let skipFence = false;

  function flushList() {
    if (!list.length) return;
    nodes.push(
      <ul className="my-3 list-disc space-y-2 pl-6 text-sm leading-6 text-muted" key={`list-${nodes.length}`}>
        {list.map((item) => (
          <li key={item}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  }

  body.split("\n").forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushList();
      skipFence = !skipFence;
      return;
    }

    if (
      skipFence ||
      !trimmed ||
      trimmed.startsWith("# ") ||
      trimmed.startsWith("![") ||
      trimmed.includes("AWS WAF") ||
      trimmed.includes("Route 53")
    ) {
      flushList();
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      nodes.push(
        <h2 className="mt-8 text-xl font-semibold tracking-tight" key={index}>
          {trimmed.replace(/^##\s+/, "")}
        </h2>,
      );
      return;
    }

    const bullet = trimmed.match(/^(?:[-*]|\d+\.)\s+(.+)$/);
    if (bullet) {
      list.push(bullet[1]);
      return;
    }

    flushList();
    nodes.push(
      <p className="mt-3 text-sm leading-6 text-muted" key={index}>
        {renderInline(trimmed)}
      </p>,
    );
  });

  flushList();
  return <div>{nodes}</div>;
}

function PlainDocArticle({ doc }) {
  return (
    <article className="border-t border-border py-8 first:border-t-0 first:pt-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{doc.category}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">{doc.title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{cleanSystemDesignText(doc.summary)}</p>
      <PlainDocBody body={doc.body} />
    </article>
  );
}

export default async function DemoSystemDesignPage() {
  const systemDesignDocs = (
    await Promise.all(
      supportDocCatalog
        .filter((doc) => doc.category === systemDesignCategory)
        .map((doc) => getStaticSupportDocBySlug(doc.slug, { includeSystemDesign: true })),
    )
  ).filter(Boolean);

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto grid w-full max-w-4xl gap-8">
        <div>
          <Link
            className="mb-6 inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-muted hover:text-foreground"
            href="/demo"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back
          </Link>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">System design</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-tight">
            AMP CSR Command Center architecture overview
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
            A practical readout of how the take-home covers the CSR workflow, persistence model,
            support documentation, and production deployment path.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-muted hover:text-foreground"
            href="/demo/presentation"
          >
            Open presentation
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-5" id="full-system-design-docs">
          {systemDesignDocs.map((doc) => (
            <PlainDocArticle doc={doc} key={doc.slug} />
          ))}
        </div>
      </section>
    </main>
  );
}
