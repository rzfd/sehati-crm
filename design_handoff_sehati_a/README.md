# Handoff · Sehati Direction A ("Sand & Sage")

Paket lengkap untuk mengimplementasikan Direction A ke codebase Sehati existing.

> **Tentang file di bundle ini**
> Folder `design-reference/` berisi prototype HTML/JSX yang dibuat di Claude — itu **referensi visual**, bukan production code yang langsung di-copy. Tugas Anda: rekonstruksi tampilan ini di stack Sehati (Next.js 14 App Router + TS + Tailwind + shadcn/ui + Zustand + Plus Jakarta Sans / DM Mono).

---

## Fidelity

**High-fidelity.** Semua nilai (warna, spacing, type) sudah final. Recreate pixel-perfect, lalu sesuaikan dengan konvensi codebase Sehati.

---

## TL;DR — Urutan implementasi yang direkomendasikan

| # | Step | File yang disentuh |
|---|------|-------------------|
| 1 | **Design tokens** — drop ke `tailwind.config.ts` + `globals.css` | `tailwind.config.ts`, `app/globals.css` |
| 2 | **Typography** — ganti font ke Plus Jakarta Sans (sudah punya) | `app/layout.tsx` |
| 3 | **shadcn theme** — re-skin `Button`, `Card`, `Badge`, `Input`, dst dengan tokens A | `components/ui/*` |
| 4 | **Dashboard shell** — `Sidebar` + `Topbar` + `MainContainer` | `components/dashboard/` |
| 5 | **Inbox** (centerpiece) — list + conversation + AI panel | `app/(dashboard)/inbox/` |
| 6 | **Kalender, KB, Pasien, Dokter, Overview** — pakai shell yg sama | `app/(dashboard)/*/` |
| 7 | **Patient app** (mobile route atau separate Capacitor app) | `app/(patient)/` |

Sehati sudah pakai shadcn — saya rekomendasikan **tidak ganti library**, cukup ubah CSS variables & buat beberapa wrapper component baru.

---

## 1) Design tokens

### `app/globals.css` — paste di paling atas (sebelum @tailwind directives di V3, atau di @layer base di V4)

```css
@layer base {
  :root {
    /* — Sehati · Sand & Sage — */
    --background: 41 50% 95%;          /* #FAF6EE warm sand */
    --foreground: 35 19% 9%;           /* #1F1B14 warm ink */

    --card: 0 0% 100%;                 /* #FFFFFF */
    --card-foreground: 35 19% 9%;

    --popover: 0 0% 100%;
    --popover-foreground: 35 19% 9%;

    --primary: 120 14% 42%;            /* #5E7A5E sage */
    --primary-foreground: 0 0% 100%;

    --secondary: 41 35% 92%;           /* #F2EDE0 cream */
    --secondary-foreground: 35 19% 9%;

    --muted: 41 35% 92%;
    --muted-foreground: 32 12% 40%;    /* #6F665A */

    --accent: 19 47% 47%;              /* #B05E3F clay */
    --accent-foreground: 0 0% 100%;

    --destructive: 4 45% 45%;          /* #A8443E */
    --destructive-foreground: 0 0% 100%;

    --warning: 30 65% 48%;             /* #C97B2C */
    --warning-foreground: 0 0% 100%;

    --info: 205 32% 36%;               /* #3D6478 */
    --info-foreground: 0 0% 100%;

    --border: 41 38% 85%;              /* #E8E0CC */
    --border-soft: 41 41% 89%;         /* #F0E9D6 */
    --input: 41 38% 85%;
    --ring: 120 14% 42%;

    /* extended Sehati-specific */
    --surface-alt: 41 35% 92%;         /* #F2EDE0 */
    --surface-dim: 41 41% 88%;         /* #EEE7D5 */
    --ink-dim: 35 12% 60%;             /* #A39A8B */

    --primary-soft: 96 18% 91%;        /* #EAEFE3 */
    --primary-dim: 95 17% 85%;         /* #D9E1D2 */
    --accent-soft: 22 56% 87%;         /* #F0D9CB */
    --danger-soft: 6 43% 89%;          /* #F2D6D3 */
    --warn-soft: 33 65% 88%;           /* #F4E1CC */
    --info-soft: 200 27% 87%;          /* #D6E1E7 */

    --radius: 0.75rem;                 /* 12 px — kartu */
    --radius-sm: 0.5rem;               /* 8 px — chip/button kecil */
    --radius-lg: 1rem;                 /* 16 px — kartu besar */
    --radius-pill: 9999px;
  }
}
```

