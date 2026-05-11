# Sehati CRM — Continuation Prompts Cheat Sheet

> Template prompts siap pakai untuk berbagai skenario. Paste setelah handoff document (full atau compact).

---

## 🚀 A. Mulai coding dari awal

```
Aku mau mulai Sprint 0 (setup & infrastructure). Tolong panduan step-by-step:

1. Setup Supabase project dengan schema yang sudah didesain (12 tables + RPC match_kb + RLS policies)
2. Bootstrap Next.js project dengan stack di section 2
3. Configure environment variables
4. Setup auth flow (login, register, magic link)

Mulai dari step 1 dulu, tunggu konfirmasi sebelum lanjut step berikutnya. Pakai TypeScript strict mode.
```

---

## 🧩 B. Implementasi fitur specific

```
Aku mau implement [NAMA_FITUR].

Berdasarkan spec di handoff document, tolong:
1. Buat file structure yang diperlukan
2. Code untuk pipeline lengkap
3. Error handling dan type safety
4. Contoh test case dengan dummy data

Pakai TypeScript strict mode dan Supabase typed client.

[GANTI [NAMA_FITUR] dengan salah satu:]
- "AI Gatekeeper dengan RAG retrieval"
- "Doctor routing engine"
- "Smart reply panel untuk staff"
- "Patient chat interface dengan 3 bubble types"
- "Admin KB editor dengan AI Preview"
- "Booking calendar dengan AI approval panel"
- "Triage urgency detection"
- "Document upload pipeline (parse → chunk → embed → store)"
```

---

## 📦 C. Generate seed data untuk development

```
Aku butuh seed data untuk development. Generate SQL atau TypeScript untuk:

- 1 klinik (Klinik Sehati, Jakarta Selatan)
- 3 dokter dengan jadwal:
  * dr. Andi Wijaya, Sp.PD (Penyakit Dalam)
  * dr. Siti Rahmawati, Sp.A (Anak)
  * dr. Budi Santoso (Umum)
- 5 staff members (1 admin, 1 manager, 2 receptionist, 1 asdok dr. Andi)
- 20 patients dengan profile Indonesian realistic (nama Indonesia, alamat Jakarta, BPJS/asuransi)
- 30 conversations dengan 150 messages (mix of: FAQ, booking, complaint, urgent, follow-up)
- 50 KB Q&A pairs dalam Bahasa Indonesia (FAQ klinik realistic — BPJS, jam buka, parkir, asuransi, dll)
- 15 bookings (mix pending/confirmed/completed/no_show/cancelled)

Output: TypeScript file yang bisa di-run via `npx tsx seed.ts`
```

---

## 🐛 D. Debug atau code review

```
Aku stuck di [DESKRIPSI MASALAH].

Berikut code-nya:
[PASTE CODE]

Konteks:
- Ini bagian dari [FITUR/MODULE]
- Goal: [GOAL]
- Yang terjadi: [ACTUAL]
- Yang diharapkan: [EXPECTED]
- Error message (kalau ada): [ERROR]

Tolong:
1. Identify root cause
2. Saran solusi (multiple options kalau ada, dengan trade-off)
3. Code fix dengan explanation
4. Suggest test case untuk prevent regression
```

---

## 🎨 E. Design iteration

```
Aku mau iterate design untuk [VIEW NAME].

Current state:
[PASTE HTML/SCREENSHOT DESCRIPTION ATAU LINK MOCKUP]

Yang aku mau ubah:
- [PERUBAHAN 1]
- [PERUBAHAN 2]
- [PERUBAHAN 3]

Rationale:
[ALASAN KENAPA PERLU DIUBAH]

Constraints:
- Tetap konsisten dengan design tokens di handoff
- Tetap konsisten dengan visual pattern di mockup lain
- Mobile-first kalau patient app, desktop-first kalau staff/admin

Tolong proposed redesign + rationale untuk setiap perubahan.
```

---

## 🤔 F. Architectural decision

```
Aku perlu decide antara [OPTION A] vs [OPTION B] untuk [PROBLEM].

Konteks:
- [KONTEKS 1]
- [KONTEKS 2]
- [KONTEKS 3]

Constraints:
- Personal project, budget terbatas (~$15/bulan)
- Indonesia market
- Tech stack: Next.js + Supabase + Anthropic + Voyage AI
- Solo developer

Tolong:
1. Analisis trade-off (cost, complexity, maintenance, scalability)
2. 2nd-order effects (apa yang terjadi 6 bulan kemudian?)
3. Recommendation dengan reasoning
4. Migration path kalau later mau ganti
```

---

## 📚 G. Belajar/explain konsep

```
Tolong explain [KONSEP] dalam konteks project Sehati CRM.

Yang aku udah tahu: [PEMAHAMAN SAAT INI]
Yang masih bingung: [POINT YANG GAK CLEAR]

Pakai analogi yang relate ke Indonesian context.

[CONTOH KONSEP:]
- pgvector dan vector similarity search
- RAG pattern (Retrieval-Augmented Generation)
- Supabase Row Level Security
- Server Components vs Client Components di Next.js 14
- Embedding dan dimensionality
- WebSocket vs Polling untuk realtime
- Async embedding pipeline untuk dokumen besar
```

---

## 🔄 H. Lanjutkan dari checkpoint specific

