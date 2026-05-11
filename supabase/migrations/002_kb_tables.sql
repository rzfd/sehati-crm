-- ── 002: Knowledge base tables ───────────────────────────

-- ── KB Q&A pairs ─────────────────────────────────────────
create table kb_qa_pairs (
  id          uuid        primary key default gen_random_uuid(),
  clinic_id   uuid        not null references clinics(id) on delete cascade,
  question    text        not null,
  answer      text        not null,
  tags        text[]      not null default '{}',
  status      text        not null default 'draft' check (status in ('draft','published','archived')),
  embedding   vector(512),
  usage_count integer     not null default 0,
  created_by  uuid        references staff_members(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── KB documents (uploaded files) ────────────────────────
create table kb_documents (
  id              uuid        primary key default gen_random_uuid(),
  clinic_id       uuid        not null references clinics(id) on delete cascade,
  title           text        not null,
  file_url        text        not null,
  file_type       text        not null,
  file_size_bytes integer,
  chunk_count     integer     not null default 0,
  status          text        not null default 'processing' check (status in ('processing','ready','error')),
  uploaded_by     uuid        references staff_members(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── KB document chunks ───────────────────────────────────
create table kb_document_chunks (
  id          uuid        primary key default gen_random_uuid(),
  document_id uuid        not null references kb_documents(id) on delete cascade,
  clinic_id   uuid        not null references clinics(id) on delete cascade,
  chunk_index integer     not null,
  content     text        not null,
  embedding   vector(512),
  created_at  timestamptz not null default now()
);

-- ── Vector indexes ────────────────────────────────────────
create index kb_qa_pairs_embedding_idx        on kb_qa_pairs        using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index kb_chunks_embedding_idx          on kb_document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index kb_qa_pairs_clinic_status_idx    on kb_qa_pairs        (clinic_id, status);
create index kb_documents_clinic_idx          on kb_documents       (clinic_id);
create index kb_document_chunks_document_idx  on kb_document_chunks (document_id);
