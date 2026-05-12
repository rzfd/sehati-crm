-- ── 008: Enable Supabase Realtime publication ────────────
-- Default `supabase_realtime` publication kosong setelah project create.
-- Tanpa ini, channel.on("postgres_changes") tidak akan deliver INSERT/UPDATE.
-- Idempotent: kalau tabel sudah masuk publication, skip tanpa error.

do $$
begin
  begin
    alter publication supabase_realtime add table messages;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table conversations;
  exception when duplicate_object then null;
  end;
end $$;
