import assert from "node:assert/strict";
import test from "node:test";

import { searchFaqArticles } from "./faq-search.js";

const articles = [
  {
    id: "faq_wash",
    title: "Why can't I get a wash?",
    question: "Why can't I get a wash?",
    answer: "A wash can be blocked when a membership is overdue or a payment failed.",
    category: "Service access",
    keywords: "can't wash unable to wash overdue failed payment blocked gate",
  },
  {
    id: "faq_transfer",
    title: "Transfer membership to a new vehicle",
    question: "Can I transfer my membership to a new vehicle?",
    answer: "A CSR can add the new vehicle and transfer active coverage.",
    category: "Vehicles",
    keywords: "new car transfer subscription vehicle membership",
  },
  {
    id: "faq_refund",
    title: "Purchase and refund questions",
    question: "Where can I see recent purchases?",
    answer: "CSRs can review purchase history including refunds.",
    category: "Purchases",
    keywords: "purchase refund recent history coupon redemption",
  },
];

test("finds FAQ articles with support-language queries", () => {
  assert.equal(searchFaqArticles(articles, "can't wash")[0].id, "faq_wash");
  assert.equal(searchFaqArticles(articles, "new car")[0].id, "faq_transfer");
  assert.equal(searchFaqArticles(articles, "refund")[0].id, "faq_refund");
});

test("returns default FAQ articles when query is empty", () => {
  const results = searchFaqArticles(articles, "", { limit: 2 });

  assert.equal(results.length, 2);
  assert.deepEqual(
    results.map((result) => result.id),
    ["faq_wash", "faq_transfer"],
  );
});