```
Aku mau lanjutkan dari checkpoint: [CHECKPOINT_NAME]

Status terakhir dari checkpoint state di handoff:
- Completed: [ITEMS]
- Not started: [ITEMS]
- Pending decisions: [ITEMS]

Yang aku udah lakukan setelah checkpoint terakhir:
- [PROGRESS BARU]

Sekarang aku stuck/butuh bantuan di: [TASK SPESIFIK]

Tolong:
1. Konfirmasi pemahaman context
2. Saran next steps
3. Code/dokumen yang dibutuhkan
```

---

## ✏️ I. Refactor existing code

```
Aku mau refactor code ini supaya [GOAL].

Code sekarang:
[PASTE CODE]

Yang aku gak suka:
- [PROBLEM 1]
- [PROBLEM 2]

Yang aku mau:
- [IMPROVEMENT 1]
- [IMPROVEMENT 2]

Tolong:
1. Identify code smells
2. Refactored version dengan explanation
3. Apa yang berubah dan kenapa
4. Test untuk verify refactor tidak break apa-apa
```

---

## 🧪 J. Test strategy

```
Aku mau setup testing untuk [MODULE/FEATURE].

Yang udah ada: [CURRENT STATE — biasanya belum ada test]

Tolong:
1. Recommend test framework (Vitest? Jest? Playwright?) dengan reasoning
2. Test strategy: unit / integration / E2E breakdown
3. Critical paths yang harus di-test (prioritized)
4. Sample test cases dengan code
5. Setup file dan config

Fokus ke critical safety paths (AI gatekeeper, triage, KB threshold) — false negative di sini bisa fatal.
```

---

## 🚢 K. Deployment & production

```
Aku siap deploy ke production. Tolong checklist:

1. Pre-deployment checks (env vars, RLS policies, error tracking)
2. Vercel deployment configuration
3. Supabase production setup (upgrade dari free tier kalau perlu)
4. Domain & DNS setup
5. Monitoring & error tracking (Sentry? Vercel Analytics?)
6. Backup strategy untuk Supabase
7. CI/CD pipeline kalau ada
8. Performance optimization (cache, indexing)
9. Security audit (RLS coverage, API rate limiting)
10. Documentation untuk user

Pakai best practices untuk personal project — gak overkill tapi production-safe.
```

---

## 📊 L. Performance optimization

```
Aku mau optimize performance untuk [FEATURE/PAGE].

Current metrics: [LIGHTHOUSE SCORE / LOAD TIME / etc]
Target: [GOAL]

Konteks:
- Indonesian users (network speed varies, banyak yang 4G)
- Mobile-first untuk patient app
- Desktop untuk staff/admin
- Free tier Supabase + Vercel

Tolong:
1. Identify bottlenecks
2. Optimization strategies (prioritized by impact)
3. Code changes dengan explanation
4. How to measure improvement
```

---

## 🔐 M. Security review

```
Aku mau security audit untuk [FEATURE/AREA].

Concern:
- [CONCERN 1, misal: data pasien sensitif]
- [CONCERN 2, misal: AI prompt injection]

Tolong:
1. Identify vulnerability surface
2. Specific threats relevant untuk healthcare app di Indonesia
3. Mitigation untuk setiap threat
4. Compliance check (UU PDP Indonesia)
5. Code-level fixes
```

---

## 🌐 N. Internasionalisasi / i18n (kalau later)

```
Aku consider tambah dukungan multi-language (Indonesia + English untuk expat).

Tolong:
1. Recommend i18n library (next-intl? next-i18next?)
2. Setup strategy untuk Next.js 14 App Router
3. File structure untuk translations
4. Best practices untuk pluralization, date/number formatting (en-US vs id-ID)
5. Migration strategy dari current Indonesian-only code

Out of scope sekarang, tapi mau design awareness biar gampang kalau later.
```

---

## 💭 O. Brainstorm fitur baru

```
Aku ada ide fitur baru: [DESCRIPTION]

Goal: [TUJUAN]
Target user: [PERSONA]

Tolong:
1. Validate ide — apakah problem-nya real?
2. Existing alternatives yang udah ada (di Sehati atau di luar)
3. MVP scope yang sebenarnya
4. Trade-off cost vs value
5. Implementation sketch (high-level)
6. Risks dan mitigation
7. Apakah ini fit dengan vision Sehati CRM?

Jangan langsung "yes good idea" — challenge me kalau memang ide-nya kurang oke.
```

---

## 🆘 P. Emergency recovery / start over

Kalau bener-bener stuck atau context corrupted, gunakan ini:

```
HARD RESET. Lupakan conversation sebelumnya kalau ada.

Aku Kiki, project Sehati CRM. Berikut full context:

[PASTE FULL HANDOFF DOCUMENT]

Sekarang aku butuh bantuan dengan [GOAL].

Tolong start fresh dengan pemahaman lengkap dari handoff doc, lalu address my request.
```

---

## 📝 Quick formula untuk prompt yang efektif

```
[CONTEXT — pakai handoff doc]
+
[CURRENT STATE — di mana aku sekarang]
+
[GOAL — apa yang aku mau capai]
+
[CONSTRAINTS — limitasi yang harus diperhatikan]
+
[ASK — request spesifik]
```

Tip: makin spesifik prompt, makin baik output LLM. Vague prompt = vague answer.

---

**End of cheat sheet.**

*Use these as starting point. Modify sesuai kebutuhan.*
