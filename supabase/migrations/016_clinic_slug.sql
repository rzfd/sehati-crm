-- ── 016: clinic slug untuk multi-tenant (link registrasi per klinik) ──
alter table clinics add column if not exists slug text;

-- Backfill slug dari name (lowercase, non-alnum → '-'); fallback ke id pendek.
update clinics
set slug = nullif(trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')), '')
where slug is null;
update clinics set slug = 'klinik-' || left(id::text, 8) where slug is null;

create unique index if not exists clinics_slug_idx on clinics (slug);
alter table clinics alter column slug set not null;

notify pgrst, 'reload schema';
