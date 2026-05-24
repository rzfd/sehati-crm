# Sehati CRM — Architecture & API Reference

**Version:** 0.1.0
**Generated:** 2026-05-13
**Stack:** Next.js 16 · React 19 · TypeScript · Supabase Postgres · Anthropic Claude · Voyage AI · Tailwind v4

---

## 1. Overview

Sehati CRM adalah AI-powered CRM untuk klinik di Indonesia. Sistem ini mengelola chat pasien lewat in-app messaging dengan tiga aktor:

- **Pasien** — chat ke klinik, booking janji, lihat riwayat (web-app, bottom-nav layout)
- **Staff** — handle inbox chat, kalender booking, dashboard (sidebar layout)
- **Admin** — kelola knowledge base, dokter, staff, settings (purple sidebar)

AI bot (Claude Haiku/Sonnet + Voyage embeddings) menjawab pertanyaan FAQ secara otomatis lewat 4-layer pipeline, dan eskalasi ke staff untuk apa pun yang medis, urgent, atau di luar confidence threshold.

### Tech stack

| Layer | Pilihan |
|---|---|
| Framework | Next.js 16 (App Router, RSC default) |
| UI | React 19, Tailwind CSS v4, shadcn/ui custom |
| Type system | TypeScript strict mode |
| Database | Supabase Postgres + pgvector |
| Auth | Supabase Auth (email/password) |
| Realtime | Supabase Realtime (postgres_changes) |
| AI | Anthropic Claude (Haiku 4.5 + Sonnet 4.6) |
| Embedding | Voyage AI `voyage-3-lite` (512-dim) |
| Toast | sonner |
| Date | date-fns + id locale |

---

## 2. Project Structure

```
src/
├── app/
│   ├── (auth)/          login, register, forgot-password, reset-password
│   ├── (patient)/       home, chat, booking, history, profile, onboarding
│   ├── (staff)/         inbox, calendar
│   ├── (admin)/         kb/{,/qa,/documents,/gaps}, doctors, staff,
│   │                    audit-log, security, settings, templates
│   ├── dashboard/       (shared by staff + admin)
│   └── api/             65+ route handlers (lihat §6)
├── components/
│   ├── booking/         BookingForm, BookingCalendar, SlotPicker, AIBookingCard
│   ├── chat/            ChatBubble, SmartReplyPanel, UrgentBanner
│   ├── inbox/           ChatList, ChatListItem, ConversationView, TriagePanel,
│   │                    PatientDetail, PatientSearchBar, SmartReplyPanel
│   ├── kb/              QAEditor, QAList, DocumentUpload, DocumentDeleteButton, AIPreview
│   ├── dashboard/       KPICard, VolumeChart, AIPerformanceSection, AnomalyBanner
│   ├── admin/           ScheduleEditor
│   ├── layout/          StaffSidebar, AdminSidebar, PatientBottomNav, AppHeader, Breadcrumb
│   ├── shared/          Logo, Avatar, EmptyState, StatusPill, ThemeProvider, Skeleton, Toaster
│   └── ui/              (shadcn primitives: button, input, label, card)
├── lib/
│   ├── ai/              gatekeeper, triage, smart-reply, auto-reply, booking-extract,
│   │                    pipeline (orchestrator), prompts, anthropic, keyword-filter
│   ├── routing/         decision-tree, doctor-detect, specialty-classifier,
│   │                    schedule-check, fallback
│   ├── supabase/        client (browser), server (RSC), service (admin), middleware
│   ├── kb.ts            RAG retrieval pipeline
│   ├── voyage.ts        Voyage AI embedding client
│   ├── kb-parser.ts     PDF/DOCX/TXT parser untuk KB upload
│   ├── constants.ts     URGENT_KEYWORDS, AI_CONFIG, STAFF_ROLES, dll.
│   ├── format.ts        formatDoctorName (strip duplicate title prefix)
│   ├── audit.ts         logAudit helper
│   ├── observability.ts metrics + structured logging
│   ├── rate-limit.ts    per-user / per-clinic rate limiter
│   ├── csv.ts           CSV builder untuk export
│   ├── i18n.ts          locale helpers (saat ini ID-only)
│   ├── toast.ts         sonner wrapper (success/error/confirm)
│   └── utils.ts         cn() classNames helper
├── hooks/
│   ├── useCurrentUser.ts
│   ├── useConversations.ts
│   ├── useInbox.ts
│   ├── useRealtimeChat.ts
│   ├── useSmartReply.ts
│   └── useUrgentCount.ts
└── types/
    ├── database.ts      generated dari schema Supabase
    ├── chat.ts
    └── ai.ts
```