> Catatan: Saya pakai format HSL agar kompatibel dengan shadcn default. Hex aslinya saya comment supaya bisa di-cross check.

### `tailwind.config.ts` — extend section

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  // ... existing
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          soft: 'hsl(var(--primary-soft))',
          dim: 'hsl(var(--primary-dim))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          soft: 'hsl(var(--accent-soft))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          soft: 'hsl(var(--danger-soft))',
        },
        warning: { DEFAULT: 'hsl(var(--warning))', soft: 'hsl(var(--warn-soft))' },
        info: { DEFAULT: 'hsl(var(--info))', soft: 'hsl(var(--info-soft))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        surface: {
          DEFAULT: 'hsl(var(--card))',
          alt: 'hsl(var(--surface-alt))',
          dim: 'hsl(var(--surface-dim))',
        },
        ink: {
          DEFAULT: 'hsl(var(--foreground))',
          mute: 'hsl(var(--muted-foreground))',
          dim: 'hsl(var(--ink-dim))',
        },
        border: 'hsl(var(--border))',
        'border-soft': 'hsl(var(--border-soft))',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'sehati-sm': '0 1px 2px rgba(45,30,10,0.05)',
        'sehati-md': '0 1px 2px rgba(45,30,10,0.04), 0 8px 24px rgba(45,30,10,0.06)',
      },
    },
  },
};
```

### Hex palette lengkap (untuk cek mata)

| Token | Hex | Pakai untuk |
|-------|-----|-------------|
| `bg` (background) | `#FAF6EE` | App background — warm sand |
| `surface` (card) | `#FFFFFF` | Kartu, panel |
| `surface-alt` | `#F2EDE0` | Sidebar bg, hover row |
| `surface-dim` | `#EEE7D5` | Bubble pesan pasien, inset block |
| `ink` (foreground) | `#1F1B14` | Heading, button primer hitam |
| `ink-mute` | `#6F665A` | Body text sekunder |
| `ink-dim` | `#A39A8B` | Metadata, timestamp |
| `border` | `#E8E0CC` | Border kartu |
| `border-soft` | `#F0E9D6` | Divider antar list-item |
| **`primary`** (sage) | `#5E7A5E` | Active state, links, success, CTA sekunder |
| `primary-soft` | `#EAEFE3` | Hover, badge background |
| `primary-dim` | `#D9E1D2` | Border kartu primer |
| **`accent`** (clay) | `#B05E3F` | Highlight, "JUM 15" date pill, notif dot |
| `accent-soft` | `#F0D9CB` | Background chip aksen |
| **`destructive`** | `#A8443E` | Urgent / darurat / escalation |
| `danger-soft` | `#F2D6D3` | Urgent chip background |
| **`warning`** | `#C97B2C` | KB Gaps, attention |
| `warn-soft` | `#F4E1CC` | Warning chip bg |
| **`info`** | `#3D6478` | Dokter color slot 2, info |
| `info-soft` | `#D6E1E7` | Info chip bg |

---

## 2) Typography

Sehati sudah punya **Plus Jakarta Sans + DM Mono**. Plus Jakarta sans punya proporsi yang sangat mirip Poppins (sedikit lebih humanist), jadi designs ini akan langsung pas.

### `app/layout.tsx`

```tsx
import { Plus_Jakarta_Sans, DM_Mono } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${dmMono.variable}`}>
      <body className="font-sans bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
