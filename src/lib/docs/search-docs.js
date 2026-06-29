// @ts-check

import { prisma } from "../prisma.js";
import { embedText } from "./embed.js";
import { searchStaticSupportDocs } from "./static-docs.js";
import { systemDesignCategory } from "./support-doc-catalog.js";
import { normalizeSearchQuery, toPgVector } from "./vector.js";

/**
 * @param {{ q?: unknown, limit?: unknown }} input
 */
export function validateDocsSearchParams(input) {
  const q = normalizeSearchQuery(input.q);
  const parsedLimit = Number(input.limit ?? 8);
  const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(Math.trunc(parsedLimit), 1), 20) : 8;

  if (!q || q.length > 200) {
    return { ok: false, error: "Invalid search query" };
  }

  return { ok: true, value: { q, limit } };
}

/**
 * @param {string} value
 */
function parseJsonArray(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/**
 * @param {string} query
 */
function queryTerms(query) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2);
}

/**
 * @param {string} query
 * @param {{ title?: string, tags?: string, customerPhrases?: string, summary?: string, severity?: string }} doc
 */
export function scoreKeywordMatch(query, doc) {
  const terms = queryTerms(query);
  const title = String(doc.title || "").toLowerCase();
  const tags = parseJsonArray(String(doc.tags || "[]")).join(" ").toLowerCase();
  const phrases = parseJsonArray(String(doc.customerPhrases || "[]")).join(" ").toLowerCase();
  const summary = String(doc.summary || "").toLowerCase();
  let score = 0;

  for (const term of terms) {
    if (title.includes(term)) score += 0.04;
    if (tags.includes(term)) score += 0.03;
    if (phrases.includes(term)) score += 0.04;
    if (summary.includes(term)) score += 0.02;
  }

  if (doc.severity === "Critical") score += 0.03;
  return Math.min(score, 0.25);
}

/**
 * @param {Array<object>} rows
 */
export function dedupeBestDocResults(rows) {
  const bestBySlug = new Map();

  for (const row of rows) {
    const current = bestBySlug.get(row.slug);
    if (!current || Number(row.score || 0) > Number(current.score || 0)) {
      bestBySlug.set(row.slug, row);
    }
  }

  return [...bestBySlug.values()].sort((left, right) => Number(right.score || 0) - Number(left.score || 0));
}

/**
 * @param {string} content
 */
function snippetFromContent(content) {
  return String(content || "")
    .replace(/^Title:.*$/gm, "")
    .replace(/^Category:.*$/gm, "")
    .replace(/^Severity:.*$/gm, "")
    .replace(/^Tags:.*$/gm, "")
    .replace(/^Customer phrases:.*$/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 260);
}

/**
 * @param {object} row
 * @param {string} query
 */
function formatSearchRow(row, query) {
  const vectorScore = Number(row.similarity || row.score || 0);
  const keywordBoost = scoreKeywordMatch(query, row);
  const score = Math.min(vectorScore + keywordBoost, 1);

  return {
    id: row.id,
    docId: row.docId,
    chunkIndex: row.chunkIndex,
    heading: row.heading,
    slug: row.slug,
    title: row.title,
    category: row.category,
    severity: row.severity,
    tags: parseJsonArray(row.tags),
    customerPhrases: parseJsonArray(row.customerPhrases),
    summary: row.summary,
    snippet: snippetFromContent(row.content || row.summary),
    score,
    matchType: row.matchType || "vector",
  };
}

/**
 * @param {string} q
 * @param {number} limit
 */
async function keywordSearchSupportDocs(q, limit) {
  if (!prisma.supportDoc) {
    return searchStaticSupportDocs(q, { limit });
  }

  const docs = await prisma.supportDoc.findMany({
    where: {
      isPublished: true,
      category: { not: systemDesignCategory },
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { body: { contains: q, mode: "insensitive" } },
        { tags: { contains: q, mode: "insensitive" } },
        { customerPhrases: { contains: q, mode: "insensitive" } },
      ],
    },
    take: limit,
    orderBy: [{ title: "asc" }],
  });

  return docs.map((doc) =>
    formatSearchRow(
      {
        ...doc,
        content: doc.summary,
        heading: "Summary",
        chunkIndex: 0,
        score: 0.5 + scoreKeywordMatch(q, doc),
        matchType: "keyword",
      },
      q,
    ),
  );
}

/**
 * @param {string} query
 * @param {{ limit?: number }} options
 */
export async function searchSupportDocs(query, options = {}) {
  const q = normalizeSearchQuery(query);
  const limit = Math.min(Math.max(Number(options.limit || 8), 1), 20);

  if (!q) return [];

  if (!prisma.supportDoc) {
    return searchStaticSupportDocs(q, { limit });
  }

  try {
    const embedding = await embedText(q);
    const vector = toPgVector(embedding);
    const rows = await prisma.$queryRawUnsafe(
      `SELECT
        c.id,
        c."docId",
        c."chunkIndex",
        c.heading,
        c.content,
        d.slug,
        d.title,
        d.category,
        d.severity,
        d.tags,
        d."customerPhrases",
        d.summary,
        1 - (c.embedding <=> $1::vector) AS similarity
      FROM "SupportDocChunk" c
      JOIN "SupportDoc" d ON d.id = c."docId"
      WHERE d."isPublished" = true
        AND d.category <> $3
        AND c.embedding IS NOT NULL
      ORDER BY c.embedding <=> $1::vector
      LIMIT $2`,
      vector,
      Math.max(limit * 3, limit),
      systemDesignCategory,
    );

    const results = dedupeBestDocResults(rows.map((row) => formatSearchRow(row, q))).slice(0, limit);
    return results.length ? results : searchStaticSupportDocs(q, { limit });
  } catch (error) {
    console.warn("Vector docs search failed, falling back to keyword search", error);
    try {
      const results = await keywordSearchSupportDocs(q, limit);
      return results.length ? results : searchStaticSupportDocs(q, { limit });
    } catch (fallbackError) {
      console.warn("Database keyword docs search failed, falling back to markdown search", fallbackError);
      return searchStaticSupportDocs(q, { limit });
    }
  }
}