### Naming conventions

- **Component file:** PascalCase (`ChatBubble.tsx`)
- **Component name:** PascalCase
- **Route file:** kebab-case (`forgot-password/page.tsx`)
- **Lib file:** kebab-case (`smart-reply.ts`)
- **All user-facing string:** Bahasa Indonesia
- **All code identifier:** English

---

## 3. Database Schema

Postgres + pgvector. Migrations di `supabase/migrations/00X_*.sql`, applied lewat `npm run migrate`.

### Core tables (migration 001)

| Tabel | Purpose | Kolom kunci |
|---|---|---|
| `clinics` | Tenant root | id, name, address, phone |
| `doctors` | Dokter aktif klinik | id, clinic_id, name, title, specialty, bio, avatar_url, is_active |
| `doctor_schedules` | Jadwal mingguan dokter | day_of_week, start_time, end_time, slot_duration_minutes |
| `staff_members` | Akun staff (admin/CS/dll.) | id, user_id, clinic_id, role, linked_doctor_id |
| `patients` | Akun pasien | id, user_id, clinic_id, name, phone, date_of_birth, primary_doctor_id, is_new, tags, deleted_at |
| `conversations` | Threads chat pasien↔klinik | id, patient_id, clinic_id, status, urgency_level, category, ai_handled, routed_to_doctor, assigned_to, last_message_at |
| `messages` | Pesan dalam conversation | id, conversation_id, sender_type (patient/staff/ai_bot), content, urgency_level, is_internal |
| `bookings` | Janji konsultasi | id, clinic_id, patient_id, doctor_id, booking_date, booking_time, status (pending/confirmed/completed/no_show/cancelled), notes, conversation_id, payment_method, payment_status, insurance_provider, insurance_number |

### Knowledge Base tables (migration 002)

| Tabel | Purpose |
|---|---|
| `kb_qa_pairs` | Q&A entries (question, answer, embedding vector, status, usage_count, category) |
| `kb_documents` | Uploaded PDF/DOCX/TXT (title, file_size_bytes, chunk_count, status) |
| `kb_document_chunks` | Chunks hasil split + embedding (content, embedding, chunk_idx) |

### Audit & telemetry (migration 003)

| Tabel | Purpose |
|---|---|
| `audit_log` | Mutasi penting (kb edit, role change, booking status, dll.) |
| `kb_query_logs` | Setiap query ke KB (untuk hitung hit rate + KB gaps) |

### Clinic operations (migration 010)

| Tabel | Purpose |
|---|---|
| `doctor_schedule_exceptions` | Cuti/libur one-off dokter (full_day atau partial) |
| `reply_templates` | Template balasan staff (per clinic) |
| `booking_reminders_log` | Tracking reminder H-1 / H-0 supaya tidak dobel kirim |

### Realtime infrastructure (migration 008, 009)

- `supabase_realtime` publication includes: `messages`, `conversations`, `bookings`, `conversation_reads`
- `conversation_reads` — tracking read state per staff
- Function: `bookings_needing_reminder()` — return list booking H-1 yang belum kena reminder

---

## 4. Row Level Security (RLS)

Semua tabel `enable row level security`. Helpers (security definer, stable):

```sql
get_my_clinic_id()  → SELECT clinic_id FROM staff_members WHERE user_id = auth.uid()
get_my_role()       → SELECT role FROM staff_members WHERE user_id = auth.uid()
get_my_patient_id() → SELECT id FROM patients WHERE user_id = auth.uid()
```

### Policy matrix (ringkasan)

