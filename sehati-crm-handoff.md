# Sehati CRM — LLM Handoff Document

> **Cara pakai:** Copy seluruh dokumen ini, paste ke LLM manapun (Claude/ChatGPT/Gemini/Llama). Tambahkan request spesifik di akhir. LLM akan langsung punya full context untuk lanjutkan project.

---

## 0 · Quick context (read this first)

Saya **Kiki**, sedang bikin project personal bernama **Sehati CRM** — AI-powered CRM untuk klinik/RS di Indonesia. Project ini berbasis Next.js + Supabase + Anthropic Claude API, dengan target: bantu klinik kelola chat pasien via in-app messaging dengan AI gatekeeper, knowledge base (RAG), dan smart doctor routing.

**Komunikasi:** Bahasa Indonesia, casual tapi technical. Fonts pilihan: Plus Jakarta Sans + DM Mono.

**Stage saat ini:** Design & architecture sudah selesai. Sudah ada 3 versi dokumen PDF (v1, v2, v3) plus v4 dengan visual mockups. Belum mulai coding.

---

## 1 · Project overview

### Apa itu Sehati CRM

Sistem CRM untuk klinik/RS dengan fokus Indonesia. Bukan WhatsApp-based — pakai **in-app messaging** sendiri supaya tidak depend ke WA Business API yang mahal/lambat.

### Target users (7 persona)

**Sisi pasien:**
- Pasien — akses Sehati app via link/QR, chat dengan klinik, booking, lihat history

**Sisi staff klinik:**
- Hospital Manager (anchor — fokus ROI, retensi pasien, laporan)
- Marketing Team (anchor — kampanye, broadcast)
- Receptionist (daily user — booking, konfirmasi, chat general)
- Customer Service (daily user — keluhan, info umum)
- Doctor Assistant / Asdok (daily user — handle chat untuk dokter mereka, biasanya 1 asdok per dokter)

**Sisi admin (BARU di v3):**
- Admin Klinik (power user — manage KB, jadwal dokter, routing rules, staff accounts)

### 3 perubahan besar evolusi project

**v1 → v2:** Pivot dari WhatsApp Business API ke in-app messaging (alasan: WA terlalu mahal/slow untuk personal project)

**v2 → v3:** Tambah 3 fitur besar:
1. **Database real (Supabase)** — gantikan in-memory store, plus auth + realtime + pgvector
2. **Knowledge base management** — admin tambah Q&A + upload dokumen, RAG pattern
3. **Doctor routing engine** — hybrid auto + override, route chat ke asdok dokter yang tepat

**v3 → v4:** Tambah visual mockup screenshots embedded di PDF (bukan deskripsi text saja)

---

## 2 · Tech stack (sudah ditetapkan)

| Layer | Pilihan |
|-------|---------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Database | Supabase (Postgres + pgvector + Realtime + Auth + Storage) |
| ORM | Supabase JS client |
| Styling | Tailwind CSS + shadcn/ui |
| LLM | Anthropic Claude API (Haiku 4.5 untuk classify/gatekeeper, Sonnet 4.6 untuk triage) |
| Embeddings | Voyage AI (`voyage-3-lite`, 512 dim) — bukan OpenAI |
| State | Zustand untuk UI, Supabase untuk data |
| File storage | Supabase Storage |
| Charts | Recharts atau Chart.js |
| Calendar | FullCalendar React |
| Fonts | Plus Jakarta Sans (display + body), DM Mono (mono) |
| Deployment | Vercel |

**Estimasi biaya operasional:** ~$15/bulan (AI + Voyage + Supabase free tier cukup)

---

## 3 · Design system (final)

### Color tokens

| Token | Hex | Usage |
|-------|-----|-------|
| Primary (teal) | `#1D9E75` | Brand, CTA, success, sisi pasien |
| Info (blue) | `#185FA5` | Informational, staff side |
| Warning (amber) | `#BA7517` | Tentative, manager side |
| Danger (red) | `#A32D2D` | Urgent, error, no-show |
| VIP / Admin (purple) | `#534AB7` | **Admin panel**, premium |
| Asdok (pink) | `#993556` | Doctor assistant view |
| Neutral (gray) | `#888780` | Disabled, secondary |

### 3 jenis chat bubble (penting!)

| Sender | Background | Border | Label |
|--------|-----------|--------|-------|
| Pasien (self) | Teal solid `#1D9E75` | — | Aligned right |
| AI Bot | Teal pucat `#E1F5EE` | Border-left teal | "Asisten AI" + sparkles icon |
| Staff (general) | Biru pucat `#E6F1FB` | Border-left blue | Nama staff |
| Doctor Assistant | Pink pucat `#FBEAF0` | Border-left pink | "Asdok dr. [Nama]" |