```

### Type scale (langsung dari design)

| Use | Size · weight · tracking | Tailwind class |
|-----|--------------------------|----------------|
| Page H1 (dashboard) | 22 · 600 · −0.3 | `text-[22px] font-semibold tracking-tight` |
| Page H2 | 18 · 600 · −0.2 | `text-lg font-semibold tracking-tight` |
| Card title | 14 · 600 | `text-sm font-semibold` |
| Body | 13 · 500 | `text-[13px]` |
| Body small | 12 · 500 | `text-xs` |
| Caption / metadata | 11 · 500 | `text-[11px]` |
| Eyebrow / tag | 10 · 600 · letter-spacing 0.4–0.5 · UPPERCASE | `text-[10px] font-semibold uppercase tracking-wider` |
| KPI number | 28 · 600 · −0.5 | `text-[28px] font-semibold tracking-tight` |

### DM Mono — pakai untuk

- Nomor tiket (`SHT-2026-08412`)
- Kode (chip `⌘K`)
- Audit log timestamps
- Optionally KPI angka yang besar — tapi default ke Jakarta Sans dulu

---

## 3) Icon library

Designs pakai **Material Symbols Rounded**. Untuk Next.js + shadcn ecosystem, ada 2 jalan:

**Opsi A (recommended) · `lucide-react`** — sudah ada karena shadcn pakai ini.
Sebagian besar nama bisa di-map 1:1. Lihat tabel di bawah:

| Material Symbol | Lucide |
|-----------------|--------|
| `arrow_back` | `<ArrowLeft />` |
| `arrow_forward` | `<ArrowRight />` |
| `chat_bubble` | `<MessageCircle />` |
| `chevron_right` | `<ChevronRight />` |
| `event_available` | `<CalendarCheck />` |
| `medical_services` | `<Stethoscope />` |
| `forum` | `<MessagesSquare />` |
| `inbox` | `<Inbox />` |
| `calendar_month` | `<Calendar />` |
| `auto_stories` | `<BookOpen />` |
| `manage_search` | `<SearchCheck />` |
| `auto_awesome` | `<Sparkles />` |
| `emergency` | `<Siren />` |
| `notifications` | `<Bell />` |
| `notifications_active` | `<BellRing />` |
| `science` | `<TestTube />` |
| `pill` | `<Pill />` |
| `lightbulb` | `<Lightbulb />` |
| `more_horiz` | `<MoreHorizontal />` |
| `send` | `<Send />` |
| `person_add` | `<UserPlus />` |
| `description` | `<FileText />` |

**Opsi B** · Install Material Symbols web font dan render via `<span className="material-symbols-rounded">name</span>`. Pakai ini kalau lebih suka filled-axis & variabel weight.

---

## 4) Mapping ke shadcn/ui components

| Designs pakai | shadcn component | Tweak |
|---------------|------------------|-------|
| `<Avatar>` warna by hue | `Avatar` + `AvatarFallback` | Override bg via `oklch(0.86 0.04 <hue>)` inline atau class |
| Card kartu | `Card` + `CardHeader` + `CardContent` | Sudah pas dengan tokens |
| Chip / Badge | `Badge` (varian outline) | Buat varian `success`, `warning`, `urgent`, `info` di `badge.tsx` |
| Button "Konfirmasi Booking" (ink hitam) | `Button` varian `default` | Bisa juga buat varian `ink` |
| Button "Edit" outline | `Button` varian `outline` | OK as-is |
| Tab "Riwayat / Chat / Lab" | `Tabs` + `TabsList` + `TabsTrigger` | Underline-style — set via `data-state` |
| Search bar di topbar | `Input` + ikon Lucide kiri | Sudah ada di shadcn examples |
| Sidebar nav | shadcn punya `Sidebar` (App Router) | Recommended — sudah RTL-friendly |
| Toggle (notif on/off) | `Switch` | Default fine |
| Slot select (booking) | Custom — toggle button group | Pakai `ToggleGroup` dari shadcn |

### Badge varian baru — `components/ui/badge.tsx`

Tambah ini di varian list:

```ts
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
  {
    variants: {
      variant: {
        // ... existing
        urgent: 'bg-destructive-soft text-destructive',
        warning: 'bg-warning-soft text-warning',
        success: 'bg-primary-soft text-primary',
        info: 'bg-info-soft text-info',
        neutral: 'bg-surface-alt text-ink-mute',
      },
    },
  }
);
```

---

## 5) Component breakdown per screen

### 5.1 Dashboard Shell — `components/dashboard/shell.tsx`

Struktur:
```
<div class="flex h-screen bg-background">
  <Sidebar />        {/* 224 px, sticky */}
  <main class="flex-1 flex flex-col min-w-0">
    <Topbar />       {/* 56 px tinggi */}
    <div class="flex-1 overflow-hidden">{children}</div>
  </main>