| Tabel | Pasien | Staff (clinic) | Admin |
|---|---|---|---|
| **clinics** | view (via patient.clinic_id) | view own | full |
| **doctors** | view (clinic match) | view (clinic match) | manage |
| **doctor_schedules** | view all | view all | manage |
| **doctor_schedule_exceptions** | view all | view all | manage |
| **staff_members** | — | view own clinic | manage |
| **patients** | view/update own record | view + update clinic | full |
| **conversations** | view + create own | view + update clinic | full |
| **messages** | view own (non-internal) + send | view + send clinic | full |
| **bookings** | view own + **create own** + cancel | view + manage clinic | full |
| **kb_qa_pairs** | — | view published clinic | manage |
| **kb_documents** | — | view via chunks | manage |
| **reply_templates** | — | view clinic | manage |
| **audit_log** | — | — | view |
| **kb_query_logs** | — | — | view |

**Note (Sprint 8 fix):** policy `patient create own booking` ditambah di migration 012 untuk mengaktifkan self-booking flow. Sebelumnya pasien hanya punya SELECT, sehingga INSERT ke `bookings` ke-block dengan error 42501.

### Sentitive operations

- **Insert audit_log** — `system insert audit` policy (always allow); diisi via service role atau RLS-bypass helper `logAudit()`.
- **Patient self-register** — `patients` punya policy khusus `patient self register` (migration 007) supaya signup flow tidak butuh service role.
- **Internal notes** — `messages.is_internal = true` di-hide dari pasien lewat policy `patient view own messages` (migration 010 update).

---

## 5. AI Pipeline

### 4-layer pipeline (`src/lib/ai/pipeline.ts`)

```
incoming message
       │
       ▼
┌─────────────────────────────────────────┐
│ L1  Keyword filter (URGENT_KEYWORDS)    │  ← regex check, no AI call
│     → urgent? escalate immediately      │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ L2  Gatekeeper (Haiku, structured JSON) │  ← classify: faq | booking |
│     → category + confidence + reason    │      medical | urgent |
│                                         │      complaint | unclear
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ L3  KB retrieval (Voyage embed → vector │  ← top-3 chunks ≥ 0.70 sim
│     search) → if hit + L2 = faq:        │
│     auto_reply candidate                │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ L4  Confidence gate                     │  ← need ≥ 0.75 confidence
│     ≥ 0.75 → auto-reply via Haiku       │      otherwise escalate
│     < 0.75 → escalate to staff          │
└─────────────────────────────────────────┘

Parallel: Triage (Sonnet) jalan kalau L1=urgent OR L2 ∈ {medical, urgent}.
         → urgency_level 1-4, evidence, recommendation.
```

### Models

| Use | Model | ID |
|---|---|---|
| Gatekeeper, smart-reply, auto-reply, routing classify | Haiku 4.5 | `claude-haiku-4-5` |
| Triage (urgency assessment) | Sonnet 4.6 | `claude-sonnet-4-6` |
| Embedding | Voyage 3 Lite | `voyage-3-lite` (512-dim) |

### Confidence thresholds (`AI_CONFIG`)

- `KB_SIMILARITY_THRESHOLD = 0.70` — minimum cosine similarity untuk KB chunk dianggap match
- `CONFIDENCE_THRESHOLD = 0.75` — minimum confidence dari Haiku untuk trigger auto-reply
- `KB_TOP_K = 3` — chunks yang diretrieve per query
- `CHUNK_SIZE = 800` — target token per chunk
- `CHUNK_OVERLAP = 50` — overlap antar chunk untuk continuity

### Safety rails (CRITICAL)

- Jangan generate auto-diagnose dari gejala
- Jangan generate saran medis spesifik (obat, dosis, diagnosis)
- Semua input medis dari pasien → escalate ke staff
- Label "Asisten AI" harus selalu visible di chat bubble AI
- Triage default fallback = level 3 (high urgency) on error — fail safe

### Urgent keyword blocklist

```ts
URGENT_KEYWORDS = [
  "tidak bisa nafas", "sesak parah", "dada sakit", "stroke", "kejang",
  "darah banyak", "pingsan", "ingin mengakhiri hidup", "bunuh diri",
  "tidak sadar", "muntah darah", "pendarahan hebat",
]
```

Setiap match → bypass L2-L4, langsung escalate dengan urgency_level 4.

---

## 6. API Reference

Total **~70 route handlers** under `/api/*`. Authenticated lewat Supabase session cookie. Service-role hanya dipakai untuk operasi cross-tenant atau bypass RLS (signup, cron).

### Authentication

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Daftar pasien (service-role bypass RLS) |
| POST | `/api/auth/reset-password` | Trigger reset email |
| POST | `/api/auth/signout` | Sign out + clear cookies |