### Typography

- **H1:** 22px / weight 500
- **H2:** 18px / weight 500
- **H3:** 16px / weight 500
- **Body:** 16px / weight 400
- **Small:** 13px / weight 400
- **Tiny:** 11px / weight 400
- **Mono:** 13px / weight 400 (untuk IDs, kode, timestamps)

### Status pills (consistent)

`Aktif` `Pasien baru` `Follow-up` `Urgent` `VIP` `Selesai`
KB-specific: `Published` `Draft` `Archived` `High usage` `Needs review`

---

## 4 · AI features (6 total)

### 1. AI Gatekeeper (Haiku)
Layer pertama filter pesan masuk. Trigger setiap pesan pasien.

**4-layer safety architecture:**
1. Keyword blocklist (medis darurat keywords) → langsung escalate
2. AI category=medical/complaint → escalate, jangan auto-reply
3. KB similarity < 0.7 → escalate, jangan halusinasi
4. Confidence < 0.75 → escalate dengan flag uncertain

**Critical URGENT_KEYWORDS:** "tidak bisa nafas", "sesak parah", "dada sakit", "stroke", "kejang", "darah banyak", "pingsan", "ingin mengakhiri hidup", "bunuh diri", "tidak sadar", "muntah darah", "pendarahan hebat"

### 2. KB Retrieval / RAG (NEW v3 — Voyage + Claude)
- Embed query pasien dengan Voyage `voyage-3-lite` (512 dim)
- Vector search di pgvector dengan cosine similarity, top-3 chunks
- Threshold similarity ≥ 0.7
- Augment prompt dengan retrieved context → Claude generate jawaban grounded

### 3. Doctor Routing Classifier (NEW v3 — Haiku)
Extract dari pesan:
- `doctor_mention`: nama dokter yang disebut
- `specialty_hint`: spesialisasi relevan (PD/Anak/Umum/Obgyn)
- `context_clue`: continuity? (lanjutan/kontrol)

### 4. Smart Reply (Haiku)
Generate 3 draft balasan untuk staff dalam 3 tone: formal, hangat, singkat.

### 5. Auto-tag Chat (Haiku)
Klasifikasi category + urgency_level + routing_target.

### 6. Triage Urgency (Sonnet — high stakes)
Detect kondisi darurat medis. Pakai Sonnet karena consequence salah sangat tinggi.

### Forbidden features
**JANGAN BIKIN:**
- Auto-diagnose dari gejala (UU Praktik Kedokteran Indonesia melarang)
- Saran medis specific (obat, dosis, diagnosis)
- Hide AI involvement dari pasien

---

## 5 · Database schema (12 tabel Supabase)

### Core tables (8)
- `clinics` — info klinik
- `doctors` — list dokter dengan specialty & profile
- `doctor_schedules` — jadwal mingguan per dokter
- `staff_members` — akun staff dengan role + linked_doctor_id (untuk asdok)
- `patients` — info pasien + primary_doctor_id
- `conversations` — chat sessions dengan assigned_to + routed_to_doctor
- `messages` — pesan dengan ai_metadata (KB sources, confidence)
- `bookings` — janji dengan status (pending/confirmed/completed/no_show/cancelled)

### Knowledge base tables (3)
- `kb_qa_pairs` — Q&A pairs dengan embedding vector(512)
- `kb_documents` — uploaded files metadata
- `kb_document_chunks` — chunks 500-1000 token dengan embeddings

### Audit & analytics tables (2)
- `audit_log` — semua action admin di-log
- `kb_query_logs` — track KB retrieval untuk metric "KB hit rate"

### Plus RPC function `match_kb`
Vector search RPC yang search di `kb_qa_pairs` UNION `kb_document_chunks` dengan threshold filter.

### Row Level Security policies
- Pasien hanya akses conversations mereka
- Staff akses conversations yang di-assign
- Admin akses semua

---

## 6 · 12 UI mockups (sudah dibuat)

### Staff workspace (4 desktop)
1. **Inbox normal** — 3-pane (chat list / conversation / detail), smart reply panel dengan 3 tone
2. **Inbox urgent** — banner merah, AI triage analysis dengan evidence quotes, disable input
3. **Manager dashboard** — KPIs + AI/KB performance section + KB gaps actionable
4. **Booking calendar** — week view color-coded per dokter + AI booking approval panel

