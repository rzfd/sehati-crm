-- ── 009: Realtime tambahan + unread tracking + helpers ──

-- Add bookings to realtime publication agar /history pasien live-update saat staff confirm
do $$ begin
  begin alter publication supabase_realtime add table bookings; exception when duplicate_object then null; end;
end $$;

-- ── Conversation read tracking ───────────────────────────
-- Track last_read_at per staff per conversation untuk hitung unread_count.
create table if not exists conversation_reads (
  conversation_id uuid        not null references conversations(id) on delete cascade,
  staff_id        uuid        not null references staff_members(id) on delete cascade,
  last_read_at    timestamptz not null default now(),
  primary key (conversation_id, staff_id)
);

create index if not exists conversation_reads_staff_idx on conversation_reads (staff_id);

alter table conversation_reads enable row level security;

-- Staff hanya bisa lihat & tulis read record mereka sendiri
drop policy if exists "staff own reads" on conversation_reads;
create policy "staff own reads"
  on conversation_reads for all
  using (staff_id = (select id from staff_members where user_id = auth.uid() limit 1))
  with check (staff_id = (select id from staff_members where user_id = auth.uid() limit 1));
