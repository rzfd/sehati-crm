-- ── 001: Core tables ─────────────────────────────────────

create extension if not exists vector;

-- ── Clinics ──────────────────────────────────────────────
create table clinics (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  address    text,
  phone      text,
  logo_url   text,
  settings   jsonb       not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Doctors ──────────────────────────────────────────────
create table doctors (
  id         uuid        primary key default gen_random_uuid(),
  clinic_id  uuid        not null references clinics(id) on delete cascade,
  name       text        not null,
  specialty  text        not null,
  title      text        not null default 'dr.',
  bio        text,
  avatar_url text,
  is_active  boolean     not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Doctor schedules (weekly recurring) ──────────────────
create table doctor_schedules (
  id                    uuid        primary key default gen_random_uuid(),
  doctor_id             uuid        not null references doctors(id) on delete cascade,
  day_of_week           integer     not null check (day_of_week between 0 and 6),
  start_time            time        not null,
  end_time              time        not null,
  slot_duration_minutes integer     not null default 30,
  max_patients          integer     not null default 20,
  created_at            timestamptz not null default now(),
  constraint doctor_schedules_time_check check (start_time < end_time)
);

-- ── Staff members ─────────────────────────────────────────
create table staff_members (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        references auth.users(id) on delete set null,
  clinic_id        uuid        not null references clinics(id) on delete cascade,
  name             text        not null,
  role             text        not null check (role in ('admin','manager','receptionist','cs','doctor_assistant','marketing')),
  linked_doctor_id uuid        references doctors(id) on delete set null,
  avatar_url       text,
  is_active        boolean     not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- one auth user maps to at most one staff member
create unique index staff_members_user_id_unique on staff_members (user_id) where user_id is not null;

-- ── Patients ─────────────────────────────────────────────
create table patients (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        references auth.users(id) on delete set null,
  clinic_id         uuid        not null references clinics(id) on delete cascade,
  name              text        not null,
  phone             text,
  date_of_birth     date,
  primary_doctor_id uuid        references doctors(id) on delete set null,
  is_new            boolean     not null default true,
  tags              text[]      not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- one auth user maps to at most one patient record
create unique index patients_user_id_unique on patients (user_id) where user_id is not null;

-- ── Conversations ─────────────────────────────────────────
create table conversations (
  id               uuid        primary key default gen_random_uuid(),
  clinic_id        uuid        not null references clinics(id) on delete cascade,
  patient_id       uuid        not null references patients(id) on delete cascade,
  assigned_to      uuid        references staff_members(id) on delete set null,
  routed_to_doctor uuid        references doctors(id) on delete set null,
  status           text        not null default 'open' check (status in ('open','resolved','archived')),
  category         text        check (category in ('faq','booking','medical','urgent','complaint','unclear')),
  urgency_level    integer     not null default 1 check (urgency_level between 1 and 4),
  ai_handled       boolean     not null default false,
  last_message_at  timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── Messages ─────────────────────────────────────────────
create table messages (
  id              uuid        primary key default gen_random_uuid(),
  conversation_id uuid        not null references conversations(id) on delete cascade,
  sender_type     text        not null check (sender_type in ('patient','staff','ai_bot')),
  sender_id       uuid,   -- polymorphic: patients.id | staff_members.id | null for ai_bot
  content         text        not null,
  metadata        jsonb,
  is_read         boolean     not null default false,
  created_at      timestamptz not null default now()
);

-- ── Bookings ─────────────────────────────────────────────
create table bookings (
  id              uuid        primary key default gen_random_uuid(),
  clinic_id       uuid        not null references clinics(id) on delete cascade,
  patient_id      uuid        not null references patients(id) on delete cascade,
  doctor_id       uuid        not null references doctors(id) on delete cascade,
  conversation_id uuid        references conversations(id) on delete set null,
  booking_date    date        not null,
  booking_time    time        not null,
  status          text        not null default 'pending' check (status in ('pending','confirmed','completed','no_show','cancelled')),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────
create index conversations_clinic_status_idx  on conversations (clinic_id, status);
create index conversations_patient_idx         on conversations (patient_id);
create index conversations_assigned_to_idx     on conversations (assigned_to);
create index conversations_last_message_at_idx on conversations (last_message_at desc);
create index messages_conversation_created_idx on messages (conversation_id, created_at);
create index bookings_doctor_date_idx          on bookings (doctor_id, booking_date);
create index bookings_patient_idx              on bookings (patient_id);
create index bookings_clinic_status_idx        on bookings (clinic_id, status);
