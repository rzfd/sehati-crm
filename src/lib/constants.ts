// lib/constants.ts
// ── Sehati CRM — Centralized constants ───────────────────

// ── Safety ───────────────────────────────────────────────
// Hard blocklist (substring, lowercase) → bypass AI langsung ke staff prioritas.
// Lebih baik over-escalate (false positive ke staff) daripada melewatkan darurat.
// Triage (Sonnet) tetap jaring untuk parafrase di luar daftar ini.
export const URGENT_KEYWORDS = [
  // Pernapasan
  "tidak bisa nafas", "tidak bisa napas", "tidak bisa bernafas", "tidak bisa bernapas",
  "susah nafas", "susah napas", "sulit bernafas", "sulit bernapas",
  "sesak parah", "sesak nafas", "sesak napas", "sesak berat",
  // Dada / jantung
  "dada sakit", "sakit dada", "nyeri dada", "dada terasa sakit", "dada sesak", "serangan jantung",
  // Neurologis
  "stroke", "kejang", "kejang-kejang", "lumpuh", "bicara pelo", "wajah perot", "mati rasa sebelah",
  // Penurunan kesadaran
  "pingsan", "mau pingsan", "tidak sadar", "tidak sadarkan diri", "hilang kesadaran",
  // Perdarahan
  "darah banyak", "muntah darah", "pendarahan hebat", "perdarahan hebat", "darah terus keluar",
  // Self-harm
  "ingin mengakhiri hidup", "mengakhiri hidup", "bunuh diri", "menyakiti diri sendiri",
  // Lain-lain akut
  "overdosis", "keracunan", "tersedak", "alergi parah", "anafilaksis", "luka bakar parah",
] as const;

// ── Colors (sync dengan tailwind.config.ts) ───────────────
export const COLORS = {
  teal:   "#1D9E75",
  blue:   "#185FA5",
  amber:  "#BA7517",
  red:    "#A32D2D",
  purple: "#534AB7",
  pink:   "#993556",
  gray:   "#888780",
} as const;

// ── Status ────────────────────────────────────────────────
export const CONVERSATION_STATUS = {
  OPEN:     "open",
  RESOLVED: "resolved",
  ARCHIVED: "archived",
} as const;

export const BOOKING_STATUS = {
  PENDING:   "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  NO_SHOW:   "no_show",
  CANCELLED: "cancelled",
} as const;

export const KB_STATUS = {
  DRAFT:     "draft",
  PUBLISHED: "published",
  ARCHIVED:  "archived",
} as const;

export const TASK_STATUS = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  IN_REVIEW:   "In Review",
  DONE:        "Done",
  BLOCKED:     "Blocked",
} as const;

// ── Roles ─────────────────────────────────────────────────
export const STAFF_ROLES = {
  ADMIN:             "admin",
  MANAGER:           "manager",
  RECEPTIONIST:      "receptionist",
  CUSTOMER_SERVICE:  "cs",
  DOCTOR_ASSISTANT:  "doctor_assistant",
  MARKETING:         "marketing",
} as const;

// ── AI Config ─────────────────────────────────────────────
export const AI_CONFIG = {
  // Models
  HAIKU:  "claude-haiku-4-5",
  SONNET: "claude-sonnet-4-6",

  // Thresholds
  // voyage-3-lite + input_type (document/query): similarity absolut rendah TAPI
  // separasi bersih — query relevan ~0.39–0.61, tak-relevan ~0.23. 0.40 ada di
  // celah itu: tangkap match relevan (termasuk slang/terse) & buang yang ngawur.
  // (Sebelum pakai input_type harus ~0.50; lihat memory kb_retrieval_threshold.)
  KB_SIMILARITY_THRESHOLD:  0.40,  // Minimum similarity untuk KB match
  CONFIDENCE_THRESHOLD:     0.75,  // Minimum confidence untuk auto-reply
  KB_TOP_K:                 3,     // Jumlah chunks yang di-retrieve

  // Voyage AI
  EMBEDDING_MODEL:    "voyage-3-lite",
  EMBEDDING_DIMS:     512,

  // Chunking
  CHUNK_SIZE:         800,   // Target token per chunk
  CHUNK_OVERLAP:      50,    // Token overlap antar chunks
} as const;

