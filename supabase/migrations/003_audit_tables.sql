-- ── 003: Audit & analytics tables ────────────────────────

-- ── Audit log ─────────────────────────────────────────────
create table audit_log (
  id          uuid        primary key default gen_random_uuid(),
  clinic_id   uuid        not null references clinics(id) on delete cascade,
  actor_id    uuid        references staff_members(id) on delete set null,
  action      text        not null,
  target_type text,
  target_id   uuid,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

-- ── KB query logs (for hit rate metrics) ─────────────────
create table kb_query_logs (
  id               uuid        primary key default gen_random_uuid(),
  clinic_id        uuid        not null references clinics(id) on delete cascade,
  conversation_id  uuid        not null references conversations(id) on delete cascade,
  query            text        not null,
  matched_id       uuid,
  match_type       text        check (match_type in ('qa_pair','document_chunk')),
  similarity_score float,
  was_used         boolean     not null default false,
  created_at       timestamptz not null default now()
);

create index audit_log_clinic_created_idx       on audit_log      (clinic_id, created_at desc);
create index kb_query_logs_clinic_created_idx   on kb_query_logs  (clinic_id, created_at desc);
create index kb_query_logs_conversation_idx     on kb_query_logs  (conversation_id);
