// @ts-check

/**
 * @param {Array<number>} values
 */
export function toPgVector(values) {
  if (!Array.isArray(values)) throw new Error("Expected embedding array");

  return `[${values
    .map((value) => {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        throw new Error("Embedding values must be finite numbers");
      }
      return numeric.toFixed(8);
    })
    .join(",")}]`;
}

/**
 * @param {unknown} query
 */
export function normalizeSearchQuery(query) {
  return String(query || "").trim().replace(/\s+/g, " ");
}
