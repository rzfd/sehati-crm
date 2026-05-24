-- ── 012: Allow patient to create own booking ──
--
-- Bug: POST /api/booking gagal dengan error 42501
--   "new row violates row-level security policy for table 'bookings'"
--
-- Root cause: di 004_rls_policies.sql, policy untuk bookings cuma:
--   - "patient view own bookings"   → SELECT only
--   - "staff view clinic bookings"  → SELECT only
--   - "staff manage bookings"       → FOR ALL, tapi pakai get_my_clinic_id()
--     yang baca dari staff_members → pasien (bukan staff) gak match.
--
-- Akibatnya pasien gak punya INSERT permission ke tabel bookings sama sekali,
-- padahal flow self-booking dari /booking emang harus bisa.
--
-- Fix: tambah INSERT policy khusus pasien — pasien hanya boleh insert booking
-- dengan patient_id = patient_id miliknya sendiri.

drop policy if exists "patient create own booking" on bookings;
create policy "patient create own booking"
  on bookings for insert
  with check (patient_id = get_my_patient_id());

-- Trigger schema cache reload supaya PostgREST recognise policy baru
notify pgrst, 'reload schema';
