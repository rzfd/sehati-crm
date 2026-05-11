-- ── 005: match_kb vector search RPC ──────────────────────

create or replace function match_kb(
  query_embedding  vector(512),
  match_threshold  float   default 0.70,
  match_count      int     default 3,
  filter_clinic_id uuid    default null
)
returns table (
  id          uuid,
  content     text,
  similarity  float,
  source_type text,
  source_id   uuid
)
language sql
as $$
  select
    qa.id,
    qa.question || E'\n' || qa.answer as content,
    1 - (qa.embedding <=> query_embedding) as similarity,
    'qa_pair'::text                    as source_type,
    qa.id                              as source_id
  from kb_qa_pairs qa
  where
    qa.status = 'published'
    and (filter_clinic_id is null or qa.clinic_id = filter_clinic_id)
    and 1 - (qa.embedding <=> query_embedding) > match_threshold

  union all

  select
    ch.id,
    ch.content,
    1 - (ch.embedding <=> query_embedding) as similarity,
    'document_chunk'::text              as source_type,
    ch.document_id                      as source_id
  from kb_document_chunks ch
  where
    (filter_clinic_id is null or ch.clinic_id = filter_clinic_id)
    and 1 - (ch.embedding <=> query_embedding) > match_threshold

  order by similarity desc
  limit match_count;
$$;
