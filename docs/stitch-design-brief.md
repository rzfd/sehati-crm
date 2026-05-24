# Sehati CRM — Design Brief for Stitch

> Use this document to recreate the Sehati CRM UI in Stitch. It contains the product context, design system, and screen-by-screen specs. All UI copy is in **Bahasa Indonesia**.

---

## 1. Product in one paragraph

**Sehati CRM** is an AI-powered CRM for clinics/hospitals in Indonesia. Patients chat with the clinic through an **in-app messenger** (not WhatsApp). An **AI gatekeeper** answers safe administrative questions from a knowledge base and **escalates anything medical or uncertain to human staff** — it never diagnoses. Staff handle escalated chats with AI-assisted smart replies, triage, and doctor routing. Admins manage the knowledge base and doctor schedules.

There are **three product surfaces**:
- **Patient app** — mobile, phone-sized (360×720).
- **Staff workspace** — desktop dashboard.
- **Admin panel** — desktop dashboard (same shell as staff).

---

## 2. Design system — "Sand & Sage"

A warm, calm, professional healthcare aesthetic. Soft sand backgrounds, sage green primary, clay accent.

### Color palette

| Role | Hex | Used for |
|------|-----|----------|
| Background | `#FAF6EE` | App background (warm sand) |
| Surface / card | `#FFFFFF` | Cards, panels |
| Surface alt | `#F2EDE0` | Sidebar bg, hover rows |
| Surface dim | `#EEE7D5` | Patient message bubbles, inset blocks |
| Ink (text) | `#1F1B14` | Headings, primary buttons (dark) |
| Ink muted | `#6F665A` | Secondary body text |
| Ink dim | `#A39A8B` | Metadata, timestamps |
| Border | `#E8E0CC` | Card borders |
| Border soft | `#F0E9D6` | List-item dividers |
| **Primary (sage)** | `#5E7A5E` | Active states, links, success, CTAs |
| Primary soft | `#EAEFE3` | Hover, badge backgrounds |
| Primary dim | `#D9E1D2` | Primary card borders |
| **Accent (clay)** | `#B05E3F` | Date pills, notification dots, highlights |
| Accent soft | `#F0D9CB` | Accent chip background |
| **Danger** | `#A8443E` | Urgent / emergency / escalation |
| Danger soft | `#F2D6D3` | Urgent chip background |
| **Warning** | `#C97B2C` | KB gaps, attention |
| Warning soft | `#F4E1CC` | Warning chip background |
| **Info** | `#3D6478` | Doctor color slot, info |
| Info soft | `#D6E1E7` | Info chip background |

### Typography

- **Font:** Plus Jakarta Sans (display + body), DM Mono (IDs, codes, timestamps).
- Page H1: 22px / 600 / tight tracking
- Page H2: 18px / 600
- Card title: 14px / 600
- Body: 13px / 500
- Body small: 12px / 500
- Caption / metadata: 11px / 500
- Eyebrow / tag: 10px / 600 / UPPERCASE / wide tracking
- KPI number: 28px / 600 / tight tracking

### Shape & elevation

- Card radius: 12px · small chips/buttons: 8px · large cards: 16px · pills: full-round
- Soft, low shadows only: `0 1px 2px rgba(45,30,10,0.05)` and a slightly larger `0 8px 24px rgba(45,30,10,0.06)`.

### Icons

Material Symbols Rounded style (or Lucide equivalents). Active nav items use **filled** icons.

---

## 3. The chat bubble system (critical concept)

Chat is the core of the product. There are distinct bubble types that must be visually different so users always know who is speaking:

| Sender | Background | Alignment | Label |
|--------|-----------|-----------|-------|
| **Patient (self)** | Surface dim `#EEE7D5` | Left (patient view) / left (staff view) | — |
| **AI bot** | Primary soft `#EAEFE3` + primary-dim border | Right | "Asisten AI" + sparkles icon + a tag like `RAG` |
| **Staff** | Info soft `#D6E1E7` + info border | Right | Staff name |
| **Doctor Assistant (Asdok)** | Accent soft `#F0D9CB` + accent border | Right | "Asdok dr. [Name]" |

**Always show the "Asisten AI" label on AI messages** — disclosing AI involvement is a hard requirement.

---

## 4. Business flow (informs the screens)

```
Patient sends message
   │
   ▼
AI GATEKEEPER — 4-layer safety filter:
   1. Urgent keyword? → ESCALATE + red urgent flag to ALL staff
   2. Category medical/complaint? → ESCALATE
   3. KB similarity < 0.7? → ESCALATE (don't hallucinate)
   4. Confidence < 0.75? → ESCALATE
   else → AUTO-REPLY (grounded answer from KB, labeled "Asisten AI")
   │
   ├── AUTO-REPLY → patient gets answer (hours, location, cost, booking, promo)
   │
   └── ESCALATE → Staff Inbox
                    • Smart Reply (3 tones: empathetic/professional/short — manual send only)
                    • Auto-tags (category + urgency)
                    • Triage analysis with evidence quotes (if urgent)
                    • Routing suggestion → correct doctor's Asdok
                       │
                       ▼
                  Staff replies / books / routes
```

