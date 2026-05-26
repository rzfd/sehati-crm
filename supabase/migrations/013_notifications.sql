-- ── 013: Patient notifications (in-app) + web push subscriptions ──

-- ── 1. Notifications (patient-facing) ────────────────────
create table if not exists notifications (
  id          uuid        primary key default gen_random_uuid(),
  clinic_id   uuid        not null references clinics(id) on delete cascade,
  patient_id  uuid        not null references patients(id) on delete cascade,
  type        text        not null check (type in (
                'staff_reply','booking_confirmed','booking_cancelled',
                'booking_completed','booking_reminder')),
  title       text        not null,
  body        text        not null,
  link        text,                         -- in-app deep link, mis. /chat atau /history
  metadata    jsonb       not null default '{}'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_patient_idx on notifications (patient_id, created_at desc);
create index if not exists notifications_unread_idx  on notifications (patient_id) where read_at is null;

alter table notifications enable row level security;

-- Pasien hanya melihat & menandai-baca notifikasi miliknya sendiri.
-- INSERT hanya via service role (notify() helper) — tidak ada insert policy.
drop policy if exists "patient view own notifications" on notifications;
create policy "patient view own notifications"
  on notifications for select
  using (patient_id = (select id from patients where user_id = auth.uid() limit 1));

drop policy if exists "patient update own notifications" on notifications;
create policy "patient update own notifications"
  on notifications for update
  using (patient_id = (select id from patients where user_id = auth.uid() limit 1))
  with check (patient_id = (select id from patients where user_id = auth.uid() limit 1));

-- ── 2. Web push subscriptions ────────────────────────────
create table if not exists push_subscriptions (
  id          uuid        primary key default gen_random_uuid(),
  patient_id  uuid        not null references patients(id) on delete cascade,
  endpoint    text        not null unique,
  p256dh      text        not null,
  auth        text        not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists push_subs_patient_idx on push_subscriptions (patient_id);

alter table push_subscriptions enable row level security;

-- Pasien mengelola subscription push miliknya sendiri (insert/select/delete).
-- notify() membaca subscription via service role untuk kirim push.
drop policy if exists "patient manage own push subs" on push_subscriptions;
create policy "patient manage own push subs"
  on push_subscriptions for all
  using (patient_id = (select id from patients where user_id = auth.uid() limit 1))
  with check (patient_id = (select id from patients where user_id = auth.uid() limit 1));

-- ── 3. Realtime: bell pasien live-update saat notifikasi masuk ──
do $$ begin
  begin alter publication supabase_realtime add table notifications; exception when duplicate_object then null; end;
end $$;

-- ── 4. Reminder RPC: tambah patient_id agar cron bisa buat notifikasi ──
drop function if exists bookings_needing_reminder();
create function bookings_needing_reminder()
returns table (
  booking_id    uuid,
  clinic_id     uuid,
  patient_id    uuid,
  patient_name  text,
  patient_phone text,
  doctor_name   text,
  booking_date  date,
  booking_time  time
)
language sql
security definer
as $$
  select b.id, b.clinic_id, b.patient_id, p.name, p.phone, d.name, b.booking_date, b.booking_time
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

-- ── 5. Reload PostgREST schema cache (tabel baru langsung kebaca) ──
notify pgrst, 'reload schema';
