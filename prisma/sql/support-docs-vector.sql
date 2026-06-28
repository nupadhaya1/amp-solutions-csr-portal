CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE "SupportDocChunk"
ADD COLUMN IF NOT EXISTS embedding vector(384);

CREATE INDEX IF NOT EXISTS "SupportDocChunk_embedding_hnsw_idx"
ON "SupportDocChunk"
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS "SupportDocChunk_content_trgm_idx"
ON "SupportDocChunk"
USING gin (content gin_trgm_ops);