### Patient app (4 mobile)
5. **Welcome/Home** — greeting personal + janji berikutnya + 2 CTAs
6. **Chat** — 3 bubble types (pasien teal, AI teal-pucat, staff blue-pucat), typing indicator
7. **Booking form** — step-by-step (dokter → hari → jam → catatan), slot full grayout dengan strikethrough
8. **History** — upcoming + riwayat dengan border-left status colors

### Admin panel (4 desktop — BARU v3)
9. **KB Dashboard** — purple themed, 4 KPIs, KB gaps actionable, recent activity feed
10. **Q&A Editor** — 3-pane dengan form + AI Preview live test panel
11. **Document Upload** — drag-drop zone, processing state dengan pulse animation
12. **Doctor Schedule** — list dokter + weekly schedule grid 7×4 + legend

---

## 7 · Development roadmap (9-12 minggu)

### Sprint 0 · Setup & infra (1-2 mgg)
Supabase project, schema, RLS, pgvector, Next.js bootstrap, auth pages, dummy data

### Sprint 1 · Knowledge base (1-2 mgg)
Admin panel layout, Q&A CRUD, document upload pipeline, Voyage integration, vector search RPC

### Sprint 2 · AI gatekeeper + RAG (1-2 mgg)
Gatekeeper classifier, keyword blocklist, RAG prompt template, citation tracking

### Sprint 3 · Doctor routing (1 mgg)
Name detection, specialty classification, schedule check, routing rules, reroute action

### Sprint 4 · Patient app (1-2 mgg)
Onboarding, home, chat dengan 3 bubble types, booking form, history, PWA config

### Sprint 5 · Staff workspace (1-2 mgg)
Inbox 3-pane, conversation view, smart reply, triage detection, asdok variant, calendar

### Sprint 6 · Manager dashboard + admin polish (1 mgg)
KPI cards, KB gaps panel, doctor workload, audit log viewer, empty states

### Sprint 7 · Polish & deploy (1 mgg)
Mobile responsive, performance, deploy ke Vercel, RLS review

---

## 8 · Penting untuk diingat

### Legal/ethical
- **JANGAN auto-diagnose** dari gejala — illegal di Indonesia
- **JANGAN saran medis specific** — semua medis HARUS escalate ke staff
- **DISCLOSE AI involvement** ke pasien — label "Asisten AI" jelas
- **PRIVACY**: comply UU PDP Indonesia (UU 27/2022)

### KB content guidelines
**BOLEH masuk KB:**
- Info administrasi (jam buka, lokasi, biaya, asuransi)
- Profile dokter (pendidikan, pengalaman)
- Cara booking, payment, reschedule
- Promo & event klinik

**TIDAK BOLEH:**
- Saran medis specific
- Interpretasi gejala
- Patient medical history (privacy)
- Internal SOP sensitif

### UX anti-patterns to avoid
- Tidak ada auto-send staff message (selalu manual confirm)
- Tidak menyembunyikan AI involvement
- Tidak overload urgent banner (alert fatigue)
- Tidak block escape hatch (ketik 'staff' selalu available)
- Tidak default ke generate kalau KB miss (escalate, jangan halusinasi)
- Tidak auto-route urgent (semua staff lihat, bukan cuma 1)

### Communication style preferences
- Bahasa Indonesia, casual tapi technical
- Pakai `ask_user_input_v0` tool kalau ada multiple-choice question (kalau LLM punya)
- Concise tapi thorough, gak banyak boilerplate
- Use Indonesian patient names di example (Bu Sari, Pak Budi, dr. Andi)
- Real-world Indonesian context (BPJS, klinik, dokter spesialis nomenklatur)

---

## 9 · Format preferences untuk LLM output

### Markdown formatting
- Heading levels: gunakan `##` untuk section, `###` untuk subsection
- Code blocks: pakai language-specific fence (` ```typescript `, ` ```sql `)
- Tables untuk data terstruktur
- Bullet lists untuk enumeration, numbered untuk sequence

### Code style
- TypeScript strict mode
- Server components default, client components hanya kalau perlu interactivity
- Tailwind classes inline (bukan @apply)
- Component naming: PascalCase, file kebab-case (`patient-chat.tsx`)
- Supabase query: gunakan typed result

### Documentation style
- Setiap function/component punya 1-2 line JSDoc comment
- Comment kompleks logic, bukan obvious code
- Error handling explicit, gak silent fail
- Bahasa Indonesia untuk user-facing strings, English untuk code identifiers

---

## 10 · Continuation prompts (template)

Tinggal pilih sesuai kebutuhan, paste setelah handoff document ini:

