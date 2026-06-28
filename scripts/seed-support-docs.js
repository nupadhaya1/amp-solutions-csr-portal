// @ts-check

import fs from "node:fs/promises";
import path from "node:path";

import { chunkSupportDoc } from "../src/lib/docs/chunk-doc.js";
import { embedText } from "../src/lib/docs/embed.js";
import { parseSupportDocMarkdown } from "../src/lib/docs/parse-doc.js";
import { toPgVector } from "../src/lib/docs/vector.js";
import { prisma } from "../src/lib/prisma.js";

const docsDir = path.join(process.cwd(), "docs", "csr");

async function ensureVectorColumn() {
  await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS vector");
  await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS pg_trgm");
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "SupportDocChunk" ADD COLUMN IF NOT EXISTS embedding vector(384)',
  );

  try {
    await prisma.$executeRawUnsafe(
      'CREATE INDEX IF NOT EXISTS "SupportDocChunk_embedding_hnsw_idx" ON "SupportDocChunk" USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64)',
    );
  } catch (error) {
    console.warn("Skipping HNSW index; pgvector may not support it in this database.", error.message);
  }

  await prisma.$executeRawUnsafe(
    'CREATE INDEX IF NOT EXISTS "SupportDocChunk_content_trgm_idx" ON "SupportDocChunk" USING gin (content gin_trgm_ops)',
  );
}

async function main() {
  await ensureVectorColumn();

  const files = (await fs.readdir(docsDir)).filter((file) => file.endsWith(".md")).sort();
  let docCount = 0;
  let chunkCount = 0;

  for (const file of files) {
    const raw = await fs.readFile(path.join(docsDir, file), "utf8");
    const parsed = parseSupportDocMarkdown(raw);
    const chunks = chunkSupportDoc(parsed);

    const doc = await prisma.supportDoc.upsert({
      where: { slug: parsed.slug },
      update: {
        title: parsed.title,
        category: parsed.category,
        severity: parsed.severity,
        tags: JSON.stringify(parsed.tags),
        customerPhrases: JSON.stringify(parsed.customerPhrases),
        summary: parsed.summary,
        body: parsed.body,
        isPublished: true,
      },
      create: {
        slug: parsed.slug,
        title: parsed.title,
        category: parsed.category,
        severity: parsed.severity,
        tags: JSON.stringify(parsed.tags),
        customerPhrases: JSON.stringify(parsed.customerPhrases),
        summary: parsed.summary,
        body: parsed.body,
        isPublished: true,
      },
    });

    await prisma.supportDocChunk.deleteMany({ where: { docId: doc.id } });

    for (const chunk of chunks) {
      const embedding = await embedText(chunk.content);
      const vector = toPgVector(embedding);
      const createdChunk = await prisma.supportDocChunk.create({
        data: {
          docId: doc.id,
          chunkIndex: chunk.chunkIndex,
          heading: chunk.heading,
          content: chunk.content,
          tokenCount: chunk.tokenCount,
        },
      });

      await prisma.$executeRawUnsafe(
        'UPDATE "SupportDocChunk" SET embedding = $1::vector WHERE id = $2',
        vector,
        createdChunk.id,
      );

      chunkCount += 1;
    }

    docCount += 1;
  }

  console.log(`Seeded ${docCount} support docs and ${chunkCount} chunks.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