// ── Urgency Levels ────────────────────────────────────────
export const URGENCY_LEVEL = {
  1: "Rendah",
  2: "Sedang",
  3: "Tinggi",
  4: "Darurat",
} as const;

// ── Message Types ─────────────────────────────────────────
export const SENDER_TYPE = {
  PATIENT: "patient",
  STAFF:   "staff",
  AI_BOT:  "ai_bot",
} as const;

// ── Gatekeeper Actions ────────────────────────────────────
export const GATEKEEPER_ACTION = {
  AUTO_REPLY:      "auto_reply",
  ESCALATE:        "escalate",
  BOOKING_REQUEST: "booking_request",
} as const;

// ── Chat Categories ───────────────────────────────────────
export const CHAT_CATEGORY = {
  FAQ:       "faq",
  BOOKING:   "booking",
  MEDICAL:   "medical",
  URGENT:    "urgent",
  COMPLAINT: "complaint",
  UNCLEAR:   "unclear",
} as const;

// ── Specialties ───────────────────────────────────────────
export const DOCTOR_SPECIALTY = {
  UMUM:          "Umum",
  PENYAKIT_DALAM:"Penyakit Dalam",
  ANAK:          "Anak",
  OBGYN:         "Obgyn",
  BEDAH:         "Bedah",
  MATA:          "Mata",
  THT:           "THT",
  KULIT:         "Kulit & Kelamin",
  SARAF:         "Saraf",
  JANTUNG:       "Jantung & Pembuluh Darah",
} as const;

// ── Specialty detection hints ─────────────────────────────
export const SPECIALTY_HINTS: Record<string, string> = {
  // Penyakit Dalam
  "dada sakit":   "Penyakit Dalam",
  "hipertensi":   "Penyakit Dalam",
  "diabetes":     "Penyakit Dalam",
  "kencing manis":"Penyakit Dalam",
  "darah tinggi": "Penyakit Dalam",
  // Anak
  "anak demam":   "Anak",
  "bayi":         "Anak",
  "balita":       "Anak",
  "anak saya":    "Anak",
  // Obgyn
  "hamil":        "Obgyn",
  "kandungan":    "Obgyn",
  "telat haid":   "Obgyn",
  "usg":          "Obgyn",
  // Umum (default)
  "flu":          "Umum",
  "batuk":        "Umum",
  "sakit kepala": "Umum",
  "demam":        "Umum",
};

// ── App config ────────────────────────────────────────────
export const APP_CONFIG = {
  NAME:             "Sehati CRM",
  TAGLINE:          "AI-powered CRM untuk klinik Indonesia",
  SUPPORT_ESCAPE:   "staff",       // keyword pasien untuk bypass AI
  REALTIME_POLL_MS: 0,             // 0 = pakai Supabase Realtime (bukan polling)
  MAX_FILE_SIZE_MB: 10,            // max upload KB document
  ACCEPTED_MIME: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ],
} as const;

// ── Type helpers ──────────────────────────────────────────
export type StaffRole        = typeof STAFF_ROLES[keyof typeof STAFF_ROLES];
export type BookingStatus    = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];
export type KBStatus         = typeof KB_STATUS[keyof typeof KB_STATUS];
export type GatekeeperAction = typeof GATEKEEPER_ACTION[keyof typeof GATEKEEPER_ACTION];
export type ChatCategory     = typeof CHAT_CATEGORY[keyof typeof CHAT_CATEGORY];
export type SenderType       = typeof SENDER_TYPE[keyof typeof SENDER_TYPE];
export type DoctorSpecialty  = typeof DOCTOR_SPECIALTY[keyof typeof DOCTOR_SPECIALTY];
