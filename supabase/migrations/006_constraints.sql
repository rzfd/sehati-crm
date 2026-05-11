-- ── 006: Add NOT NULL constraints, unique partial indexes,
--         and time-range check missing from initial migration ─

-- ── clinics ───────────────────────────────────────────────
alter table clinics
  alter column settings    set not null,
  alter column created_at  set not null,
  alter column updated_at  set not null;

-- ── doctors ───────────────────────────────────────────────
alter table doctors
  alter column clinic_id   set not null,
  alter column title       set not null,
  alter column is_active   set not null,
  alter column created_at  set not null,
  alter column updated_at  set not null;

-- ── doctor_schedules ──────────────────────────────────────
alter table doctor_schedules
  alter column doctor_id              set not null,
  alter column slot_duration_minutes  set not null,
  alter column max_patients           set not null,
  alter column created_at             set not null;

alter table doctor_schedules
  add constraint doctor_schedules_time_check check (start_time < end_time);

-- ── staff_members ─────────────────────────────────────────
alter table staff_members
  alter column clinic_id   set not null,
  alter column is_active   set not null,
  alter column created_at  set not null,
  alter column updated_at  set not null;

-- one auth user → at most one staff record
create unique index if not exists staff_members_user_id_unique
  on staff_members (user_id) where user_id is not null;

-- ── patients ──────────────────────────────────────────────
alter table patients
  alter column clinic_id   set not null,
  alter column is_new      set not null,
  alter column tags        set not null,
  alter column created_at  set not null,
  alter column updated_at  set not null;

-- one auth user → at most one patient record
create unique index if not exists patients_user_id_unique
  on patients (user_id) where user_id is not null;

-- ── conversations ─────────────────────────────────────────
alter table conversations
  alter column clinic_id        set not null,
  alter column patient_id       set not null,
  alter column status           set not null,
  alter column urgency_level    set not null,
  alter column ai_handled       set not null,
  alter column last_message_at  set not null,
  alter column created_at       set not null,
  alter column updated_at       set not null;

-- ── messages ──────────────────────────────────────────────
alter table messages
  alter column conversation_id  set not null,
  alter column is_read          set not null,
  alter column created_at       set not null;

-- ── bookings ──────────────────────────────────────────────
alter table bookings
  alter column clinic_id   set not null,
  alter column patient_id  set not null,
  alter column doctor_id   set not null,
  alter column status      set not null,
  alter column created_at  set not null,
  alter column updated_at  set not null;

-- ── kb_qa_pairs ───────────────────────────────────────────
alter table kb_qa_pairs
  alter column clinic_id    set not null,
  alter column tags         set not null,
  alter column status       set not null,
  alter column usage_count  set not null,
  alter column created_at   set not null,
  alter column updated_at   set not null;

-- ── kb_documents ──────────────────────────────────────────
alter table kb_documents
  alter column clinic_id    set not null,
  alter column chunk_count  set not null,
  alter column status       set not null,
  alter column created_at   set not null,
  alter column updated_at   set not null;

-- ── kb_document_chunks ────────────────────────────────────
alter table kb_document_chunks
  alter column document_id  set not null,
  alter column clinic_id    set not null,
  alter column created_at   set not null;

-- ── audit_log ─────────────────────────────────────────────
alter table audit_log
  alter column clinic_id   set not null,
  alter column created_at  set not null;

-- ── kb_query_logs ─────────────────────────────────────────
alter table kb_query_logs
  alter column clinic_id       set not null,
  alter column conversation_id set not null,
  alter column was_used        set not null,
  alter column created_at      set not null;
