// @ts-check

let extractorPromise;

async function getExtractor() {
  if (!extractorPromise) {
    const { pipeline } = await import("@huggingface/transformers");
    extractorPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }

  return extractorPromise;
}

/**
 * @param {string} text
 */
export async function embedText(text) {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  const list = typeof output.tolist === "function" ? output.tolist() : null;
  const values = Array.from(output.data || list?.[0] || []);

  if (values.length !== 384) {
    throw new Error(`Expected 384-d embedding, received ${values.length}`);
  }

  return values.map(Number);
}