</div>
```

**Sidebar (`components/dashboard/sidebar.tsx`)**
- Width `w-56` (224px), bg `bg-surface-alt`, border kanan `border-r border-border-soft`
- Header (60px): logo bullet hijau `bg-primary text-white` 30×30 + text "Sehati" + "Klinik Pusat · Jakarta" (10px muted)
- Persona block: avatar 30 + nama + role + chevron, di `bg-surface rounded-[10px] border` — selalu visible
- 3 nav groups: **Operasional · Knowledge Base · Manajemen** (group label `text-[10px] uppercase tracking-wider text-ink-dim`)
- Active item: `bg-surface text-ink font-semibold` + left bar `w-[3px] bg-primary rounded` (3px dari kiri)
- Item: `flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-[13px]`
- Count badge (di kanan): `text-[10px] font-semibold px-1.5 rounded-full bg-surface-alt`
- Footer: "AI status · OK" dengan dot hijau + animasi pulse

**Topbar (`components/dashboard/topbar.tsx`)**
- Tinggi 56, `border-b border-border-soft`, `px-6`
- Kiri: breadcrumb `Klinik Pusat › <screen title>` (11px ink-mute, current bold ink)
- Tengah: spacer
- Kanan: search box 280px (`w-72`) di `bg-surface border rounded-full px-3 py-1.5` + ikon `<Search>` kiri + tag `⌘K` (font-mono!) di kanan
- Action ikon: `<Bell>` dengan notification dot kanan-atas (8px clay), `<HelpCircle>`

### 5.2 Inbox — `app/(dashboard)/inbox/page.tsx`

Layout 3 column (di dalam `<MainContainer>`):
```
[ Inbox list 320px ] [ Conversation flex-1 ] [ AI assist 312px ]
```

**Inbox list**
- Top: judul "Inbox" h2 + counter "184 hari ini" (11px ink-mute)
- Filter chips horizontal: `Semua 184 · Darurat 3 · Booking 22 · Info 41`
  - Active: `bg-ink text-white border-ink`
  - Idle: `bg-surface text-ink-mute border-border`
- List item:
  - Padding `px-4.5 py-3`, `border-b border-border-soft`, active row → `bg-surface` + 3px left border `bg-primary`
  - Avatar 34 (hue 18 untuk urgent, 200 untuk normal)
  - Body: nama (12.5 fw500/600 jika unread) + timestamp kanan (10 ink-dim)
  - Preview 2-line ellipsis (11.5 ink-mute, line-height 1.35)
  - Bottom chips: urgency badge + category badge + `↑ Escalated` warning

**Conversation panel**
- Header (66px): avatar 36 + nama (14 fw600) + sub "WhatsApp · +62 … · pertama chat 4 menit lalu" (11 muted) + tombol outline `Routing` + `<MoreHorizontal>`
- Body scroll: padding 20/26, gap 10 antar bubble
  - Day separator: pill `Hari ini · Kam 14 Mei 2026` (10 ink-dim) di tengah
  - User bubble (kiri): bg `bg-surface-dim`, rounded `rounded-l-lg rounded-tr-lg rounded-br-sm`
  - AI bubble (kanan): bg `bg-primary-soft border border-primary-dim`, rounded mirror; di bawah caption `<AIBadge label="RAG" /> 07:43 · AI auto`
- Footer composer:
  - Textarea kosong dengan placeholder dalam kotak `bg-background border rounded-xl px-3 py-2.5` (min-height 70 px)
  - Footer-bawah composer: kiri = action ikon (Attach, Template) + kanan = button ink "Kirim balasan" dengan `<Send>` kanan

**AI assist panel** (paling kanan, 312px, bg `bg-background`, border kiri `border-l border-border-soft`, padding 4/4.5)
- Title bar: `<AIBadge label="Asisten Sehati" />` di kiri + meta "Sonnet · 0.4s" di kanan
- Section 1 — **AI saran balasan**: list 3 kartu (Empatik / Profesional / Singkat). Selected card → border `border-primary`, ada `<CheckCircle>` di kanan. Body text 3-line clamp.
- Divider hairline
- Section 2 — **Auto-tag**: chips wrap (darurat = urgent variant; rest = neutral)
- Section 3 — **Routing usulan**: kartu dengan avatar + dr name + match % chip + tombol primary "Teruskan ke Asdok"
- Section 4 — **RAG context**: text-only, kalau tidak ada match tampilkan `↑ Tambahkan ke KB Gaps` (warning color)

### 5.3 Kalender — `app/(dashboard)/kalender/page.tsx`

- Page header (28/22): h2 "Kalender" + sub "11 Mei – 17 Mei 2026 · 28 janji minggu ini"
- Toolbar kanan: segment `Hari · Minggu · Bulan` + tombol `← Minggu lalu`, `Hari ini` (primary), `Minggu depan →` + button ink `+ Janji baru`
- Doctor legend strip: dot color + nama, max 3-5 dokter
- Grid: `grid-cols-[60px_repeat(7,1fr)]`, day header dengan today highlighted (bg primary-soft, text primary), body scroll 7×12 hour cells, event positioned absolute by `top: (start - 7) * 46px`, `height: dur * 46px - 4`
- Event bubble: `bg-primary text-white rounded-md p-1.5 px-2`, inset 3px left = darker shade (gunakan `box-shadow: inset 3px 0 0 <darker>`)
- Today's current-time line: 2px bar `bg-accent` + circle 8px kiri

### 5.4 Pasien Detail — `app/(dashboard)/pasien/[id]/page.tsx`

Lihat `direction-a-dash-extra.jsx` → komponen `SaSDashPasien`. Struktur:
- Hero card (px-5 py-5): avatar 72 + nama h2 + chip "Pasien aktif" + chip "BPJS Kelas 2" + meta sub-row + tombol "Buka chat" + "Buat janji" (ink)
- 4 quick-stat cards (sentang horizontal)
- Tabs underline-style: Riwayat (24) · Chat WA (142) · Lab (8) · Resep (12) · Catatan (6)
- Body: timeline table dengan kolom [date 60px | rule | dr + diag | status chip | chevron]
- Right rail 320px: AI summary block (primary-soft bg + primary-dim border) + resep aktif + janji mendatang

### 5.5 Overview (Manager) — `app/(dashboard)/overview/page.tsx`

Section structure:
1. Header dengan greeting + period segment (`Hari ini · 7 hari · 30 hari · Custom`)
2. KPI grid 4 kolom — pesan masuk, auto-resolved%, escalated, avg response — masing-masing kartu pakai mini sparkline SVG (lihat helper `SaSSpark`)
3. Bar chart "Volume mingguan" (Sun-Sat, Kamis hl) + AI Insight footer di primary-soft
4. AI feature health list (6 modul)
5. Live AI activity timeline (left rail dot) + Category breakdown horizontal bars

### 5.6 Dokter — `app/(dashboard)/dokter/page.tsx`

- Page header standard
- Filter row: search box + filter chips `Semua · Online · Off duty`
- Grid 3 kolom kartu dokter (avatar 48, nama, spec, chip online/off, 3 mini-stats Janji/Match/Respon, schedule chips Sen-Jum, tombol Edit/Jadwal/⋯)
- Tambah kartu special "AI Doctor Routing" sebagai promo/setting entry

### 5.7 Knowledge Base — `app/(dashboard)/kb/page.tsx`

- Page header + button "+ Q&A Baru" (ink)
- KPI strip 4: Q&A aktif · Dokumen · Retrieval acc. · KB Gaps
- Body split 1.4fr / 1fr:
  - Q&A list dengan baris [icon | pertanyaan + tags + status | hits 30 hari]
  - Side panel: RAG simulator (search box + match cards) + KB Gaps list

### 5.8 Patient app (Phone) screens

Phones di-design 360×720 dengan Android frame untuk preview. Untuk **mobile web**, recreate sebagai responsive route di `app/(patient)/` — pakai `max-w-md mx-auto` untuk constrain di desktop.

| Screen | File reference | Key components |
|--------|---------------|----------------|
| Beranda | `SaSPhoneHome` di `direction-a-phone.jsx` | Hero greeting + AI welcome card + Upcoming appointment card + Quick-action grid 2×2 + Tip strip + bottom-nav |
| Chat | `SaSPhoneChat` | Header (avatar K + status dot animasi) + message scroll (day separator pill + user/AI bubbles) + AI Triage escalation card (danger-soft bg) + composer pill |
| Booking | `SaSPhoneBooking` | Doctor select radio cards + date scroller H + slot grid 3×N + sticky bottom CTA (ink) |
| Tiket | `SaSPhoneConfirm` | Success badge + dashed-divider ticket card with QR placeholder + reminder toggle + 2-up actions |
| Riwayat | `SaSPhoneRiwayat` | Tabs (Janji · Lab · Resep) + timeline list dengan date column + diagnosis chip |
| Profil | `SaSPhoneProfile` | Identity card (ink bg) + BPJS card + Keluarga list + Settings list + bottom-nav |

**Bottom nav** — 4 item: Beranda · Chat · Riwayat · Profil. Active state: ikon filled + label primary + fw600.

---

## 6) State management (Zustand)

Saya pakai pattern berikut untuk Inbox:

```ts
// stores/inbox.ts
import { create } from 'zustand';