### Chat / Conversations

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/chat` | Patient kirim pesan → trigger AI pipeline |
| GET | `/api/conversations` | List conversations untuk staff (filter: open/urgent/mine/ai_handled) |
| PATCH | `/api/conversations/[id]/status` | Update status (resolved/archived) |
| POST | `/api/conversations/[id]/reroute` | Reroute ke staff lain |
| POST | `/api/conversations/[id]/read` | Mark as read |

### AI endpoints (manual trigger)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/ai/gatekeeper` | Classify single message |
| POST | `/api/ai/triage` | Urgency assessment |
| POST | `/api/ai/smart-reply` | Generate 3 suggested replies |
| POST | `/api/ai/routing` | Route ke dokter terbaik |

### Booking

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/booking` | List bookings (filter clinicId/patientId/upcoming) |
| POST | `/api/booking` | **Create** booking (patient self-book) |
| PATCH | `/api/booking/[id]` | Update status (pending→confirmed→completed/no_show, atau cancel) |
| GET | `/api/booking/doctors` | List dokter aktif untuk picker |
| GET | `/api/booking/slots` | Available slots (doctor_id + date) |

### Doctors & Schedules

| Method | Path | Purpose |
|---|---|---|
| GET / POST | `/api/doctors` | List / create dokter (admin) |
| PATCH / DELETE | `/api/doctors/[id]` | Update / soft-delete |
| GET / POST | `/api/doctors/[id]/schedules` | Manage jadwal mingguan |
| DELETE | `/api/doctors/[id]/schedules/[scheduleId]` | Hapus jadwal |
| GET / POST | `/api/doctors/[id]/exceptions` | Cuti/libur one-off |
| DELETE | `/api/doctors/[id]/exceptions/[exceptionId]` | Hapus exception |

### Knowledge Base

| Method | Path | Purpose |
|---|---|---|
| GET / POST | `/api/kb/qa` | List / create Q&A |
| GET / PATCH / DELETE | `/api/kb/qa/[id]` | CRUD per item |
| POST | `/api/kb/qa/bulk` | Bulk import (CSV) |
| GET / POST | `/api/kb/documents` | List / upload dokumen |
| DELETE | `/api/kb/documents/[id]` | Hapus dokumen |
| POST | `/api/kb/embed` | Re-embed item (trigger Voyage) |
| POST | `/api/kb/search` | Search KB (RAG retrieval) |
| GET | `/api/kb/gaps` | Pertanyaan yang AI tidak bisa jawab (30 hari) |

### Staff & Patient management

| Method | Path | Purpose |
|---|---|---|
| GET / POST | `/api/staff` | List / invite staff (admin) |
| PATCH / DELETE | `/api/staff/[id]` | Update role / remove |
| GET | `/api/patients` | List pasien klinik |
| GET / PATCH | `/api/patient/profile` | View / update own profile |
| POST | `/api/patient/export-data` | Download personal data (GDPR-style) |
| DELETE | `/api/patient/delete-account` | Soft-delete account (set deleted_at) |

### Admin / Clinic / Templates

| Method | Path | Purpose |
|---|---|---|
| GET / PATCH | `/api/clinic` | View / update clinic config |
| GET / POST | `/api/reply-templates` | Manage reply templates |
| PATCH / DELETE | `/api/reply-templates/[id]` | Update / remove template |
| GET | `/api/dashboard` | KPI + volume + AI performance |
| GET | `/api/audit-log` | Audit entries (admin only) |
| GET | `/api/export/bookings` | CSV export bookings |
| GET | `/api/export/audit-log` | CSV export audit |
| GET | `/api/whoami` | Current user + role + clinic |

### Cron

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/cron/booking-reminders` | H-1 reminder runner (call via Supabase cron / Vercel cron) |

---

## 7. Routing Engine

`src/lib/routing/` punya 4 modul untuk decide: ketika ada booking/chat baru, dokter mana yang dirouting?

| Modul | Tugas |
|---|---|
| `specialty-classifier.ts` | Map keyword pasien → specialty (Penyakit Dalam, Anak, dll.) via `SPECIALTY_HINTS` |
| `doctor-detect.ts` | Fuzzy match nama dokter di pesan ("dr. Andi", "Dokter X") |
| `schedule-check.ts` | Cek dokter on-duty saat ini (day_of_week + time range, kurangi exceptions) |
| `fallback.ts` | Kalau spesialis penuh / cuti → suggest dokter umum atau reschedule |
| `decision-tree.ts` | Orchestrator: combine semua di atas → return `{ doctorId, reason, detail }` |