### A. Mulai coding
```
Aku mau mulai Sprint 0 (setup & infrastructure). Tolong panduan step-by-step:
1. Setup Supabase project dengan schema yang sudah didesain
2. Bootstrap Next.js project dengan stack di section 2
3. Configure environment variables
4. Setup auth flow (login, register, magic link)

Mulai dari step 1 dulu, tunggu konfirmasi sebelum lanjut step berikutnya.
```

### B. Implementasi fitur specific
```
Aku mau implement [NAMA FITUR, misal: AI Gatekeeper dengan RAG].

Berdasarkan spec di section 4, tolong:
1. Buat file structure yang diperlukan
2. Code untuk pipeline lengkap (gatekeeper → RAG → response)
3. Error handling dan type safety
4. Contoh test case dengan dummy data

Pakai TypeScript strict mode dan Supabase typed client.
```

### C. Generate dummy data
```
Aku butuh seed data untuk development. Generate SQL atau TypeScript untuk:
- 1 klinik
- 3 dokter (Andi PD, Siti Anak, Budi Umum) dengan jadwal
- 5 staff members (admin, manager, 2 receptionist, 1 asdok)
- 20 patients dengan profile Indonesian realistic
- 30 conversations + 150 messages
- 50 KB Q&A pairs dalam Bahasa Indonesia (FAQ klinik realistic)
- 15 bookings (mix pending/confirmed/completed/no_show)
```

### D. Debug atau review
```
Aku stuck di [DESKRIPSI MASALAH]. Berikut code-nya:
[PASTE CODE]

Konteks: ini bagian dari [FITUR/MODULE]. Goal: [GOAL]. Yang terjadi: [ACTUAL]. Yang diharapkan: [EXPECTED].

Tolong:
1. Identify root cause
2. Saran solusi (multiple options kalau ada)
3. Code fix dengan explanation
```

### E. Design iteration
```
Aku mau iterate design untuk [VIEW NAME]. Current state:
[PASTE HTML/SCREENSHOT DESCRIPTION]

Yang aku mau ubah:
- [PERUBAHAN 1]
- [PERUBAHAN 2]

Rationale: [ALASAN]

Tolong proposed redesign yang tetap konsisten dengan design system di section 3.
```

### F. Architectural decision
```
Aku perlu decide antara [OPTION A] vs [OPTION B] untuk [PROBLEM].

Konteks:
- [KONTEKS 1]
- [KONTEKS 2]

Constraints:
- Personal project, budget terbatas
- Indonesia market
- Tech stack di section 2

Tolong analisis trade-off dan recommendation, plus 2nd-order effects.
```

### G. Lanjutkan dari checkpoint specific
```
Aku mau lanjutkan dari checkpoint [NAMA, misal: "Sprint 1 - Q&A CRUD"].

Berdasarkan progress di section 11 (checkpoint state), kira-kira yang sudah selesai: [ITEMS].
Yang belum: [ITEMS].

Tolong lanjutkan dari [NEXT TASK].
```

---

## 11 · Checkpoint state (UPDATE INI saat progress!)

### Current status: Design phase complete, belum mulai coding

### Completed ✅
- [x] v1 design doc — WhatsApp-based concept (30 pages PDF)
- [x] v2 design doc — pivot ke in-app messaging (31 pages PDF)
- [x] v3 design doc — + KB management + doctor routing + Supabase (44 pages PDF)
- [x] v4 design doc — visual mockups embedded (32 pages PDF dengan 12 screenshots)
- [x] 12 mockup HTML files (production-grade)
- [x] Design system tokens finalized
- [x] Tech stack decisions
- [x] Database schema (12 tabel)
- [x] AI feature specs (6 features)

### Not started ⏳
- [ ] Sprint 0: Setup Supabase + Next.js bootstrap
- [ ] Sprint 1: KB management CRUD
- [ ] Sprint 2: AI gatekeeper + RAG implementation
- [ ] Sprint 3: Doctor routing engine
- [ ] Sprint 4: Patient app
- [ ] Sprint 5: Staff workspace
- [ ] Sprint 6: Manager dashboard + admin polish
- [ ] Sprint 7: Polish & deploy

### Pending decisions (revisit later)
- [ ] Hosting database production (Supabase free tier untuk dev, paid kalau prod)
- [ ] PWA strategy (manifest + service worker config)
- [ ] Push notification provider (Web Push native vs OneSignal)
- [ ] Email provider untuk staff invite (Resend vs Supabase built-in)
- [ ] SMS OTP provider untuk pasien onboarding (Twilio vs Indonesian provider)

---

## 12 · File asset inventory

