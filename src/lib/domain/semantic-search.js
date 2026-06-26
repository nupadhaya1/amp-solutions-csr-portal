// @ts-check

const synonymMap = {
  access: ["gate", "wash", "blocked", "denied"],
  billing: ["payment", "card", "charge", "invoice"],
  failed: ["declined", "blocked", "overdue"],
  membership: ["subscription", "plan", "coverage"],
  moved: ["transfer", "replace", "switch", "new"],
  vehicle: ["car", "truck", "plate"],
  wash: ["gate", "access", "membership"],
};

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "can",
  "for",
  "from",
  "has",
  "how",
  "i",
  "is",
  "it",
  "my",
  "of",
  "on",
  "or",
  "the",
  "to",
  "what",
  "when",
  "why",
  "with",
]);

/**
 * @param {string} value
 */
function tokenize(value) {
  const rawTokens = value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token));

  return rawTokens.flatMap((token) => [token, ...(synonymMap[token] || [])]);
}

/**
 * @param {Array<string>} tokens
 */
function termFrequency(tokens) {
  const vector = new Map();
  for (const token of tokens) {
    vector.set(token, (vector.get(token) || 0) + 1);
  }
  return vector;
}

/**
 * @param {Map<string, number>} vector
 * @param {Map<string, number>} idf
 */
function weightVector(vector, idf) {
  const weighted = new Map();
  for (const [term, count] of vector) {
    weighted.set(term, count * (idf.get(term) || 1));
  }
  return weighted;
}

/**
 * @param {Map<string, number>} left
 * @param {Map<string, number>} right
 */
function cosineSimilarity(left, right) {
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (const value of left.values()) {
    leftNorm += value * value;
  }

  for (const value of right.values()) {
    rightNorm += value * value;
  }

  for (const [term, value] of left) {
    dot += value * (right.get(term) || 0);
  }

  if (leftNorm === 0 || rightNorm === 0) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

/**
 * @param {object} customer
 */
function customerDocument(customer) {
  const fullName = `${customer.firstName} ${customer.lastName}`;
  const vehicles = customer.vehicles || [];
  const subscriptions = customer.subscriptions || [];
  const purchases = customer.purchases || [];
  const supportNotes = customer.supportNotes || [];
  const auditEvents = customer.auditEvents || [];

  return {
    id: customer.id,
    kind: "customer",
    title: fullName,
    subtitle: `${customer.email} · ${customer.phone}`,
    href: `/csr/customers/${customer.id}`,
    text: [
      fullName,
      customer.email,
      customer.phone,
      customer.status,
      ...vehicles.flatMap((vehicle) => [
        vehicle.make,
        vehicle.model,
        vehicle.color,
        vehicle.licensePlate,
      ]),
      ...subscriptions.flatMap((subscription) => [
        subscription.status,
        subscription.plan?.name,
        subscription.plan?.cleaningTier,
      ]),
      ...purchases.flatMap((purchase) => [
        purchase.type,
        purchase.status,
        purchase.description,
      ]),
      ...supportNotes.map((note) => note.note),
      ...auditEvents.flatMap((event) => [event.type, event.message]),
    ]
      .filter(Boolean)
      .join(" "),
  };
}

/**
 * @param {object} article
 */
function faqDocument(article) {
  return {
    id: article.id,
    kind: "faq",
    title: article.title,
    subtitle: article.category,
    href: `/api/faq/search?q=${encodeURIComponent(article.title)}`,
    text: [
      article.title,
      article.question,
      article.answer,
      article.category,
      article.keywords,
    ]
      .filter(Boolean)
      .join(" "),
  };
}

/**
 * @param {{ customers?: Array<object>, faqs?: Array<object> }} input
 */
export function buildSemanticDocuments({ customers = [], faqs = [] }) {
  return [
    ...customers.map(customerDocument),
    ...faqs.map(faqDocument),
  ];
}

/**
 * @param {Array<object>} documents
 * @param {string} query
 * @param {{ limit?: number }} options
 */
export function semanticSearch(documents, query, options = {}) {
  const limit = options.limit || 8;
  const trimmed = query.trim();

  if (!trimmed) return documents.slice(0, limit).map((document) => ({ ...document, score: 0 }));

  const tokenizedDocuments = documents.map((document) => ({
    document,
    tokens: tokenize(document.text),
  }));
  const documentFrequency = new Map();

  for (const item of tokenizedDocuments) {
    for (const token of new Set(item.tokens)) {
      documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
    }
  }

  const idf = new Map();
  const totalDocuments = Math.max(tokenizedDocuments.length, 1);
  for (const [term, count] of documentFrequency) {
    idf.set(term, Math.log((1 + totalDocuments) / (1 + count)) + 1);
  }

  const queryVector = weightVector(termFrequency(tokenize(trimmed)), idf);

  return tokenizedDocuments
    .map((item) => {
      const documentVector = weightVector(termFrequency(item.tokens), idf);
      const kindBoost = item.document.kind === "customer" ? 2.4 : 1;
      return {
        ...item.document,
        score: cosineSimilarity(queryVector, documentVector) * kindBoost,
      };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}
