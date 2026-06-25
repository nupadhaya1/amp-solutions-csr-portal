// @ts-check

import Fuse from "fuse.js";

/**
 * @param {Array<object>} articles
 * @param {string} query
 * @param {{ limit?: number }} options
 */
export function searchFaqArticles(articles, query, options = {}) {
  const limit = options.limit || 5;
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return articles.slice(0, limit);
  }

  const fuse = new Fuse(articles, {
    ignoreLocation: true,
    includeScore: true,
    keys: [
      { name: "title", weight: 0.3 },
      { name: "question", weight: 0.25 },
      { name: "keywords", weight: 0.25 },
      { name: "answer", weight: 0.15 },
      { name: "category", weight: 0.05 },
    ],
    threshold: 0.38,
  });

  return fuse.search(normalizedQuery, { limit }).map((result) => result.item);
}