Booking lifecycle: `pending → confirmed → completed / no_show / cancelled`.

---

## 5. Screens to build

### A. PATIENT APP (mobile, 360×720, single column, bottom nav)

Bottom nav (4 items, active = filled icon + sage label): **Beranda · Chat · Riwayat · Profil**

#### A1. Beranda (Home)
- Personal greeting hero ("Halo, Bu Sari 👋").
- AI welcome card (primary-soft) introducing the assistant.
- "Janji berikutnya" (next appointment) card: doctor, date, time, clinic.
- Quick-action grid 2×2: Chat, Booking, Riwayat, Profil.
- A tip/info strip at the bottom.

#### A2. Chat
- Header: clinic avatar + name + animated online status dot + back arrow.
- Message scroll area with:
  - Day separator pill (centered, e.g. "Hari ini · Kam 14 Mei 2026").
  - Patient bubbles (surface-dim, left).
  - AI bubbles (primary-soft, "Asisten AI" + sparkles label).
  - Staff bubbles (info-soft, staff name).
  - **AI Triage escalation card** (danger-soft background) when message is flagged urgent — shows "Pesanmu sedang ditangani staff klinik" + escape note.
- Typing indicator (animated dots).
- Composer: rounded pill input + send button + attach icon.

#### A3. Booking
- Step 1 — choose doctor: radio cards (avatar, name, specialty, online/off chip).
- Step 2 — choose day: horizontal date scroller.
- Step 3 — choose time slot: grid of slot chips; full slots greyed out with strikethrough.
- Step 4 — notes textarea.
- Sticky bottom CTA (dark ink): "Konfirmasi Booking".

#### A4. Tiket (Booking confirmation)
- Success badge.
- Dashed-divider ticket card with QR placeholder, booking ID (DM Mono, e.g. `SHT-2026-08412`), doctor, date/time.
- Reminder toggle (Switch).
- Two action buttons: "Tambah ke Kalender" / "Lihat Riwayat".

#### A5. Riwayat (History)
- Tabs: Janji · Lab · Resep.
- Timeline list: left date column + entry (doctor + diagnosis chip + status). Status uses left-border colors (confirmed=sage, completed=info, no_show/cancelled=danger).

#### A6. Profil
- Identity card (dark ink background) with name + patient ID.
- BPJS card (insurance class).
- Keluarga (family members) list.
- Settings list (notifications, language, logout).
- Bottom nav.

### B. STAFF WORKSPACE (desktop)

#### Shared shell
- **Sidebar** (224px, surface-alt bg, right border):
  - Header: green logo bullet + "Sehati" + "Klinik Pusat · Jakarta" (small muted).
  - Persona block: avatar + name + role + chevron, in a white rounded card.
  - 3 nav groups with uppercase labels: **Operasional · Knowledge Base · Manajemen**.
  - Active item: white bg, bold, 3px sage left-bar. Items have right-aligned count badges.
  - Footer: "AI status · OK" with a pulsing green dot.
- **Topbar** (56px): breadcrumb ("Klinik Pusat › <screen>"), centered spacer, search box (rounded, 280px, with `⌘K` mono tag), bell icon with clay notification dot, help icon.

#### B1. Inbox (normal) — centerpiece, 3 columns
```
[ Inbox list 320px ] [ Conversation flex-1 ] [ AI assist 312px ]
```
- **Inbox list:** title "Inbox" + counter ("184 hari ini"). Filter chips (active=dark ink): `Semua 184 · Darurat 3 · Booking 22 · Info 41`. List rows: avatar, name (bold if unread), timestamp, 2-line preview, bottom chips (urgency + category + "↑ Escalated"). Active row = white bg + 3px sage left-bar.
- **Conversation panel:** header (avatar, name, sub-info, "Routing" outline button, more menu). Body of bubbles with day separators. Composer at bottom: textarea + action icons (attach, template) + dark "Kirim balasan" button with send icon.
- **AI assist panel:** title bar with "Asisten Sehati" AI badge + model meta ("Sonnet · 0.4s"). Sections:
  1. **AI saran balasan** — 3 reply cards (Empatik / Profesional / Singkat); selected card has sage border + check icon.
  2. **Auto-tag** — wrapping chips (urgent=danger, rest=neutral).
  3. **Routing usulan** — card with doctor avatar + match % + "Teruskan ke Asdok" primary button.
  4. **RAG context** — text; if no match show "↑ Tambahkan ke KB Gaps" (warning color).

