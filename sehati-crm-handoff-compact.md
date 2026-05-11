# Sehati CRM — Compact Handoff (Mini Version)

> Versi singkat untuk LLM dengan context window terbatas atau saat butuh fast onboarding.

## Project ID
**Sehati CRM** — AI-powered CRM untuk klinik Indonesia. Personal project Kiki. Bahasa Indonesia, fonts Plus Jakarta Sans + DM Mono.

## Stack
Next.js 14 + TypeScript + Supabase (Postgres + pgvector + Auth + Realtime) + Anthropic Claude (Haiku 4.5 / Sonnet 4.6) + Voyage AI (`voyage-3-lite`) + Tailwind + shadcn/ui + Zustand. Deploy: Vercel.

## 7 personas
**Pasien · Manager · Marketing · Receptionist · Customer Service · Doctor Assistant (asdok) · Admin**

## 6 AI features
1. Gatekeeper (Haiku) — filter masuk, 4-layer safety
2. RAG retrieval (Voyage + Claude) — KB-grounded answers
3. Doctor routing (Haiku) — extract name/specialty/context
4. Smart reply (Haiku) — 3 tone untuk staff
5. Auto-tag (Haiku) — category + urgency
6. Triage urgency (Sonnet) — emergency detection

## Design tokens
- Teal `#1D9E75` brand/pasien
- Blue `#185FA5` staff
- Amber `#BA7517` manager/warning
- Red `#A32D2D` urgent
- Purple `#534AB7` admin (BARU v3)
- Pink `#993556` asdok

## 3 chat bubbles
- Pasien: teal solid, kanan
- AI: teal pucat + border-left teal + "Asisten AI" label
- Staff: blue pucat + border-left blue + nama staff
- Asdok: pink pucat + border-left pink + "Asdok dr. X"

## 12 Supabase tables
Core: clinics, doctors, doctor_schedules, staff_members, patients, conversations, messages, bookings
KB: kb_qa_pairs, kb_documents, kb_document_chunks
Audit: audit_log, kb_query_logs
+ RPC `match_kb` untuk vector search

## URGENT_KEYWORDS (force escalate)
"tidak bisa nafas", "sesak parah", "dada sakit", "stroke", "kejang", "darah banyak", "pingsan", "ingin mengakhiri hidup", "bunuh diri", "tidak sadar", "muntah darah", "pendarahan hebat"

## Forbidden
JANGAN auto-diagnose (UU Praktik Kedokteran Indonesia). JANGAN saran medis specific. Semua medis HARUS escalate.

## Status
Design phase done (4 versi PDF: v1/v2/v3/v4 + 12 mockup HTML). Belum mulai coding. Next: Sprint 0 (Supabase + Next.js setup).

## Roadmap
Sprint 0 (setup) → 1 (KB) → 2 (gatekeeper+RAG) → 3 (routing) → 4 (patient app) → 5 (staff workspace) → 6 (dashboard) → 7 (deploy). Total 9-12 minggu.

---

Copy-paste ini + request spesifik → LLM punya cukup context untuk lanjut.
