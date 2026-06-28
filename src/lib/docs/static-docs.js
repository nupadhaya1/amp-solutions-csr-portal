// @ts-check

import fs from "node:fs/promises";
import path from "node:path";

import { parseSupportDocMarkdown } from "./parse-doc.js";
import { normalizeSearchQuery } from "./vector.js";

const docsDir = path.join(process.cwd(), "docs", "csr");

/**
 * @param {string} value
 */
function terms(value) {
  return normalizeSearchQuery(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2);
}

/**
 * @param {string} query
 * @param {{ title: string, category: string, severity: string, tags: Array<string>, customerPhrases: Array<string>, summary: string, body: string }} doc
 */
function scoreStaticDoc(query, doc) {
  const queryTerms = terms(query);
  const fields = {
    title: doc.title.toLowerCase(),
    tags: doc.tags.join(" ").toLowerCase(),
    phrases: doc.customerPhrases.join(" ").toLowerCase(),
    summary: doc.summary.toLowerCase(),
    body: doc.body.toLowerCase(),
  };
  let score = 0;

  for (const term of queryTerms) {
    if (fields.title.includes(term)) score += 0.12;
    if (fields.tags.includes(term)) score += 0.1;
    if (fields.phrases.includes(term)) score += 0.1;
    if (fields.summary.includes(term)) score += 0.06;
    if (fields.body.includes(term)) score += 0.03;
  }

  if (doc.severity === "Critical") score += 0.04;
  return Math.min(score, 1);
}

/**
 * @param {string} body
 */
function snippetFromBody(body) {
  const summary = body.match(/## Summary\s+([\s\S]*?)(?:\n## |\s*$)/)?.[1] || body;
  return summary.replace(/\s+/g, " ").trim().slice(0, 260);
}

export async function listStaticSupportDocs() {
  const files = (await fs.readdir(docsDir)).filter((file) => file.endsWith(".md")).sort();
  const docs = [];

  for (const file of files) {
    const raw = await fs.readFile(path.join(docsDir, file), "utf8");
    docs.push(parseSupportDocMarkdown(raw));
  }

  return docs;
}

/**
 * @param {string} slug
 */
export async function getStaticSupportDocBySlug(slug) {
  const docs = await listStaticSupportDocs();
  return docs.find((doc) => doc.slug === slug) || null;
}

/**
 * @param {string} query
 * @param {{ limit?: number }} options
 */
export async function searchStaticSupportDocs(query, options = {}) {
  const q = normalizeSearchQuery(query);
  const limit = Math.min(Math.max(Number(options.limit || 8), 1), 20);

  if (!q) return [];

  return (await listStaticSupportDocs())
    .map((doc) => ({
      ...doc,
      chunkIndex: 0,
      heading: "Markdown playbook",
      snippet: snippetFromBody(doc.body),
      score: scoreStaticDoc(q, doc),
      matchType: "markdown",
    }))
    .filter((doc) => doc.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}