#### B2. Inbox (urgent variant)
- Same 3-column layout but with a **red urgent banner** across the conversation.
- AI assist shows **triage analysis**: urgency level, evidence quotes pulled from the message, recommended actions, and a disclaimer ("Ini hanya triage administratif — keputusan klinis tetap di tangan dokter.").
- Composer input is de-emphasized/disabled to force human attention.

#### B3. Manager Dashboard (Overview)
- Header greeting + period segmented control (`Hari ini · 7 hari · 30 hari · Custom`).
- KPI grid 4 cards each with mini sparkline: Pesan masuk, Auto-resolved %, Escalated, Avg response.
- Bar chart "Volume mingguan" (Sun–Sat) with an AI Insight footer (primary-soft).
- AI feature health list (6 modules).
- Live AI activity timeline (left-rail dots) + category breakdown horizontal bars.

#### B4. Kalender (Booking calendar)
- Header: "Kalender" + sub ("11 Mei – 17 Mei 2026 · 28 janji minggu ini").
- Toolbar: `Hari · Minggu · Bulan` segment + prev/today/next buttons + dark "+ Janji baru".
- Doctor legend strip (color dot + name per doctor).
- Week grid `[60px time col + 7 day cols]`, today column highlighted (primary-soft). Event blocks colored per doctor with a darker 3px left inset; current-time line is a 2px clay bar with a dot.

#### B5. Pasien Detail
- Hero card: avatar 72 + name + "Pasien aktif" chip + "BPJS Kelas 2" chip + meta row + "Buka chat" / "Buat janji" buttons.
- 4 quick-stat cards in a row.
- Underline tabs: Riwayat · Chat · Lab · Resep · Catatan (with counts).
- Timeline table: [date | rule | doctor + diagnosis | status chip | chevron].
- Right rail (320px): AI summary block (primary-soft) + active prescriptions + upcoming appointments.

#### B6. Dokter (Doctors)
- Header + search + filter chips (`Semua · Online · Off duty`).
- Grid of 3-column doctor cards: avatar 48, name, specialty, online/off chip, 3 mini-stats (Janji / Match / Respon), weekday schedule chips, Edit/Jadwal/more buttons.
- A special "AI Doctor Routing" promo/settings card.

### C. ADMIN PANEL (desktop, same shell)

#### C1. KB Dashboard
- Header + dark "+ Q&A Baru" button.
- KPI strip 4: Q&A aktif · Dokumen · Retrieval acc. · KB Gaps.
- Body split (1.4fr / 1fr):
  - Q&A list rows: [icon | question + tags + status pill | hits-30-days].
  - Side panel: **RAG simulator** (search box + match result cards) + **KB Gaps** list (warning-colored, actionable).

#### C2. Q&A Editor — 3 panes
- Left: Q&A list.
- Center: edit form (question, answer, tags, status: Published/Draft/Archived).
- Right: **AI Preview** live-test panel — type a patient question, see what the AI would retrieve and answer.

#### C3. Document Upload
- Drag-and-drop zone.
- Uploaded files list with processing state (pulse animation while chunking + embedding).
- Metadata per file (name, size, chunk count, status).

#### C4. Doctor Schedule
- Doctor list + weekly schedule grid (7 days × time blocks) + legend.
- Editable availability per doctor.

---

## 6. Status pills (reuse everywhere)

General: `Aktif` `Pasien baru` `Follow-up` `Urgent` `VIP` `Selesai`
KB: `Published` `Draft` `Archived` `High usage` `Needs review`
Booking: `Pending` `Confirmed` `Completed` `No-show` `Cancelled`

Pill style: full-round, 11px medium text, soft-colored background + matching text color (e.g. urgent = danger-soft bg + danger text).

---

## 7. Hard rules — do not violate in the design

1. **All UI copy in Bahasa Indonesia.** Use realistic Indonesian names (Bu Sari, Pak Budi, dr. Andi) and context (BPJS, klinik, dokter spesialis).
2. **Always disclose AI** — every AI-generated bubble/card carries an "Asisten AI" / sparkles badge.
3. **Never auto-send staff messages** — AI only drafts; a human clicks send.
4. **Urgent messages are visible to all staff**, shown with the red banner — never quietly auto-routed.
5. **No medical advice anywhere** (no symptoms interpretation, no drugs/dosage/diagnosis) — medical questions escalate to staff.
6. **Sidebar nav filters by persona** (Pasien, Manager, Marketing, Receptionist, CS, Asdok, Admin).

---

## 8. Suggested Stitch prompt order

1. Set the theme first: paste the palette + Plus Jakarta Sans + radius/shadow from section 2.
2. Build the **dashboard shell** (sidebar + topbar) — reused by all staff/admin screens.
3. Build the **Inbox (normal)** — the centerpiece — then the urgent variant.
4. Build remaining staff/admin screens using the same shell.
5. Switch to mobile frame and build the **patient app** screens (Home → Chat → Booking → Tiket → Riwayat → Profil).