Decision flow:

```
1. Cek doctor-detect (explicit mention)  → assign langsung
2. Cek specialty-classifier              → filter dokter by specialty
3. Cek schedule-check                    → ambil yang on-duty
4. Fallback: kalau kosong → Dokter Umum  → kalau juga kosong → escalate
```

---

## 8. KB / RAG Pipeline

### Ingestion

```
upload PDF/DOCX/TXT
       │
       ▼
parse text (kb-parser.ts: pdf-parse, mammoth, atau plain text)
       │
       ▼
chunk @ 800 token + 50 overlap
       │
       ▼
batch embed via Voyage AI (voyage-3-lite, 512-dim)
       │
       ▼
INSERT kb_document_chunks (content, embedding, chunk_idx)
```

### Retrieval

```ts
const { data } = await supabase.rpc("match_kb_chunks", {
  query_embedding: voyageEmbed(question),
  match_threshold: 0.70,
  match_count:     3,
})
```

RPC `match_kb_chunks` (migration 005) — vector cosine similarity dengan filter `clinic_id`.

### KB query logging

Setiap retrieval di-log ke `kb_query_logs` dengan:
- `query` (pasien)
- `was_used` (boolean — apakah hasil dipakai untuk auto-reply)
- `confidence` (skor maks)
- `category` (dari L2 gatekeeper)

Dipakai untuk:
- **Hit rate** di dashboard
- **KB Gaps** — top queries yang `was_used = false` → admin tambah Q&A baru

### Rate limits (Voyage free tier)

- 3 RPM (request per minute)
- Pipeline degrade: kalau Voyage 429 → KB retrieval skipped → escalate ke staff (by design, jaga safety)

---

## 9. Authentication & Roles

### Auth flow

```
Pasien:
  /register → POST /api/auth/register (service role create user + patients row)
            → auto sign-in
            → /onboarding (pilih primary doctor)
            → /home

Staff:
  invite via admin /staff → email link → /login → /inbox or /dashboard

Admin:
  same as staff but role = "admin" → /dashboard (admin sidebar)
```

### Roles (`STAFF_ROLES`)

| Role | Sidebar | Akses |
|---|---|---|
| `admin` | Admin (purple) | full — KB, doctors, staff, settings, audit |
| `manager` | Admin | KB, dashboard, audit |
| `receptionist` | Staff (blue) | inbox, calendar |
| `cs` | Staff | inbox, calendar |
| `doctor_assistant` | Staff | inbox + kalender (filtered ke assigned doctor) — **no dashboard** |
| `marketing` | Staff | inbox + dashboard |

### Role guards

- **Sidebar:** `hideFor` array per nav item (di-resolve client-side, pessimistic default sembunyikan kalau role belum loaded — cegah flicker)
- **Server:** `dashboard/layout.tsx` redirect `doctor_assistant` → `/inbox` kalau akses langsung lewat URL
- **API:** tiap handler check `staff.role` sebelum action sensitif

---

## 10. Design System

### Color palette (terikat brand)

| Token | Hex | Pakai untuk |
|---|---|---|
| `teal-400` | `#1D9E75` | brand / pasien primary |
| `blue-500` | `#185FA5` | staff |
| `amber-500` | `#BA7517` | warning / manager |
| `red-500` | `#A32D2D` | urgent / danger |
| `purple-500` | `#534AB7` | admin |
| `pink-500` | `#993556` | asisten dokter (asdok) |
| `gray-500` | `#888780` | disabled / muted |

### Chat bubble classes (di `globals.css`)

```tsx
<div className="bubble-patient" />   // teal solid, align kanan
<div className="bubble-ai" />        // teal pucat, border-left, label "Asisten AI"
<div className="bubble-staff" />     // biru pucat, border-left
<div className="bubble-asdok" />     // pink pucat, border-left
```

### Button & pill classes

