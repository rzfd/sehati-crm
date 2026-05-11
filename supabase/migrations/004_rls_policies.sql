-- ── 004: Row Level Security policies ─────────────────────

alter table clinics           enable row level security;
alter table doctors            enable row level security;
alter table doctor_schedules   enable row level security;
alter table staff_members      enable row level security;
alter table patients           enable row level security;
alter table conversations      enable row level security;
alter table messages           enable row level security;
alter table bookings           enable row level security;
alter table kb_qa_pairs        enable row level security;
alter table kb_documents       enable row level security;
alter table kb_document_chunks enable row level security;
alter table audit_log          enable row level security;
alter table kb_query_logs      enable row level security;

-- ── Helpers ───────────────────────────────────────────────
create or replace function get_my_clinic_id()
returns uuid language sql security definer stable as $$
  select clinic_id from staff_members where user_id = auth.uid() limit 1;
$$;

create or replace function get_my_role()
returns text language sql security definer stable as $$
  select role from staff_members where user_id = auth.uid() limit 1;
$$;

create or replace function get_my_patient_id()
returns uuid language sql security definer stable as $$
  select id from patients where user_id = auth.uid() limit 1;
$$;

-- ── Clinics ───────────────────────────────────────────────
create policy "staff view own clinic"
  on clinics for select
  using (id = get_my_clinic_id());

-- ── Doctors ───────────────────────────────────────────────
create policy "clinic members view doctors"
  on doctors for select
  using (
    clinic_id = get_my_clinic_id()
    or clinic_id = (select clinic_id from patients where user_id = auth.uid() limit 1)
  );

create policy "admin manage doctors"
  on doctors for all
  using (clinic_id = get_my_clinic_id() and get_my_role() = 'admin');

-- ── Doctor schedules ──────────────────────────────────────
create policy "anyone view schedules"
  on doctor_schedules for select using (true);

create policy "admin manage schedules"
  on doctor_schedules for all
  using (get_my_role() = 'admin');

-- ── Staff members ─────────────────────────────────────────
create policy "staff view clinic staff"
  on staff_members for select
  using (clinic_id = get_my_clinic_id());

create policy "admin manage staff"
  on staff_members for all
  using (clinic_id = get_my_clinic_id() and get_my_role() = 'admin');

-- ── Patients ─────────────────────────────────────────────
create policy "patient view own record"
  on patients for select using (user_id = auth.uid());

create policy "staff view clinic patients"
  on patients for select using (clinic_id = get_my_clinic_id());

create policy "staff update patients"
  on patients for update using (clinic_id = get_my_clinic_id());

-- ── Conversations ─────────────────────────────────────────
create policy "patient view own conversations"
  on conversations for select using (patient_id = get_my_patient_id());

create policy "patient create conversation"
  on conversations for insert
  with check (patient_id = get_my_patient_id());

create policy "staff view clinic conversations"
  on conversations for select using (clinic_id = get_my_clinic_id());

create policy "staff update conversations"
  on conversations for update using (clinic_id = get_my_clinic_id());

-- ── Messages ─────────────────────────────────────────────
create policy "patient view own messages"
  on messages for select
  using (
    conversation_id in (
      select id from conversations where patient_id = get_my_patient_id()
    )
  );

create policy "patient send message"
  on messages for insert
  with check (
    sender_type = 'patient' and
    conversation_id in (
      select id from conversations where patient_id = get_my_patient_id()
    )
  );

create policy "staff view clinic messages"
  on messages for select
  using (
    conversation_id in (
      select id from conversations where clinic_id = get_my_clinic_id()
    )
  );

create policy "staff send message"
  on messages for insert
  with check (
    sender_type in ('staff','ai_bot') and
    conversation_id in (
      select id from conversations where clinic_id = get_my_clinic_id()
    )
  );

-- ── Bookings ─────────────────────────────────────────────
create policy "patient view own bookings"
  on bookings for select using (patient_id = get_my_patient_id());

create policy "staff view clinic bookings"
  on bookings for select using (clinic_id = get_my_clinic_id());

create policy "staff manage bookings"
  on bookings for all using (clinic_id = get_my_clinic_id());

-- ── KB ────────────────────────────────────────────────────
create policy "published kb visible to clinic"
  on kb_qa_pairs for select
  using (clinic_id = get_my_clinic_id() and status = 'published');

create policy "admin/manager manage all kb"
  on kb_qa_pairs for all
  using (clinic_id = get_my_clinic_id() and get_my_role() in ('admin','manager'));

create policy "clinic members view chunks"
  on kb_document_chunks for select using (clinic_id = get_my_clinic_id());

create policy "admin manage kb documents"
  on kb_documents for all
  using (clinic_id = get_my_clinic_id() and get_my_role() in ('admin','manager'));

-- ── Audit & logs ─────────────────────────────────────────
create policy "admin view audit log"
  on audit_log for select
  using (clinic_id = get_my_clinic_id() and get_my_role() in ('admin','manager'));

create policy "system insert audit"
  on audit_log for insert with check (clinic_id = get_my_clinic_id());

create policy "admin view kb logs"
  on kb_query_logs for select
  using (clinic_id = get_my_clinic_id() and get_my_role() in ('admin','manager'));

create policy "system insert kb logs"
  on kb_query_logs for insert with check (clinic_id = get_my_clinic_id());
