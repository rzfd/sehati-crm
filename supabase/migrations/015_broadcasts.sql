-- ── 015: Marketing broadcast (campaign) ──
create table if not exists broadcasts (
  id              uuid        primary key default gen_random_uuid(),
  clinic_id       uuid        not null references clinics(id) on delete cascade,
  created_by      uuid        references staff_members(id) on delete set null,
  title           text        not null,
  body            text        not null,
  link            text,
  segment_type    text        not null check (segment_type in ('all','new','doctor','tag')),
  segment_value   text,
  recipient_count integer     not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists broadcasts_clinic_idx on broadcasts (clinic_id, created_at desc);

alter table broadcasts enable row level security;

-- Staff klinik bisa lihat riwayat broadcast; insert dilakukan via service role (API).
drop policy if exists "staff view clinic broadcasts" on broadcasts;
create policy "staff view clinic broadcasts"
  on broadcasts for select
  using (clinic_id = (select clinic_id from staff_members where user_id = auth.uid() limit 1));

-- Tambah tipe notifikasi 'broadcast'
alter table notifications drop constraint if exists notifications_type_check;
alter table notifications add constraint notifications_type_check
  check (type in (
    'staff_reply','booking_confirmed','booking_cancelled',
    'booking_completed','booking_reminder','booking_rescheduled','broadcast'
  ));

notify pgrst, 'reload schema';