```tsx
<button className="btn-primary" />   // teal — main CTA
<button className="btn-secondary" /> // ghost
<button className="btn-danger" />    // red — destructive
<button className="btn-purple" />    // purple — admin actions

<span className="pill pill-teal" />
<span className="pill pill-blue" />
<span className="pill pill-amber" />
<span className="pill pill-red" />
<span className="pill pill-purple" />
<span className="pill pill-pink" />
<span className="pill pill-gray" />
```

### Logo component (Sprint 8 style guide)

```tsx
<Logo />                              // default teal, size 28
<Logo size={28} withText variant="purple" />  // admin sidebar
<Logo size={28} withText variant="blue" />    // staff sidebar
<Logo size={24} withText />                   // patient header
<Logo size={40} withText />                   // auth pages
```

### Dark mode

`ThemeProvider` (next-themes) — class strategy. Setiap komponen dengan warna hardcoded harus punya pasangan `dark:` counterpart:

```
bg-white          → dark:bg-neutral-900
bg-gray-50        → dark:bg-neutral-950
text-gray-700     → dark:text-gray-200
text-gray-500     → dark:text-gray-400
border-black/[X]  → dark:border-white/[X]
```

Utility classes di `globals.css` (.card, .input, .nav-item, .btn-*, .pill-*) sudah dark-aware.

---

## 11. Realtime

Supabase Realtime via `postgres_changes` event. `supabase_realtime` publication di-config (migration 008) untuk:

- `messages` — chat updates
- `conversations` — status / urgency changes
- `bookings` — pending → confirmed updates
- `conversation_reads` — read receipts

### Pattern

```ts
const channel = supabase
  .channel(`conversation:${id}`)
  .on("postgres_changes", {
    event:  "INSERT",
    schema: "public",
    table:  "messages",
    filter: `conversation_id=eq.${id}`,
  }, (payload) => addMessage(payload.new))
  .subscribe()

return () => { supabase.removeChannel(channel) }
```

### Used in

- `useRealtimeChat` — patient chat + staff conversation view
- `useInbox` — staff list refresh on new message
- `useUrgentCount` — sidebar badge update
- `useConversations` — patient profile recent threads

### Gotcha

`supabase_realtime` publication kosong by default. Symptom "harus hard refresh" = tabel belum di-add. Cek `pg_publication_tables`.

---

## 12. Audit & Observability

### Audit log

`logAudit(supabase, { clinic_id, actor_id, action, target_type, target_id, metadata })` di `src/lib/audit.ts`.

Action format: `<domain>.<verb>` — contoh `booking.confirmed`, `kb_qa.created`, `staff.role_changed`.

Dilihat di `/audit-log` (admin only). Export CSV via `/api/export/audit-log`.

### Observability

`src/lib/observability.ts` — structured logger (`logInfo`, `logError`, `logMetric`). Saat ini console-only; siap di-pipe ke Datadog / Sentry kalau perlu.

### Rate limiting

`src/lib/rate-limit.ts` — in-memory token bucket per user / clinic untuk endpoint berat (AI, KB embed). Production-grade pakai Redis.

---

## 13. Constants & Config (`src/lib/constants.ts`)

| Group | Highlight |
|---|---|
| `URGENT_KEYWORDS` | 12 keyword bahasa Indonesia untuk emergency bypass |
| `COLORS` | brand hex palette |
| `CONVERSATION_STATUS` | `open` / `resolved` / `archived` |
| `BOOKING_STATUS` | `pending` / `confirmed` / `completed` / `no_show` / `cancelled` |
| `KB_STATUS` | `draft` / `published` / `archived` |
| `STAFF_ROLES` | 6 roles (lihat §9) |
| `AI_CONFIG` | model IDs + thresholds |
| `URGENCY_LEVEL` | 1=Rendah, 2=Sedang, 3=Tinggi, 4=Darurat |
| `SENDER_TYPE` | `patient` / `staff` / `ai_bot` |
| `GATEKEEPER_ACTION` | `auto_reply` / `escalate` / `booking_request` |
| `CHAT_CATEGORY` | `faq` / `booking` / `medical` / `urgent` / `complaint` / `unclear` |
| `DOCTOR_SPECIALTY` | 10 specialties hardcoded |
| `SPECIALTY_HINTS` | keyword → specialty map (untuk routing) |
| `APP_CONFIG` | NAME, TAGLINE, SUPPORT_ESCAPE (`"staff"`), MAX_FILE_SIZE_MB, ACCEPTED_MIME |

