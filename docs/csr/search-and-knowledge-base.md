---
slug: search-and-knowledge-base
title: Search and knowledge base architecture
category: System Design
severity: Low
tags:
  - search
  - embeddings
  - pgvector
  - support docs
customer_phrases:
  - how does docs search work
  - semantic search architecture
  - explain knowledge base
---
# Search and knowledge base architecture

![Semantic search](/docs/diagrams/semantic-search.svg)

## Summary

The app has two support-oriented search patterns: fast customer lookup and source-of-truth CSR docs retrieval.

## Customer search

Customer search supports operational lookup by:

- Name
- Member ID
- Email
- Phone
- Vehicle make/model/color
- License plate
- Plan name
- Subscription status
- Payment status
- Support issue terms
- Lane context text

The dashboard includes an autocomplete-style customer search. The customer grid includes global filtering, advanced filters, sorting, pagination, and remembered search state.

## CSR Docs search

CSR Docs search uses Markdown playbooks as the source of truth.

1. Markdown files in `docs/csr/*.md` are parsed.
2. Each doc is chunked by section.
3. Each chunk is embedded with `Xenova/all-MiniLM-L6-v2` locally.
4. Embeddings are stored in a `vector(384)` column.
5. Search queries are embedded with the same model.
6. pgvector cosine similarity retrieves the nearest chunks.
7. Keyword boosts and deduplication improve relevance.
8. The UI links to the full support playbook.

## Fallback behavior

If vector search fails, the app falls back to database keyword search. If database keyword search fails, it falls back to static Markdown search. This keeps the docs page usable even when local model loading or pgvector support is unavailable.

## Production upgrade path

- Generate embeddings in a background worker instead of during manual seed.
- Add incremental embedding updates when docs change.
- Store customer support cases in the same retrieval index.
- Add role-aware retrieval so sensitive internal docs only appear to authorized users.
- Blend vector relevance with account priority signals such as overdue status, blocked lane, failed payment recency, and customer tier.