type InboxMessage = {
  id: string;
  name: string;
  preview: string;
  urgency: 'urgent' | 'normal' | 'low';
  category: string;
  unread: boolean;
  escalated?: boolean;
  // ...
};

type InboxState = {
  activeMessageId: string | null;
  selectedToneIndex: number;
  messages: InboxMessage[];
  smartReplies: { tone: string; text: string }[];
  setActive: (id: string) => void;
  selectTone: (i: number) => void;
};

export const useInbox = create<InboxState>((set) => ({
  activeMessageId: null,
  selectedToneIndex: 0,
  messages: [],
  smartReplies: [],
  setActive: (id) => set({ activeMessageId: id }),
  selectTone: (i) => set({ selectedToneIndex: i }),
}));
```

Untuk chat live di patient app (yang punya AI typing + escalation), `useState` + `useEffect` local di component sudah cukup. Sambungkan ke backend via `useSWR` / fetch.

---

## 7) Direct file-by-file mapping

Setiap component di `design-reference/` punya pasangan di codebase Sehati. Ini mappingnya:

| Design file | Komponen | Target Sehati |
|-------------|----------|---------------|
| `direction-a-phone.jsx` | `SaSPhoneHome`, `SaSPhoneChat` | `app/(patient)/page.tsx`, `app/(patient)/chat/page.tsx` |
| `direction-a-booking.jsx` | `SaSPhoneBooking` | `app/(patient)/booking/page.tsx` |
| `direction-a-phone-extra.jsx` | `SaSPhoneConfirm`, `SaSPhoneRiwayat`, `SaSPhoneProfile` | `app/(patient)/booking/[id]/page.tsx`, `app/(patient)/riwayat/page.tsx`, `app/(patient)/profil/page.tsx` |
| `direction-a-dash-inbox.jsx` | `SaSDashShell`, `SaSDashInbox` | `components/dashboard/shell.tsx`, `app/(dashboard)/inbox/page.tsx` |
| `direction-a-dash-other.jsx` | `SaSDashCalendar`, `SaSDashKB` | `app/(dashboard)/kalender/page.tsx`, `app/(dashboard)/kb/page.tsx` |
| `direction-a-dash-extra.jsx` | `SaSDashOverview`, `SaSDashPasien`, `SaSDashDokter` | `app/(dashboard)/page.tsx`, `app/(dashboard)/pasien/[id]/page.tsx`, `app/(dashboard)/dokter/page.tsx` |

---

## 8) Things to NOT lose in translation

1. **Bahasa Indonesia** di semua copy. Saya sudah pakai BI di seluruh design — paste apa adanya.
2. **AI escalation card di chat patient** (`SaSPhoneChat` line ~140-160) — ini penting karena merefleksikan UU Praktik Kedokteran. Jangan dihilangkan.
3. **AIBadge** di setiap AI-generated content (smart reply, RAG answer, auto-tag, routing) — bikin user/staff transparan bahwa itu dari AI.
4. **Persona di sidebar** harus bisa swap berdasarkan role login (Pasien, Manager, Marketing, Receptionist, CS, Asdok, Admin). Sidebar nav items difilter berdasarkan permission per persona.
5. **Material Symbols `mi` class** di design — saat porting ke Lucide, jangan lupa pertahankan `filled` state (icon penuh untuk active nav item).

---

## 9) Files di bundle ini

```
design_handoff_sehati_a/
├── README.md                       ← file ini
├── design-reference/               ← prototype HTML/JSX asli (Direction A only)
│   ├── index.html
│   ├── styles.css
│   ├── data.js
│   ├── ui.jsx
│   ├── design-canvas.jsx
│   ├── android-frame.jsx
│   ├── direction-a-phone.jsx       ← Home + Chat
│   ├── direction-a-booking.jsx     ← Booking dokter
│   ├── direction-a-phone-extra.jsx ← Tiket + Riwayat + Profil
│   ├── direction-a-dash-inbox.jsx  ← Dash shell + Inbox
│   ├── direction-a-dash-other.jsx  ← Kalender + KB
│   └── direction-a-dash-extra.jsx  ← Overview + Pasien + Dokter
└── tokens/
    ├── globals.css.snippet         ← :root CSS variables (paste ke app/globals.css)
    └── tailwind.config.snippet.ts  ← extend section (merge ke tailwind.config.ts)
```

---

## 10) Quick test — verifikasi sebelum implement penuh

Sebelum kerjain seluruh dashboard, lakukan 30-menit smoke test:

1. Apply tokens (`globals.css` + `tailwind.config.ts`)
2. Pasang Plus Jakarta Sans di layout
3. Bikin satu halaman test: hanya **Dashboard Shell + Topbar + sebuah Card kosong** di `app/test/page.tsx`
4. Buka di browser — cek visual match dengan `design-reference/index.html` artboard "Inbox" (cukup chrome/shell-nya)
5. Kalau OK, baru lanjut Inbox content → screen lain

Kalau ada warna yang terlihat "off" — paling sering itu HSL conversion. Bandingkan dengan hex di tabel section 1 dan adjust.

---

## Selesai

Kalau Anda implementasi pakai Claude Code, kasih ke Claude:
1. File ini sebagai context (paste ke conversation)
2. Folder `design-reference/` di-attach
3. Suruh dia mulai dari **section 4 + 5.1** (shell), terus iterasi screen per screen.

Pertanyaan terbuka? Buka design HTML-nya, fokuskan kartu yang dimaksud, dan tanya saya kembali — saya bisa drill down ke detail piksel kapan saja.