### Type helpers

```ts
export type StaffRole        = typeof STAFF_ROLES[keyof typeof STAFF_ROLES];
export type BookingStatus    = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
export type KBStatus         = typeof KB_STATUS[keyof typeof KB_STATUS];
export type GatekeeperAction = typeof GATEKEEPER_ACTION[keyof typeof GATEKEEPER_ACTION];
export type ChatCategory     = typeof CHAT_CATEGORY[keyof typeof CHAT_CATEGORY];
export type SenderType       = typeof SENDER_TYPE[keyof typeof SENDER_TYPE];
export type DoctorSpecialty  = typeof DOCTOR_SPECIALTY[keyof typeof DOCTOR_SPECIALTY];
```

---

## 14. Migration History

| Migration | Isi |
|---|---|
| `001_core_tables.sql` | clinics, doctors, doctor_schedules, staff_members, patients, conversations, messages, bookings |
| `002_kb_tables.sql` | kb_qa_pairs, kb_documents, kb_document_chunks (+ pgvector ext) |
| `003_audit_tables.sql` | audit_log, kb_query_logs |
| `004_rls_policies.sql` | semua helper functions + ~29 policies |
| `005_match_kb_rpc.sql` | `match_kb_chunks(query_embedding, threshold, count)` RPC |
| `006_constraints.sql` | tambahan CHECK constraints + unique indexes |
| `007_rls_fix.sql` | patient self-register policy + clinic read access |
| `008_realtime.sql` | realtime publication setup |
| `009_realtime_extras.sql` | conversation_reads tabel + policy + tambah ke publication |
| `010_clinic_ops.sql` | schedule exceptions, internal notes, reply templates, payment/insurance kolom, soft-delete patients, booking reminders log |
| `011_schema_reload.sql` | re-affirm bookings columns + `notify pgrst, 'reload schema'` (fix PGRST204) |
| `012_booking_rls_patient_insert.sql` | INSERT policy untuk patient self-booking (fix RLS 42501) |

### Migration runner

```bash
npm run migrate
```

Driver: `supabase/migrate.ts` — pakai `pg` lib, baca `DATABASE_URL` dari `.env.local`, track applied di `schema_migrations` table. Idempotent (skip yang sudah applied, retry-safe untuk "already exists" errors).

---

## 15. Operational Notes

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     # untuk RLS bypass (signup, cron, kb embed)
DATABASE_URL                  # direct postgres connection (untuk migrate.ts)
ANTHROPIC_API_KEY             # Haiku + Sonnet
VOYAGE_API_KEY                # embedding
NEXT_PUBLIC_APP_URL
```

### Build commands

```bash
npm run dev        # next dev (port 3000)
npm run build      # next build
npm run start      # next start production
npm run lint
npm run migrate    # apply pending migrations to Supabase
```

### Dev gotchas (curated)

- **Jangan hapus `.next/` saat dev jalan** — Next 16 persistent cache di `.next/dev/` rusak kalau dihapus mid-flight. Pakai `tsc --noEmit` saja tanpa clear cache.
- **Voyage free tier 3 RPM** — batch test pipeline konsisten kena 429; pipeline by-design degrade ke escalate, bukan retry-storm.
- **Realtime tabel kosong** — kalau "harus hard refresh", cek `supabase_realtime` publication; tabel belum di-add.

---

## 16. Sprint 8 Changelog (recent)

| Bug | Fix |
|---|---|
| Asdok bisa lihat Dashboard | `StaffSidebar` hideFor + `dashboard/layout` server-side redirect |
| Booking 500 (PGRST204 insurance_number) | migration 011 reload schema + API defensive payload (omit empty optional fields) |
| Display dokter "dr. dr." duplicate | `lib/format.ts` formatDoctorName helper, applied di 5 surface |
| Dark theme inkonsisten | audit + dark: counterparts di booking/history/profile/kb/audit/inbox/admin modal |
| Logo inkonsisten | new `variant="blue"` di Logo, applied per style guide (admin/staff/patient/auth) |
| Booking RLS 42501 (post-fix) | migration 012 `patient create own booking` INSERT policy |
| Calendar drawer no action | tombol Konfirmasi/Selesai/Tidak hadir/Batal di `BookingCalendar` per status |

---

*End of document.*
