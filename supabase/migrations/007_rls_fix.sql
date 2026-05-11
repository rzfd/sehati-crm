-- ── 007: Missing RLS policies for patient auth flow ──────

-- Patients need to read their own clinic (e.g. to show clinic name in UI)
create policy "patient read own clinic"
  on clinics for select
  using (
    id = (select clinic_id from patients where user_id = auth.uid() limit 1)
  );

-- Patients can insert their own record (used as fallback; primary flow uses service role API)
create policy "patient self register"
  on patients for insert
  with check (user_id = auth.uid());

-- Patients can update their own profile
create policy "patient update own record"
  on patients for update
  using (user_id = auth.uid());
