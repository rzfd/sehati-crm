-- ── 010: Schedule exceptions, internal notes, reply templates, payment, soft delete ──

-- ── 1. Doctor schedule exceptions (cuti/libur one-off) ───
create table if not exists doctor_schedule_exceptions (
  id            uuid        primary key default gen_random_uuid(),
  doctor_id     uuid        not null references doctors(id) on delete cascade,
  clinic_id     uuid        not null references clinics(id) on delete cascade,
  date          date        not null,
  kind          text        not null check (kind in ('full_day','partial')),
  start_time    time,       -- only for kind='partial'
  end_time      time,
  reason        text,
  created_by    uuid        references staff_members(id) on delete set null,
  created_at    timestamptz not null default now(),
  unique (doctor_id, date)
);

create index if not exists dse_doctor_date_idx on doctor_schedule_exceptions (doctor_id, date);

alter table doctor_schedule_exceptions enable row level security;

drop policy if exists "anyone view exceptions" on doctor_schedule_exceptions;
create policy "anyone view exceptions"
  on doctor_schedule_exceptions for select using (true);

drop policy if exists "admin manage exceptions" on doctor_schedule_exceptions;
create policy "admin manage exceptions"
  on doctor_schedule_exceptions for all
  using (clinic_id = (select clinic_id from staff_members where user_id = auth.uid() limit 1));

-- ── 2. Messages: internal note flag (staff-only, hide dari pasien) ──
alter table messages add column if not exists is_internal boolean not null default false;

create index if not exists messages_internal_idx on messages (conversation_id, is_internal);

-- Update patient view policy: hide internal notes
drop policy if exists "patient view own messages" on messages;
create policy "patient view own messages"
  on messages for select
  using (
    is_internal = false
    and conversation_id in (
      select id from conversations where patient_id = (select id from patients where user_id = auth.uid() limit 1)
    )
  );

-- ── 3. Reply templates ───────────────────────────────────
create table if not exists reply_templates (
  id          uuid        primary key default gen_random_uuid(),
  clinic_id   uuid        not null references clinics(id) on delete cascade,
  title       text        not null,
  content     text        not null,
  category    text,       -- e.g. 'greeting','booking','medical_general'
  usage_count integer     not null default 0,
  created_by  uuid        references staff_members(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists reply_templates_clinic_idx on reply_templates (clinic_id);

alter table reply_templates enable row level security;

drop policy if exists "staff view templates" on reply_templates;
create policy "staff view templates"
  on reply_templates for select
  using (clinic_id = (select clinic_id from staff_members where user_id = auth.uid() limit 1));

drop policy if exists "admin manage templates" on reply_templates;
create policy "admin manage templates"
  on reply_templates for all
  using (clinic_id = (select clinic_id from staff_members where user_id = auth.uid() limit 1));

-- ── 4. Bookings: insurance/payment tracking ──────────────
alter table bookings add column if not exists payment_status     text default 'unpaid'
  check (payment_status in ('unpaid','paid','insurance_pending','insurance_covered','waived'));
alter table bookings add column if not exists payment_method     text;
alter table bookings add column if not exists insurance_provider text;
alter table bookings add column if not exists insurance_number   text;

-- ── 5. Soft delete untuk patients (PII compliance) ───────
alter table patients add column if not exists deleted_at timestamptz;
create index if not exists patients_active_idx on patients (clinic_id) where deleted_at is null;

-- ── 6. Booking reminders log (avoid double-send) ────────
create table if not exists booking_reminders_log (
  id         uuid        primary key default gen_random_uuid(),
  booking_id uuid        not null references bookings(id) on delete cascade,
  kind       text        not null check (kind in ('h-1','h-0')),
  sent_at    timestamptz not null default now(),
  unique (booking_id, kind)
);

-- ── 7. SQL function untuk identify bookings perlu reminder H-1 ──
create or replace function bookings_needing_reminder()
returns table (
  booking_id    uuid,
  clinic_id     uuid,
  patient_name  text,
  patient_phone text,
  doctor_name   text,
  booking_date  date,
  booking_time  time
)
language sql
security definer
as $$
  select
    b.id,
    b.clinic_id,
    p.name,
    p.phone,
    d.name,
    b.booking_date,
    b.booking_time
  from bookings b
  join patients p on p.id = b.patient_id
  join doctors d  on d.id = b.doctor_id
  where b.status in ('pending','confirmed')
    and b.booking_date = current_date + interval '1 day'
    and not exists (
      select 1 from booking_reminders_log r
      where r.booking_id = b.id and r.kind = 'h-1'
    )
$$;
