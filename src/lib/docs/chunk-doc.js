// @ts-check

const MAX_WORDS = 700;

/**
 * @param {string} body
 */
function splitByHeadings(body) {
  const sections = [];
  let heading = "";
  let lines = [];

  for (const line of body.split("\n")) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      if (lines.join("\n").trim()) {
        sections.push({ heading, content: lines.join("\n").trim() });
      }
      heading = match[1].trim();
      lines = [];
    } else if (!line.startsWith("# ")) {
      lines.push(line);
    }
  }

  if (lines.join("\n").trim()) {
    sections.push({ heading, content: lines.join("\n").trim() });
  }

  return sections.length ? sections : [{ heading: "", content: body }];
}

/**
 * @param {{ title: string, category: string, severity: string, tags: Array<string>, customerPhrases: Array<string>, body: string }} doc
 */
export function chunkSupportDoc(doc) {
  const sections = splitByHeadings(doc.body);
  const chunks = [];

  for (const section of sections) {
    const words = section.content.split(/\s+/).filter(Boolean);
    for (let index = 0; index < Math.max(words.length, 1); index += MAX_WORDS) {
      const content = words.slice(index, index + MAX_WORDS).join(" ");
      chunks.push({
        chunkIndex: chunks.length,
        heading: section.heading || doc.title,
        content: [
          `Title: ${doc.title}`,
          `Category: ${doc.category}`,
          `Severity: ${doc.severity}`,
          `Tags: ${doc.tags.join(", ")}`,
          `Customer phrases: ${doc.customerPhrases.join(" | ")}`,
          "",
          content,
        ].join("\n"),
        tokenCount: content.split(/\s+/).filter(Boolean).length,
      });
    }
  }

  return chunks;
}
