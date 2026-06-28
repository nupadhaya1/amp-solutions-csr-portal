// @ts-check

/**
 * @param {string} raw
 */
function parseSimpleYaml(raw) {
  const meta = {};
  let currentArrayKey = "";

  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;

    const arrayItem = line.match(/^\s*-\s+(.+)$/);
    if (arrayItem && currentArrayKey) {
      meta[currentArrayKey].push(arrayItem[1].trim());
      continue;
    }

    const pair = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!pair) continue;

    const [, key, value] = pair;
    if (value === "") {
      meta[key] = [];
      currentArrayKey = key;
    } else {
      meta[key] = value.trim();
      currentArrayKey = "";
    }
  }

  return meta;
}

/**
 * @param {string} body
 */
function extractSummary(body) {
  const summaryMatch = body.match(/## Summary\s+([\s\S]*?)(?:\n## |\s*$)/);
  const summary = summaryMatch?.[1]
    ?.replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (summary) return summary;

  return body
    .replace(/^# .+$/m, "")
    .split(/\n{2,}/)
    .map((value) => value.trim())
    .find(Boolean) || "";
}

/**
 * @param {string} raw
 */
export function parseSupportDocMarkdown(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Support doc is missing frontmatter");

  const [, frontmatter, body] = match;
  const meta = parseSimpleYaml(frontmatter);

  for (const key of ["slug", "title", "category", "severity"]) {
    if (!meta[key]) throw new Error(`Support doc missing ${key}`);
  }

  return {
    slug: String(meta.slug),
    title: String(meta.title),
    category: String(meta.category),
    severity: String(meta.severity),
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    customerPhrases: Array.isArray(meta.customer_phrases) ? meta.customer_phrases : [],
    summary: extractSummary(body),
    body: body.trim(),
  };
}
