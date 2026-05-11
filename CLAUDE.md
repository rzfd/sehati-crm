@AGENTS.md
# CLAUDE.md — Sehati CRM

Instruksi untuk Claude Code saat bekerja di project ini.

## 🏥 Project context

**Sehati CRM** — AI-powered CRM untuk klinik Indonesia.
Stack: Next.js 14 + TypeScript + Supabase + Anthropic Claude + Voyage AI + Tailwind + shadcn/ui
Full context: lihat `sehati-crm-handoff.md`

---

## 🔄 Progress tracking (WAJIB)

Project ini terhubung ke **Notion via MCP** di claude.ai.
Setiap selesai task, **laporkan ke user** supaya user bisa update Notion langsung dari conversation claude.ai.

Contoh cara lapor ke user saat selesai:
> "✅ Selesai implement [nama task]. Mau aku checklist di Notion?"

User yang akan konfirmasi dan aku update Notion-nya dari claude.ai.

---

## 🎨 Design system (SELALU pakai ini)

```typescript
// Colors — jangan hardcode hex, pakai class Tailwind
teal-400   → #1D9E75  brand/pasien
blue-500   → #185FA5  staff
amber-500  → #BA7517  warning/manager
red-500    → #A32D2D  urgent/danger
purple-500 → #534AB7  admin
pink-500   → #993556  asdok
gray-500   → #888780  disabled
```

### Chat bubble classes (dari globals.css)
```tsx
<div className="bubble-patient" />  // pasien — teal solid, kanan
<div className="bubble-ai" />       // AI bot — teal pucat, border-left
<div className="bubble-staff" />    // staff — biru pucat, border-left
<div className="bubble-asdok" />    // asdok — pink pucat, border-left
```

### Button & pill classes
```tsx
<button className="btn-primary" />   // teal — main CTA
<button className="btn-secondary" /> // ghost — secondary
<button className="btn-danger" />    // red — destructive
<button className="btn-purple" />    // purple — admin actions

<span className="pill pill-teal" />
<span className="pill pill-red" />
<span className="pill pill-purple" />
```

---

## 📁 Project structure

```
src/
├── app/
│   ├── (auth)/          login, register
│   ├── (patient)/       home, chat, booking, history
│   ├── (staff)/         inbox, calendar, dashboard
│   ├── (admin)/         kb, doctors, staff
│   └── api/             chat, ai/*, kb/*, booking
├── components/
│   ├── chat/            ChatBubble, SmartReplyPanel, UrgentBanner
│   ├── inbox/           ChatList, TriagePanel, PatientDetail
│   ├── kb/              QAEditor, DocumentUpload, AIPreview
│   ├── booking/         BookingForm, SlotPicker, BookingCalendar
│   ├── dashboard/       KPICard, VolumeChart, AIPerformanceSection
│   ├── layout/          StaffSidebar, AdminSidebar, PatientBottomNav
│   └── shared/          StatusPill, Avatar, EmptyState
├── lib/
│   ├── supabase/        client.ts, server.ts, middleware.ts
│   ├── ai/              gatekeeper.ts, smart-reply.ts, triage.ts, routing.ts, prompts.ts
│   ├── voyage.ts        embedding client
│   ├── kb.ts            RAG pipeline
│   └── constants.ts     URGENT_KEYWORDS, AI_CONFIG, semua konstanta
├── types/               database.ts, chat.ts, ai.ts
├── hooks/               useRealtimeChat, useConversations, useSmartReply
└── store/               chatStore, inboxStore, uiStore
```

---

## ⚠️ Aturan wajib

### Safety (CRITICAL)
- ❌ **JANGAN** generate logika auto-diagnose dari gejala
- ❌ **JANGAN** generate saran medis specific (obat, dosis, diagnosis)
- ✅ Semua input medis dari pasien → **selalu escalate** ke staff
- ✅ Label "Asisten AI" harus selalu visible di bubble AI

### URGENT_KEYWORDS — selalu bypass AI langsung ke staff
```ts
import { URGENT_KEYWORDS } from "@/lib/constants"
// "tidak bisa nafas", "sesak parah", "dada sakit",
// "stroke", "kejang", "pingsan", "bunuh diri", dll
```

### Code style
- TypeScript strict mode — tidak ada `any`
- Server components by default, `"use client"` hanya kalau butuh interactivity
- Tailwind classes inline, tidak pakai `@apply` di luar `globals.css`
- Component naming: `PascalCase`, file: `kebab-case.tsx`
- Semua user-facing string: Bahasa Indonesia
- Semua code identifier: English

### Error handling
- Selalu `try/catch` untuk API calls
- Tidak ada silent fail — selalu log error
- User-facing error message: Bahasa Indonesia, ramah

---

## 🤖 AI clients

```typescript
// Haiku — untuk classify, gatekeeper, smart-reply, routing (cheap & fast)
import { HAIKU } from "@/lib/constants" // "claude-haiku-4-5"

// Sonnet — untuk triage urgency saja (high stakes)
import { SONNET } from "@/lib/constants" // "claude-sonnet-4-6"

// Embedding — Voyage AI voyage-3-lite (512 dim)
import { embedText } from "@/lib/voyage"

// KB retrieval — RAG pipeline
import { retrieveFromKB } from "@/lib/kb"
```

---

## 🗄️ Supabase patterns

```typescript
// Browser client (dalam component)
import { createClient } from "@/lib/supabase/client"

// Server client (dalam Server Component / API route)
import { createClient } from "@/lib/supabase/server"

// Realtime subscription (dalam hook)
const channel = supabase
  .channel(`conversation:${id}`)
  .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
    (payload) => addMessage(payload.new))
  .subscribe()
```

---

## 📝 Commit convention

```
feat: <deskripsi>    → fitur baru selesai
fix: <deskripsi>     → bug fix
wip: <deskripsi>     → work in progress
refactor: <nama>     → refactor tanpa perubahan behavior
style: <nama>        → perubahan styling/CSS
```