### Documents (di `/mnt/user-data/outputs/`)
- `Sehati-CRM-Design-Document.pdf` (v1, 30 pages) — original WhatsApp concept
- `Sehati-CRM-v2-In-App-Messaging.pdf` (v2, 31 pages) — in-app pivot
- `Sehati-CRM-v3-KB-DoctorRouting.pdf` (v3, 44 pages) — comprehensive design
- `Sehati-CRM-v4-Visual-Mockups.pdf` (v4, 32 pages) — visual mockups

### Source HTML (di `/home/claude/sehati-v3/mockups/`)
- `01-staff-inbox-normal.html`
- `02-staff-inbox-urgent.html`
- `03-manager-dashboard.html`
- `04-staff-calendar.html`
- `05-patient-home.html`
- `06-patient-chat.html`
- `07-patient-booking.html`
- `08-patient-history.html`
- `09-admin-kb-dashboard.html`
- `10-admin-kb-editor.html`
- `11-admin-document-upload.html`
- `12-admin-doctor-schedule.html`

### Screenshots (di `/home/claude/sehati-v3/screenshots/`)
12 PNG files dari rendering HTML mockups (dipakai di v4 PDF)

---

## 13 · Sample environment variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
VOYAGE_API_KEY=pa-...
NEXT_PUBLIC_APP_URL=https://sehati.app
```

---

## 14 · Quick reference — Critical prompts

### AI Gatekeeper system prompt
```
Kamu adalah asisten virtual Klinik Sehati.

Kamu MEMILIKI akses ke knowledge base klinik.
Jawab pertanyaan pasien HANYA berdasarkan informasi
di bagian KNOWLEDGE BASE CONTEXT di bawah.

JIKA INFO ADA DI KB:
- Jawab dengan natural dan ramah
- Jangan sebutkan "menurut knowledge base"

JIKA INFO TIDAK ADA DI KB:
- Set action="escalate"
- Jangan coba jawab dari pengetahuan umum
- Beri pesan: "Pertanyaan ini akan dibantu oleh staff klinik."

ATURAN MUTLAK:
1. JANGAN PERNAH kasih saran medis (obat, dosis, diagnosis)
2. Untuk indikasi darurat → sarankan IGD/119 + flag urgent
3. JANGAN halusinasi info yang tidak ada di KB

OUTPUT JSON:
{
  "action": "auto_reply" | "escalate" | "booking_request",
  "category": "faq" | "booking" | "medical" | "urgent" | "complaint" | "unclear",
  "reply_text": string,
  "kb_sources_used": [chunk_ids],
  "confidence": float,
  "needs_doctor_routing": boolean,
  "detected_doctor": string | null,
  "detected_specialty": string | null
}
```

### Smart Reply system prompt
```
Generate 3 draft balasan untuk staff klinik Sehati,
masing-masing dengan tone berbeda: formal, hangat, singkat.

Context:
- Pesan pasien: [MESSAGE]
- Profile pasien: [PROFILE]
- KB sources (jika ada): [KB_CONTEXT]

Output JSON: [{ tone, text }, { tone, text }, { tone, text }]

Jangan kasih saran medis. Kalau topiknya medis, suggest staff escalate.
```

### Triage system prompt
```
Analisa pesan pasien untuk indikasi darurat medis.
Pakai pendekatan precaution-first.

URGENT_KEYWORDS yang harus escalate:
"tidak bisa nafas", "sesak parah", "dada sakit",
"stroke", "kejang", "darah banyak", "pingsan",
"ingin mengakhiri hidup", "bunuh diri",
"tidak sadar", "muntah darah", "pendarahan hebat"

Output JSON:
{
  "urgency_level": 1-4,
  "is_emergency": boolean,
  "evidence_quotes": [string],
  "recommended_actions": [string],
  "confidence": float
}

DISCLAIMER (always include in response):
"Ini hanya triage administratif — keputusan klinis tetap di tangan dokter."
```

---

## 15 · Bagaimana cara melanjutkan kalau context window habis

1. **Save dokumen ini** sebagai `sehati-crm-handoff.md` di lokal
2. **Update section 11 (Checkpoint state)** setiap selesai milestone
3. **Buka conversation baru** di LLM manapun
4. **Paste dokumen ini DUlu**
5. **Tambahkan continuation prompt** dari section 10 sesuai kebutuhan
6. **LLM akan punya full context** untuk lanjutkan

### Quick start template (untuk paste di LLM baru)

```
Halo! Aku Kiki, lagi lanjutkan project Sehati CRM.

[PASTE FULL HANDOFF DOCUMENT INI]

---

Sekarang aku mau: [TUJUAN SPESIFIK]

Tolong [PERMINTAAN].
```

---

**End of handoff document.**

*Last updated: 10 Mei 2026 · Versi handoff 1.0*
