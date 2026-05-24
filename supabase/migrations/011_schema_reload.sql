-- ── 011: Force PostgREST schema cache reload ──
--
-- Fix BUG: "Could not find the 'insurance_number' column of 'bookings' in the schema cache" (PGRST204)
-- Penyebab: migration 010 sudah ADD COLUMN insurance_number, tapi PostgREST schema cache
-- belum auto-reload di environment ini.
--
-- Migration ini bersifat idempotent — aman dijalankan berkali-kali.
-- Re-affirm column-add (with if not exists) lalu broadcast reload notice.

alter table bookings add column if not exists payment_status     text default 'unpaid';
alter table bookings add column if not exists payment_method     text;
alter table bookings add column if not exists insurance_provider text;
alter table bookings add column if not exists insurance_number   text;

-- Re-add check constraint kalau hilang (defensif)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'bookings_payment_status_check'
  ) then
    alter table bookings add constraint bookings_payment_status_check
      check (payment_status in ('unpaid','paid','insurance_pending','insurance_covered','waived'));
  end if;
end$$;

-- Trigger PostgREST schema cache reload
notify pgrst, 'reload schema';
